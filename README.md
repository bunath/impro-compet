# Impro Régie

Régie de match d'improvisation : écran de contrôle + vue spectateur sur 2ᵉ écran. Tauri 2 + React + TypeScript, pnpm.

## Démarrer

Prérequis : Node 22+, Rust stable, [dépendances système Tauri](https://v2.tauri.app/start/prerequisites/).

```bash
corepack enable pnpm
pnpm install
pnpm format          # une fois, avant le premier commit
pnpm tauri icon src-tauri/icons/app-icon.png   # génère le jeu d'icônes complet
pnpm tauri dev       # ouvre l'app + la console DevTools ; les logs JS et Rust s'affichent aussi dans le terminal
```

| Commande | Rôle |
|---|---|
| `pnpm tauri dev` | Dev (DevTools ouvertes automatiquement) |
| `pnpm tauri build` | Installeurs |
| `pnpm lint` / `typecheck` / `test` / `format:check` | Vérifs CI |

## Configuration

- URL du serveur : `DEFAULT_SERVER_URL` dans `src/store/appStore.ts` (URL Tailscale Funnel) et `src-tauri/capabilities/default.json` (`*.ts.net`).
- Auto-update : `pnpm tauri signer generate`, clé publique dans `src-tauri/tauri.release.conf.json`
  (+ `OWNER/REPO` dans l'endpoint), clé privée dans les secrets GitHub `TAURI_SIGNING_PRIVATE_KEY(_PASSWORD)`.
  Publier = pousser un tag `vX.Y.Z`.

Voir `docs/architecture.md`, `docs/server-api.md` et **`docs/server-setup.md`** (serveur, Tailscale Funnel, Brevo).
