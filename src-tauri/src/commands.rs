// src-tauri/src/commands.rs
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Manager, State};
use tokio::sync::Mutex as TokioMutex;
use tokio::time::{sleep, Duration};

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
    // Usar get_webview_window porque algunas versiones de AppHandle no exponen get_window.
    let splash = app
        .get_webview_window("splash")
        .ok_or_else(|| "Splash window not found".to_string())?;

    // Guard para evitar doble ejecución
    {
        let mut locked = init_state.is_initialized.lock().await;
        if *locked {
            // Si ya está inicializado, forzamos un evento final por si la UI lo necesita
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
        // anotamos el tipo explícito para ayudar al compilador
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
                        progress: 255,
                    },
                );
                // Liberamos candado para permitir reintento en casos donde quieras reintentar.
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

    // clonamos y anotamos el tipo explícitamente
    let db_for_server: Arc<TokioMutex<Database>> = db_state.inner().clone();
    tokio::spawn(async move {
        // start_server puede devolver un error; lo manejamos aquí e impedimos que el tipo quede ambiguo
        if let Err(e) = start_server(db_for_server).await {
            eprintln!("Error al iniciar servidor API: {}", e);
        }
    });

    // Pequeña espera para dar tiempo a que la UI procese eventos (opcional)
    sleep(Duration::from_millis(300)).await;

    splash
        .emit(
            "splash-update",
            SplashPayload {
                message: "Interfaz lista".into(),
                progress: 100,
            },
        )
        .map_err(|e: tauri::Error| e.to_string())?;

    Ok("ready".into())
}

#[tauri::command]
pub async fn check_health() -> Result<String, String> {
    Ok("OK".to_string())
}

#[tauri::command]
pub fn close_splash(app: AppHandle) {
    // También aquí usar get_webview_window (mismas razones que arriba)
    if let Some(splash) = app.get_webview_window("splash") {
        let _ = splash.close();
    }
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.show();
        let _ = main.set_focus();
    }
}