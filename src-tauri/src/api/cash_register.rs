use axum::{Json, extract::{State, Path}};
use serde::{Deserialize, Serialize};
use crate::api::AppState;
use crate::models::ApiResponse;

#[derive(Serialize)]
pub struct CashRegister {
    pub id: String,
    pub name: String,
    pub location: Option<String>,
    pub is_active: bool,
}

#[derive(Serialize)]
pub struct Shift {
    pub id: String,
    pub user_id: String,
    pub user_name: String,
    pub register_id: String,
    pub register_name: String,
    pub opened_at: String,
    pub closed_at: Option<String>,
    pub opening_balance: f64,
    pub closing_balance: Option<f64>,
    pub expected_balance: Option<f64>,
    pub difference: Option<f64>,
    pub notes: Option<String>,
    pub status: String,
}

#[derive(Deserialize)]
pub struct OpenShiftRequest {
    pub user_id: String,
    pub register_id: String,
    pub opening_balance: f64,
}

#[derive(Deserialize)]
pub struct CloseShiftRequest {
    pub closing_balance: f64,
    pub notes: Option<String>,
}

#[derive(Serialize)]
pub struct ShiftSummary {
    pub shift: Shift,
    pub total_sales: f64,
    pub total_transactions: i32,
    pub cash_sales: f64,
    pub card_sales: f64,
    pub other_sales: f64,
}

pub async fn list_registers(
    State(state): State<AppState>,
) -> Json<ApiResponse<Vec<CashRegister>>> {
    let db = state.db.lock().await;
    
    let result: Result<Vec<(String, String, String, i32)>, sqlx::Error> = 
        sqlx::query_as(
            "SELECT id, name, COALESCE(location, ''), is_active FROM cash_registers ORDER BY name"
        )
        .fetch_all(db.pool())
        .await;

    match result {
        Ok(rows) => {
            let registers: Vec<CashRegister> = rows
                .into_iter()
                .map(|(id, name, location, is_active)| CashRegister {
                    id,
                    name,
                    location: if location.is_empty() { None } else { Some(location) },
                    is_active: is_active == 1,
                })
                .collect();

            Json(ApiResponse {
                success: true,
                data: Some(registers),
                message: None,
            })
        }
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some(format!("Error: {}", e)),
        }),
    }
}

pub async fn open_shift(
    State(state): State<AppState>,
    Json(payload): Json<OpenShiftRequest>,
) -> Json<ApiResponse<Shift>> {
    let db = state.db.lock().await;
    
    // Check if user already has an open shift
    let existing: Result<(String,), sqlx::Error> = sqlx::query_as(
        "SELECT id FROM shifts WHERE user_id = ? AND status = 'open'"
    )
    .bind(&payload.user_id)
    .fetch_one(db.pool())
    .await;

    if existing.is_ok() {
        return Json(ApiResponse {
            success: false,
            data: None,
            message: Some("Ya tienes un turno abierto".to_string()),
        });
    }

    let shift_id = uuid::Uuid::new_v4().to_string();
    
    let result = sqlx::query(
        r#"
        INSERT INTO shifts (id, user_id, register_id, opened_at, opening_balance, status, created_at)
        VALUES (?, ?, ?, datetime('now'), ?, 'open', datetime('now'))
        "#
    )
    .bind(&shift_id)
    .bind(&payload.user_id)
    .bind(&payload.register_id)
    .bind(payload.opening_balance)
    .execute(db.pool())
    .await;

    match result {
        Ok(_) => {
            // Fetch the created shift with user and register names
            let shift_data: Result<(String, String, String, String, String, String, f64, String), sqlx::Error> = 
                sqlx::query_as(
                    r#"
                    SELECT s.id, s.user_id, u.full_name, s.register_id, r.name, s.opened_at, s.opening_balance, s.status
                    FROM shifts s
                    JOIN users u ON s.user_id = u.id
                    JOIN cash_registers r ON s.register_id = r.id
                    WHERE s.id = ?
                    "#
                )
                .bind(&shift_id)
                .fetch_one(db.pool())
                .await;

            match shift_data {
                Ok((id, user_id, user_name, register_id, register_name, opened_at, opening_balance, status)) => {
                    let shift = Shift {
                        id,
                        user_id,
                        user_name,
                        register_id,
                        register_name,
                        opened_at,
                        closed_at: None,
                        opening_balance,
                        closing_balance: None,
                        expected_balance: None,
                        difference: None,
                        notes: None,
                        status,
                    };

                    Json(ApiResponse {
                        success: true,
                        data: Some(shift),
                        message: Some("Turno abierto exitosamente".to_string()),
                    })
                }
                Err(e) => Json(ApiResponse {
                    success: false,
                    data: None,
                    message: Some(format!("Error: {}", e)),
                }),
            }
        }
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some(format!("Error al abrir turno: {}", e)),
        }),
    }
}

pub async fn close_shift(
    State(state): State<AppState>,
    Path(shift_id): Path<String>,
    Json(payload): Json<CloseShiftRequest>,
) -> Json<ApiResponse<ShiftSummary>> {
    let db = state.db.lock().await;
    
    // Get shift data
    let shift_data: Result<(f64,), sqlx::Error> = sqlx::query_as(
        "SELECT opening_balance FROM shifts WHERE id = ? AND status = 'open'"
    )
    .bind(&shift_id)
    .fetch_one(db.pool())
    .await;

    let opening_balance = match shift_data {
        Ok((balance,)) => balance,
        Err(_) => {
            return Json(ApiResponse {
                success: false,
                data: None,
                message: Some("Turno no encontrado o ya cerrado".to_string()),
            });
        }
    };

    // Calculate expected balance from sales
    let sales_total: Result<(f64,), sqlx::Error> = sqlx::query_as(
        "SELECT COALESCE(SUM(total), 0) FROM sales WHERE shift_id = ?"
    )
    .bind(&shift_id)
    .fetch_one(db.pool())
    .await;

    let expected_balance = opening_balance + sales_total.unwrap_or((0.0,)).0;
    let difference = payload.closing_balance - expected_balance;

    // Update shift
    let result = sqlx::query(
        r#"
        UPDATE shifts 
        SET closed_at = datetime('now'), 
            closing_balance = ?, 
            expected_balance = ?, 
            difference = ?,
            notes = ?,
            status = 'closed'
        WHERE id = ?
        "#
    )
    .bind(payload.closing_balance)
    .bind(expected_balance)
    .bind(difference)
    .bind(&payload.notes)
    .bind(&shift_id)
    .execute(db.pool())
    .await;

    match result {
        Ok(_) => {
            // Fetch complete shift data
            let shift_data: Result<(String, String, String, String, String, String, String, f64, f64, f64, f64, String, String), sqlx::Error> = 
                sqlx::query_as(
                    r#"
                    SELECT s.id, s.user_id, u.full_name, s.register_id, r.name, s.opened_at, s.closed_at,
                           s.opening_balance, s.closing_balance, s.expected_balance, s.difference,
                           COALESCE(s.notes, ''), s.status
                    FROM shifts s
                    JOIN users u ON s.user_id = u.id
                    JOIN cash_registers r ON s.register_id = r.id
                    WHERE s.id = ?
                    "#
                )
                .bind(&shift_id)
                .fetch_one(db.pool())
                .await;

            // Get sales summary
            let total_sales: f64 = sqlx::query_as::<_, (f64,)>(
                "SELECT COALESCE(SUM(total), 0) FROM sales WHERE shift_id = ?"
            )
            .bind(&shift_id)
            .fetch_one(db.pool())
            .await
            .unwrap_or((0.0,)).0;

            let total_transactions: i32 = sqlx::query_as::<_, (i32,)>(
                "SELECT COUNT(*) FROM sales WHERE shift_id = ?"
            )
            .bind(&shift_id)
            .fetch_one(db.pool())
            .await
            .unwrap_or((0,)).0;

            let cash_sales: f64 = sqlx::query_as::<_, (f64,)>(
                "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE method = 'cash' AND sale_id IN (SELECT id FROM sales WHERE shift_id = ?)"
            )
            .bind(&shift_id)
            .fetch_one(db.pool())
            .await
            .unwrap_or((0.0,)).0;

            let card_sales: f64 = sqlx::query_as::<_, (f64,)>(
                "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE method IN ('card', 'debit', 'credit') AND sale_id IN (SELECT id FROM sales WHERE shift_id = ?)"
            )
            .bind(&shift_id)
            .fetch_one(db.pool())
            .await
            .unwrap_or((0.0,)).0;

            match shift_data {
                Ok((id, user_id, user_name, register_id, register_name, opened_at, closed_at, opening_balance, closing_balance, expected_balance, difference, notes, status)) => {
                    let shift = Shift {
                        id,
                        user_id,
                        user_name,
                        register_id,
                        register_name,
                        opened_at,
                        closed_at: Some(closed_at),
                        opening_balance,
                        closing_balance: Some(closing_balance),
                        expected_balance: Some(expected_balance),
                        difference: Some(difference),
                        notes: if notes.is_empty() { None } else { Some(notes) },
                        status,
                    };

                    let summary = ShiftSummary {
                        shift,
                        total_sales,
                        total_transactions,
                        cash_sales,
                        card_sales,
                        other_sales: total_sales - cash_sales - card_sales,
                    };

                    Json(ApiResponse {
                        success: true,
                        data: Some(summary),
                        message: Some("Turno cerrado exitosamente".to_string()),
                    })
                }
                Err(e) => Json(ApiResponse {
                    success: false,
                    data: None,
                    message: Some(format!("Error: {}", e)),
                }),
            }
        }
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some(format!("Error al cerrar turno: {}", e)),
        }),
    }
}

pub async fn get_current_shift(
    State(state): State<AppState>,
    Path(user_id): Path<String>,
) -> Json<ApiResponse<Shift>> {
    let db = state.db.lock().await;
    
    let result: Result<(String, String, String, String, String, String, f64, String), sqlx::Error> = 
        sqlx::query_as(
            r#"
            SELECT s.id, s.user_id, u.full_name, s.register_id, r.name, s.opened_at, s.opening_balance, s.status
            FROM shifts s
            JOIN users u ON s.user_id = u.id
            JOIN cash_registers r ON s.register_id = r.id
            WHERE s.user_id = ? AND s.status = 'open'
            ORDER BY s.opened_at DESC
            LIMIT 1
            "#
        )
        .bind(&user_id)
        .fetch_one(db.pool())
        .await;

    match result {
        Ok((id, user_id, user_name, register_id, register_name, opened_at, opening_balance, status)) => {
            let shift = Shift {
                id,
                user_id,
                user_name,
                register_id,
                register_name,
                opened_at,
                closed_at: None,
                opening_balance,
                closing_balance: None,
                expected_balance: None,
                difference: None,
                notes: None,
                status,
            };

            Json(ApiResponse {
                success: true,
                data: Some(shift),
                message: None,
            })
        }
        Err(_) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some("No hay turno abierto".to_string()),
        }),
    }
}

pub async fn list_shifts(
    State(state): State<AppState>,
) -> Json<ApiResponse<Vec<Shift>>> {
    let db = state.db.lock().await;
    
    // FIX: Cambiar tipos String a f64 para closing_balance, expected_balance, difference
    let result: Result<Vec<(String, String, String, String, String, String, String, f64, f64, f64, f64, String, String)>, sqlx::Error> = 
        sqlx::query_as(
            r#"
            SELECT s.id, s.user_id, u.full_name, s.register_id, r.name, s.opened_at, 
                   COALESCE(s.closed_at, ''), s.opening_balance, 
                   COALESCE(s.closing_balance, 0.0), COALESCE(s.expected_balance, 0.0),
                   COALESCE(s.difference, 0.0), COALESCE(s.notes, ''), s.status
            FROM shifts s
            JOIN users u ON s.user_id = u.id
            JOIN cash_registers r ON s.register_id = r.id
            ORDER BY s.opened_at DESC
            LIMIT 50
            "#
        )
        .fetch_all(db.pool())
        .await;

    match result {
        Ok(rows) => {
            let shifts: Vec<Shift> = rows
                .into_iter()
                .map(|(id, user_id, user_name, register_id, register_name, opened_at, closed_at, opening_balance, closing_balance, expected_balance, difference, notes, status)| {
                    Shift {
                        id,
                        user_id,
                        user_name,
                        register_id,
                        register_name,
                        opened_at,
                        closed_at: if closed_at.is_empty() { None } else { Some(closed_at) },
                        opening_balance,
                        closing_balance: if status == "open" { None } else { Some(closing_balance) },
                        expected_balance: if status == "open" { None } else { Some(expected_balance) },
                        difference: if status == "open" { None } else { Some(difference) },
                        notes: if notes.is_empty() { None } else { Some(notes) },
                        status,
                    }
                })
                .collect();

            Json(ApiResponse {
                success: true,
                data: Some(shifts),
                message: None,
            })
        }
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some(format!("Error: {}", e)),
        }),
    }
}