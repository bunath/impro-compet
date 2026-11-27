# Configuration du serveur (à faire une fois)

Le serveur de référence est dans `server/` : Node 22+, **zéro dépendance** (SQLite intégré), il implémente
exactement `docs/server-api.md` (comptes, emails Brevo, packs, configs). Testé en local : inscription → validation
→ connexion → configs → mot de passe oublié → blocage hors 22h–7h.

## 1. Machine (Debian / Ubuntu)

```bash
# Node 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Utilisateur + fichiers
sudo useradd --system --home /opt/impro-regie impro
sudo mkdir -p /opt/impro-regie /var/lib/impro-regie
sudo cp -r server /opt/impro-regie/            # le dossier server/ du projet
sudo cp -r server/data/packs /var/lib/impro-regie/packs   # pack "base" et futurs packs
sudo chown -R impro: /var/lib/impro-regie
```

## 2. Tailscale Funnel

1. Installer Tailscale sur la machine et la connecter : `sudo tailscale up`.
2. Console d'admin Tailscale → **DNS** : activer **MagicDNS** et **HTTPS Certificates**.
3. Console d'admin → **Access controls** : autoriser Funnel (ajouter dans `nodeAttrs`) :
   ```json
   "nodeAttrs": [{ "target": ["autogroup:member"], "attr": ["funnel"] }]
   ```
4. Autoriser ton utilisateur à piloter Tailscale sans root (pour les timers) : `sudo tailscale set --operator=$USER`
   (ou lancer les services en root).
5. Tester : `tailscale funnel --bg 8787` puis `tailscale funnel status`. L'URL est
   `https://<machine>.<tailnet>.ts.net` → c'est elle qu'on met dans l'app. `tailscale funnel reset` pour fermer.

## 3. Brevo (emails)

1. Créer un compte sur brevo.com (gratuit : 300 emails/jour).
2. **Senders, Domains & Dedicated IPs** : ajouter et **valider** l'adresse d'envoi (idéal : un domaine à toi avec
   les enregistrements SPF/DKIM/DMARC que Brevo fournit, sinon les emails finissent en spam).
3. **SMTP & API → API Keys** : créer une clé v3 et la copier.
4. Elle va dans `BREVO_API_KEY` ci-dessous. Elle reste **sur le serveur uniquement**, jamais dans l'app.

## 4. Variables d'environnement

```bash
sudo cp server/.env.example /etc/impro-regie.env
sudo nano /etc/impro-regie.env    # PUBLIC_URL, BREVO_API_KEY, MAIL_FROM_EMAIL
sudo chmod 600 /etc/impro-regie.env
```

## 5. Services systemd

```bash
sudo cp server/deploy/*.service server/deploy/*.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now impro-server.service
# Funnel ouvert uniquement de 22h à 7h (Paris) :
sudo systemctl enable --now impro-funnel-open.timer impro-funnel-close.timer
```

Si le Funnel est ouvert hors horaires par erreur, `ENFORCE_HOURS=1` fait quand même répondre le serveur en 503.
Vérifier : `curl https://<machine>.<tailnet>.ts.net/health` → `{"ok":true,"open":true}` entre 22h et 7h.

## 6. Dans l'application

Écran de connexion → champ **URL du serveur** → coller l'URL Funnel. (Pour la figer dans le build :
`DEFAULT_SERVER_URL` dans `src/store/appStore.ts`.) Elle doit finir par `.ts.net` (autorisation réseau de l'app).

## À savoir

- Les liens des emails (validation 72 h, mot de passe oublié 2 h) ne s'ouvrent que **pendant les horaires** du serveur.
- Les packs sont publics ; les comptes et configurations sont privés (jeton de session 30 jours).
- Sauvegarde : copier `/var/lib/impro-regie/impro.db` (ex. `sqlite3 impro.db ".backup sauvegarde.db"` en cron).
- Ajouter un pack : déposer `monpack.json` (format `ResourcePack`, `id` = nom du fichier) dans `/var/lib/impro-regie/packs/`.
- Funnel est un accès public sur Internet : le serveur limite les tentatives de connexion et la taille des requêtes,
  mais garde des mots de passe forts et mets à jour la machine.
