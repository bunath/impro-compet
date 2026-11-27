# Architecture

```
src/
  app/          App + choix de fenêtre (régie / spectateur)
  pages/        un écran = une page (Splash, Download, Welcome, Auth, Packs, Setup, Console, Spectator)
  components/   ui/ (kit), splash/, console/ (régie), spectator/ (rendu 1920×1080)
  services/     api (serveur), configs (sauvegarde + file d'attente), files, windows, updater
  store/        zustand : appStore (nav, compte), libraryStore (pack, config), matchStore (live), updateStore
  hooks/        useNow, useFitScale, useServerStatus, useBusState (sync régie ↔ spectateur)
  lib/          logique pure et testée : clock, match (règle des fautes), serverHours, exportMatch, bus, types
src-tauri/      Rust : plugins (http, fs, dialog, log, updater, process), capabilities
```

## Flux de données

- **Offline-first** : tout est lisible/modifiable en local (localStorage via zustand `persist`).
- **Serveur (22h–7h, Europe/Paris)** : `services/api.ts` refuse d'appeler hors horaires (`ServerClosedError`) ;
  les sauvegardes d'un utilisateur connecté vont dans `libraryStore.pending` et partent via `startSyncLoop()`
  (toutes les 30 s + événement `online`) dès que le serveur est ouvert.
- **Transport** : exclusivement HTTPS vers l'URL Tailscale Funnel (`appStore.serverUrl`), via `@tauri-apps/plugin-http`
  (pas de CORS). Capability limitée à `*.ts.net`.
- **Double écran** : la régie publie `LiveState` sur le bus (`lib/bus.ts`, événements Tauri) à chaque changement ;
  la fenêtre spectateur (`?view=spectator`) écoute et demande l'état à l'ouverture (`ready`).
  Les chronos transmettent `startedAt` + `remainingMs` : chaque fenêtre calcule l'affichage localement (pas de flux à 60 Hz).
- **Mode surprise** : l'état contient les vrais points ; seul le rendu spectateur affiche « ? ».
- **Mises à jour** : vérification au lancement (build release), installation uniquement sur clic.

## Modèle de données (src/lib/types.ts)

User · Team · Category · TimePreset · MessagePreset · ResourcePack · MatchConfig · LiveState · MatchExport.

## Prévu, NON codé en V1

- **Vue spectateur en réseau local via navigateur web** : `SpectatorScreen` est un rendu pur
  (`live` + `now`), il pourra être servi tel quel par un petit serveur HTTP/WebSocket local
  qui relaie le bus. Aucune dépendance Tauri dans ce composant.
