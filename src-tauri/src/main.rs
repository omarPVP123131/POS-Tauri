// src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
mod db;
mod models;
mod commands;

use db::Database;
use std::sync::Arc;
use tokio::sync::Mutex;
use commands::AppInitState;

#[tokio::main]
async fn main() {
    println!("🚀 Iniciando aplicación POS...");

    println!("📦 Inicializando pool de base de datos...");
    let db = match Database::new().await {
        Ok(db) => {
            println!("✅ Conexión a BD establecida");
            db
        }
        Err(e) => {
            eprintln!("❌ Error al conectar base de datos: {}", e);
            return;
        }
    };
    let db_state = Arc::new(Mutex::new(db));

    println!("🖥️  Iniciando aplicación Tauri...");
    tauri::Builder::default()
        .manage(db_state)
        // Manejar el estado de inicialización con Arc<Mutex<bool>>
        .manage(AppInitState { is_initialized: Arc::new(Mutex::new(false)) })
        .invoke_handler(tauri::generate_handler![
            commands::init_app,
            commands::check_health,
            commands::close_splash,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
