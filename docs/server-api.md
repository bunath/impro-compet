# Contrat d'API attendu du serveur (non fourni en V1)

Base : URL Tailscale Funnel. JSON partout. `Authorization: Bearer <token>` hors `/auth/*`.

| Méthode | Route                          | Corps / réponse                                                         |
| ------- | ------------------------------ | ----------------------------------------------------------------------- |
| POST    | `/auth/register`               | `{username,email,password}` → `{ok:true}` + email de validation (Brevo) |
| GET     | lien email                     | validation du compte (compte inactif tant que non validé)               |
| POST    | `/auth/login`                  | `{username,password}` → `{user,token}` (refuser si email non validé)    |
| POST    | `/auth/forgot`                 | `{email}` → `{ok:true}` (réponse identique que le compte existe ou non) |
| GET     | `/packs` (public)              | `[{id,name,description,version}]`                                       |
| GET     | `/packs/:id/download` (public) | `ResourcePack` (envoyer `Content-Length` pour la barre de progression)  |
| GET     | `/configs`                     | `MatchConfig[]` de l'utilisateur                                        |
| PUT     | `/configs/:id`                 | `MatchConfig` (upsert)                                                  |

**Brevo** : la clé API reste côté serveur (jamais dans l'app). Templates : validation, mot de passe oublié.
Le pack `base` doit exister (`/packs/base/download`).

Implémentation de référence : `server/` — mise en place : `docs/server-setup.md`.
