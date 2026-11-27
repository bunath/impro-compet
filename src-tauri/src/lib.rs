use tauri_plugin_log::{Target, TargetKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // En release Windows il n'y a pas de console : on garde la trace d'un crash dans %TEMP%.
    std::panic::set_hook(Box::new(|info| {
        let path = std::env::temp_dir().join("impro-regie-crash.log");
        let _ = std::fs::write(path, format!("{info}"));
    }));

    tauri::Builder::default()
        // Logs Rust -> terminal (pnpm tauri dev) + console DevTools.
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(log::LevelFilter::Debug)
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                ])
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            // Updater : enregistré ici pour qu'une config absente (build sans clé de signature)
            // désactive juste les mises à jour au lieu de faire planter l'app au démarrage.
            #[cfg(all(desktop, not(debug_assertions)))]
            if let Err(e) = app
                .handle()
                .plugin(tauri_plugin_updater::Builder::new().build())
            {
                log::warn!("mises à jour automatiques désactivées : {e}");
            }

            // Console de debug (DevTools) ouverte automatiquement avec `pnpm tauri dev`.
            #[cfg(debug_assertions)]
            {
                use tauri::Manager;
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("erreur au lancement de l'application");
}
