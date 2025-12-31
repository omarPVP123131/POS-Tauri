use axum::{Json, extract::State};
use serde::{Deserialize, Serialize};
use crate::api::AppState;
use crate::models::{ApiResponse, User};

#[derive(Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub user: User,
    pub token: String,
}

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Json<ApiResponse<LoginResponse>> {
    let db = state.db.lock().await;
    
    println!("🔐 Login attempt for user: {}", payload.username);
    
    // Query user
    let result: Result<(String, String, String, String, String, String, String, i32), sqlx::Error> = sqlx::query_as(
        "SELECT id, username, email, password_hash, full_name, phone, role_id, is_active FROM users WHERE username = ?"
    )
    .bind(&payload.username)
    .fetch_one(db.pool())
    .await;

    match result {
        Ok((id, username, email, password_hash, full_name, phone, role_id, is_active)) => {
            println!("✅ User found: {}", username);
            
            // Verify password
            match bcrypt::verify(&payload.password, &password_hash) {
                Ok(valid) if valid => {
                    println!("✅ Password valid");
                    
                    let user = User {
                        id: id.clone(),
                        username,
                        email,
                        full_name,
                        phone: if phone.is_empty() { None } else { Some(phone) },
                        role_id,
                        is_active: is_active == 1,
                        photo_url: None,
                    };

                    // Generate token (simplified - in production use JWT)
                    let token = format!("token_{}", id);

                    Json(ApiResponse {
                        success: true,
                        data: Some(LoginResponse { user, token }),
                        message: Some("Login exitoso".to_string()),
                    })
                }
                Ok(_) => {
                    println!("❌ Invalid password");
                    Json(ApiResponse {
                        success: false,
                        data: None,
                        message: Some("Credenciales inválidas".to_string()),
                    })
                }
                Err(e) => {
                    println!("❌ Password verification error: {}", e);
                    Json(ApiResponse {
                        success: false,
                        data: None,
                        message: Some("Error al verificar contraseña".to_string()),
                    })
                }
            }
        }
        Err(e) => {
            println!("❌ User not found: {}", e);
            Json(ApiResponse {
                success: false,
                data: None,
                message: Some("Usuario no encontrado".to_string()),
            })
        }
    }
}