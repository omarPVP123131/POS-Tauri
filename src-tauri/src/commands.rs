// src-tauri/src/commands.rs
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Manager, State, Window};
use tokio::sync::Mutex as TokioMutex;
use tokio::time::{sleep, Duration, Instant};
use rand::Rng;

use crate::api::start_server;
use crate::db::Database;

/// Estado global para evitar doble inicialización.
pub struct AppInitState {
    pub is_initialized: Arc<TokioMutex<bool>>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SplashPayload {
    pub message: String,
    pub progress: u8,
}

#[tauri::command]
pub async fn init_app(
    app: AppHandle,
    db_state: State<'_, Arc<TokioMutex<Database>>>,
    init_state: State<'_, AppInitState>,
) -> Result<String, String> {
    // Marca inicio para garantizar mínimo tiempo de splash
    let started_at = Instant::now();

    // Duración aleatoria entre 3000 y 6000 ms (en debug la hacemos corta)
    let min_wait = if cfg!(debug_assertions) {
        Duration::from_millis(300)
    } else {
        let mut rng = rand::rng();
        Duration::from_millis(rng.random_range(3000..=6000))
    };

    let splash = app
        .get_webview_window("splash")
        .ok_or_else(|| "Splash window not found".to_string())?;

    // Guard para evitar doble ejecución
    {
        let mut locked = init_state.is_initialized.lock().await;
        if *locked {
            let _ = splash.emit(
                "splash-update",
                SplashPayload {
                    message: "Interfaz lista".into(),
                    progress: 100,
                },
            );
            return Ok("ready".into());
        }
        *locked = true;
    }

    // Emitir estado inicial
    splash
        .emit(
            "splash-update",
            SplashPayload {
                message: "Inicializando base de datos...".into(),
                progress: 10,
            },
        )
        .map_err(|e: tauri::Error| e.to_string())?;

    // Ejecutar migraciones (bloqueamos solo mientras corren)
    {
        let db_arc: Arc<TokioMutex<Database>> = db_state.inner().clone();
        let db_lock = db_arc.lock().await;

        splash
            .emit(
                "splash-update",
                SplashPayload {
                    message: "Ejecutando migraciones...".into(),
                    progress: 30,
                },
            )
            .map_err(|e: tauri::Error| e.to_string())?;

        match db_lock.run_migrations().await {
            Ok(_) => {
                let _ = splash.emit(
                    "splash-update",
                    SplashPayload {
                        message: "Migraciones completadas".into(),
                        progress: 50,
                    },
                );
            }
            Err(e) => {
                let msg = format!("Error en migraciones: {}", e);
                let _ = splash.emit(
                    "splash-update",
                    SplashPayload {
                        message: msg.clone(),
                        progress: 255, // 255 indica error
                    },
                );
                // Liberamos candado para permitir reintento
                let mut locked = init_state.is_initialized.lock().await;
                *locked = false;
                return Err(msg);
            }
        }
    }

    // Levantar servidor API (en background)
    splash
        .emit(
            "splash-update",
            SplashPayload {
                message: "Levantando servidor API...".into(),
                progress: 70,
            },
        )
        .map_err(|e: tauri::Error| e.to_string())?;

    let db_for_server: Arc<TokioMutex<Database>> = db_state.inner().clone();
    tokio::spawn(async move {
        if let Err(e) = start_server(db_for_server).await {
            eprintln!("Error al iniciar servidor API: {}", e);
        }
    });

    // Pequeña espera opcional para que la UI procese eventos
    sleep(Duration::from_millis(300)).await;

    // Asegurarnos de que haya pasado el tiempo mínimo del splash
    let elapsed = started_at.elapsed();
    if elapsed < min_wait {
        sleep(min_wait - elapsed).await;
    }

    splash
        .emit(
            "splash-update",
            SplashPayload {
                message: "Interfaz lista".into(),
                progress: 100,
            },
        )
        .ok();

    println!("✅ Inicialización backend completada");
    
    // NO CERRAMOS EL SPLASH AQUÍ
    // Dejamos que el frontend lo cierre cuando React esté listo
    
    Ok("ready".into())
}

#[tauri::command]
pub async fn check_health() -> Result<String, String> {
    Ok("OK".to_string())
}

#[tauri::command]
pub fn close_splash(app: AppHandle) {
    if let Some(splash) = app.get_webview_window("splash") {
        let _ = splash.close();
    }
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.show();
        let _ = main.set_focus();
    }
}

#[tauri::command]
pub async fn toggle_fullscreen(window: Window) -> Result<bool, String> {
    let is_fullscreen = window.is_fullscreen().map_err(|e| e.to_string())?;
    window
        .set_fullscreen(!is_fullscreen)
        .map_err(|e| e.to_string())?;
    Ok(!is_fullscreen)
}