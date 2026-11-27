// Serveur Impro Régie — Node 22+, aucune dépendance (node:sqlite, node:http, fetch).
// Contrat d'API : voir ../docs/server-api.md
import { DatabaseSync } from 'node:sqlite';
import { createServer } from 'node:http';
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const env = process.env;
const PORT = Number(env.PORT ?? 8787);
const PUBLIC_URL = (env.PUBLIC_URL ?? `http://localhost:${PORT}`).replace(/\/+$/, '');
const DATA_DIR = env.DATA_DIR ?? './data';
const ENFORCE_HOURS = env.ENFORCE_HOURS !== '0';
const BREVO_API_KEY = env.BREVO_API_KEY ?? '';
const MAIL_FROM_EMAIL = env.MAIL_FROM_EMAIL ?? '';
const MAIL_FROM_NAME = env.MAIL_FROM_NAME ?? 'Impro Régie';
const SESSION_DAYS = 30;
const VERIFY_HOURS = 72;
const RESET_HOURS = 2;

mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(join(DATA_DIR, 'impro.db'));
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    pass_hash TEXT NOT NULL,
    verified INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS tokens (
    hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS configs (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    json TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (id, user_id)
  );
`);

// ---------- utilitaires ----------
const sha = (s) => createHash('sha256').update(s).digest('hex');
const now = () => Date.now();

function hashPassword(pw) {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('base64')}$${scryptSync(pw, salt, 64).toString('base64')}`;
}
function checkPassword(pw, stored) {
  const [, salt, hash] = stored.split('$');
  const a = scryptSync(pw, Buffer.from(salt, 'base64'), 64);
  const b = Buffer.from(hash, 'base64');
  return a.length === b.length && timingSafeEqual(a, b);
}
function issueToken(userId, kind, ttlMs) {
  const token = randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO tokens (hash,user_id,kind,expires_at) VALUES (?,?,?,?)').run(
    sha(token), userId, kind, now() + ttlMs,
  );
  return token;
}
function consumeToken(token, kind, { keep = false } = {}) {
  const row = db.prepare('SELECT * FROM tokens WHERE hash=? AND kind=?').get(sha(token ?? ''), kind);
  if (!row || row.expires_at < now()) return null;
  if (!keep) db.prepare('DELETE FROM tokens WHERE hash=?').run(row.hash);
  return row.user_id;
}

/** Horaires d'ouverture : 22h → 7h, heure de Paris (identique au client). */
function isOpen(date = new Date()) {
  const h = Number(
    new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Europe/Paris' })
      .formatToParts(date).find((p) => p.type === 'hour')?.value ?? 0,
  );
  return h >= 22 || h < 7;
}

const hits = new Map();
function limited(key, max = 10, windowMs = 15 * 60_000) {
  const t = now();
  const arr = (hits.get(key) ?? []).filter((x) => t - x < windowMs);
  arr.push(t);
  hits.set(key, arr);
  return arr.length > max;
}

async function sendMail(to, subject, html) {
  if (!BREVO_API_KEY || !MAIL_FROM_EMAIL) {
    console.log(`[mail:dev] à ${to} — ${subject}\n${html}\n`);
    return;
  }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: MAIL_FROM_NAME, email: MAIL_FROM_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) console.error('[brevo]', res.status, await res.text());
}

const page = (title, body) =>
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<body style="font:15px system-ui;background:#0a0b0f;color:#e8eaf0;display:grid;place-items:center;min-height:100vh;margin:0">
<main style="max-width:380px;padding:24px;background:#111319;border:1px solid #242836;border-radius:10px">${body}</main></body>`;

const json = (res, status, data, headers = {}) => {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body), ...headers });
  res.end(body);
};
const html = (res, status, content) => {
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8' });
  res.end(content);
};

async function readJson(req, max = 1_000_000) {
  let size = 0;
  const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > max) throw Object.assign(new Error('Corps trop gros'), { status: 413 });
    chunks.push(c);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString() || '{}');
  } catch {
    throw Object.assign(new Error('JSON invalide'), { status: 400 });
  }
}
const fail = (status, message) => Object.assign(new Error(message), { status });

function authUser(req) {
  const token = (req.headers.authorization ?? '').replace(/^Bearer /, '');
  const userId = token && consumeToken(token, 'session', { keep: true });
  if (!userId) throw fail(401, 'Non connecté');
  return db.prepare('SELECT id,username,email FROM users WHERE id=?').get(userId);
}

// ---------- packs ----------
const packsDir = join(DATA_DIR, 'packs');
const packFile = (id) => (/^[a-z0-9-]+$/.test(id) ? join(packsDir, `${id}.json`) : null);

// ---------- routes ----------
async function handle(req, res) {
  const url = new URL(req.url, PUBLIC_URL);
  const { pathname: path } = url;
  const method = req.method;
  const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress).split(',')[0].trim();

  if (path === '/health') return json(res, 200, { ok: true, open: isOpen() });
  if (ENFORCE_HOURS && !isOpen()) return json(res, 503, { error: 'Serveur disponible de 22h à 7h.' });

  // --- auth ---
  if (method === 'POST' && path === '/auth/register') {
    if (limited(`reg:${ip}`, 5)) throw fail(429, 'Trop de tentatives, réessaie plus tard.');
    const { username, email, password } = await readJson(req);
    if (!/^[A-Za-z0-9_.-]{3,24}$/.test(username ?? '')) throw fail(400, 'Nom d’utilisateur invalide (3–24 caractères : lettres, chiffres, _ . -).');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email ?? '')) throw fail(400, 'Email invalide.');
    if (typeof password !== 'string' || password.length < 8) throw fail(400, 'Mot de passe : 8 caractères minimum.');
    const id = randomUUID();
    try {
      db.prepare('INSERT INTO users (id,username,email,pass_hash,verified,created_at) VALUES (?,?,?,?,0,?)')
        .run(id, username, email, hashPassword(password), now());
    } catch {
      throw fail(409, 'Nom d’utilisateur ou email déjà utilisé.');
    }
    const token = issueToken(id, 'verify', VERIFY_HOURS * 3_600_000);
    await sendMail(email, 'Valide ton compte Impro Régie',
      `<p>Bienvenue ${username} !</p><p><a href="${PUBLIC_URL}/auth/verify?token=${token}">Activer mon compte</a></p><p>Lien valable ${VERIFY_HOURS} h (le serveur n’est joignable que de 22h à 7h).</p>`);
    return json(res, 201, { ok: true });
  }

  if (method === 'GET' && path === '/auth/verify') {
    const userId = consumeToken(url.searchParams.get('token'), 'verify');
    if (!userId) return html(res, 400, page('Lien invalide', '<h2>Lien invalide ou expiré</h2><p>Refais une inscription ou demande un nouveau lien.</p>'));
    db.prepare('UPDATE users SET verified=1 WHERE id=?').run(userId);
    return html(res, 200, page('Compte activé', '<h2>Compte activé ✓</h2><p>Tu peux retourner dans l’application et te connecter.</p>'));
  }

  if (method === 'POST' && path === '/auth/login') {
    if (limited(`login:${ip}`, 10)) throw fail(429, 'Trop de tentatives, réessaie plus tard.');
    const { username, password } = await readJson(req);
    const user = db.prepare('SELECT * FROM users WHERE username=?').get(username ?? '');
    if (!user || !checkPassword(String(password ?? ''), user.pass_hash)) throw fail(401, 'Identifiants invalides.');
    if (!user.verified) throw fail(403, 'Compte non activé : clique sur le lien reçu par email.');
    const token = issueToken(user.id, 'session', SESSION_DAYS * 86_400_000);
    return json(res, 200, { user: { id: user.id, username: user.username, email: user.email }, token });
  }

  if (method === 'POST' && path === '/auth/forgot') {
    if (limited(`forgot:${ip}`, 5)) throw fail(429, 'Trop de tentatives, réessaie plus tard.');
    const { email } = await readJson(req);
    const user = db.prepare('SELECT * FROM users WHERE email=? AND verified=1').get(email ?? '');
    if (user) {
      const token = issueToken(user.id, 'reset', RESET_HOURS * 3_600_000);
      await sendMail(user.email, 'Réinitialiser ton mot de passe',
        `<p><a href="${PUBLIC_URL}/auth/reset?token=${token}">Choisir un nouveau mot de passe</a></p><p>Lien valable ${RESET_HOURS} h.</p>`);
    }
    return json(res, 200, { ok: true }); // réponse identique, que le compte existe ou non
  }

  if (method === 'GET' && path === '/auth/reset') {
    const token = url.searchParams.get('token') ?? '';
    return html(res, 200, page('Nouveau mot de passe', `<h2>Nouveau mot de passe</h2>
<input id="p" type="password" minlength="8" placeholder="8 caractères minimum" style="width:100%;padding:8px;margin:8px 0;box-sizing:border-box">
<button id="b" style="padding:8px 14px">Valider</button><p id="m"></p>
<script>b.onclick=async()=>{const r=await fetch('/auth/reset',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:${JSON.stringify(token)},password:p.value})});m.textContent=r.ok?'Mot de passe modifié ✓ — retourne dans l’application.':(await r.json()).error}</script>`));
  }

  if (method === 'POST' && path === '/auth/reset') {
    const { token, password } = await readJson(req);
    if (typeof password !== 'string' || password.length < 8) throw fail(400, 'Mot de passe : 8 caractères minimum.');
    const userId = consumeToken(token, 'reset');
    if (!userId) throw fail(400, 'Lien invalide ou expiré.');
    db.prepare('UPDATE users SET pass_hash=? WHERE id=?').run(hashPassword(password), userId);
    db.prepare("DELETE FROM tokens WHERE user_id=? AND kind='session'").run(userId); // déconnecte les anciennes sessions
    return json(res, 200, { ok: true });
  }

  // --- packs (publics) ---
  if (method === 'GET' && path === '/packs') {
    const list = existsSync(packsDir)
      ? readdirSync(packsDir).filter((f) => f.endsWith('.json')).map((f) => {
          const { id, name, description, version } = JSON.parse(readFileSync(join(packsDir, f), 'utf8'));
          return { id, name, description, version };
        })
      : [];
    return json(res, 200, list);
  }
  const packMatch = path.match(/^\/packs\/([^/]+)\/download$/);
  if (method === 'GET' && packMatch) {
    // Packs publics (contenu générique) : téléchargés au premier lancement, avant toute connexion.
    const file = packFile(packMatch[1]);
    if (!file || !existsSync(file)) throw fail(404, 'Pack introuvable');
    const body = readFileSync(file);
    res.writeHead(200, { 'content-type': 'application/json', 'content-length': body.length });
    return res.end(body);
  }

  // --- configs ---
  if (method === 'GET' && path === '/configs') {
    const user = authUser(req);
    const rows = db.prepare('SELECT json FROM configs WHERE user_id=? ORDER BY updated_at DESC').all(user.id);
    return json(res, 200, rows.map((r) => JSON.parse(r.json)));
  }
  const cfgMatch = path.match(/^\/configs\/([A-Za-z0-9-]{1,64})$/);
  if (cfgMatch && method === 'PUT') {
    const user = authUser(req);
    const body = await readJson(req, 200_000);
    if (body.id !== cfgMatch[1] || !Array.isArray(body.teams)) throw fail(400, 'Configuration invalide.');
    db.prepare(`INSERT INTO configs (id,user_id,json,updated_at) VALUES (?,?,?,?)
      ON CONFLICT(id,user_id) DO UPDATE SET json=excluded.json, updated_at=excluded.updated_at`)
      .run(body.id, user.id, JSON.stringify(body), now());
    return json(res, 200, { ok: true });
  }
  if (cfgMatch && method === 'DELETE') {
    const user = authUser(req);
    db.prepare('DELETE FROM configs WHERE id=? AND user_id=?').run(cfgMatch[1], user.id);
    return json(res, 200, { ok: true });
  }

  throw fail(404, 'Route inconnue');
}

createServer((req, res) => {
  handle(req, res).catch((e) => {
    const status = e.status ?? 500;
    if (status === 500) console.error(e);
    if (!res.headersSent) json(res, status, { error: status === 500 ? 'Erreur serveur' : e.message });
  });
}).listen(PORT, '127.0.0.1', () => console.log(`Impro Régie server — http://127.0.0.1:${PORT} — public : ${PUBLIC_URL}`));

setInterval(() => db.prepare('DELETE FROM tokens WHERE expires_at < ?').run(now()), 3_600_000).unref();
