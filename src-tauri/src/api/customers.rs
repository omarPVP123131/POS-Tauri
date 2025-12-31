use axum::{Json, extract::{State, Path}};
use serde::{Deserialize, Serialize};
use crate::api::AppState;
use crate::models::ApiResponse;

#[derive(Serialize)]
pub struct Customer {
    pub id: String,
    pub name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub rfc: Option<String>,
    pub address: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub postal_code: Option<String>,
    pub credit_limit: f64,
    pub current_balance: f64,
    pub loyalty_points: i32,
    pub notes: Option<String>,
    pub is_active: bool,
    pub created_at: String,
}

#[derive(Deserialize)]
pub struct CreateCustomerRequest {
    pub name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub rfc: Option<String>,
    pub address: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub postal_code: Option<String>,
    pub credit_limit: Option<f64>,
    pub notes: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateCustomerRequest {
    pub name: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub rfc: Option<String>,
    pub address: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub postal_code: Option<String>,
    pub credit_limit: Option<f64>,
    pub notes: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Serialize)]
pub struct CustomerPurchase {
    pub sale_id: String,
    pub sale_number: String,
    pub date: String,
    pub total: f64,
    pub items_count: i32,
    pub payment_status: String,
}

#[derive(Serialize)]
pub struct CustomerStats {
    pub total_purchases: i32,
    pub total_spent: f64,
    pub average_purchase: f64,
    pub last_purchase_date: Option<String>,
    pub loyalty_points: i32,
}

pub async fn list_customers(
    State(state): State<AppState>,
) -> Json<ApiResponse<Vec<Customer>>> {
    let db = state.db.lock().await;
    
    let result: Result<Vec<(String, String, String, String, String, String, String, String, String, f64, f64, i32, String, i32, String)>, sqlx::Error> = 
        sqlx::query_as(
            r#"
            SELECT id, name, COALESCE(email, ''), COALESCE(phone, ''), COALESCE(rfc, ''),
                   COALESCE(address, ''), COALESCE(city, ''), COALESCE(state, ''), COALESCE(postal_code, ''),
                   credit_limit, current_balance, loyalty_points, COALESCE(notes, ''), is_active, created_at
            FROM customers 
            ORDER BY name
            "#
        )
        .fetch_all(db.pool())
        .await;

    match result {
        Ok(rows) => {
            let customers: Vec<Customer> = rows
                .into_iter()
                .map(|(id, name, email, phone, rfc, address, city, state, postal_code, credit_limit, current_balance, loyalty_points, notes, is_active, created_at)| {
                    Customer {
                        id,
                        name,
                        email: if email.is_empty() { None } else { Some(email) },
                        phone: if phone.is_empty() { None } else { Some(phone) },
                        rfc: if rfc.is_empty() { None } else { Some(rfc) },
                        address: if address.is_empty() { None } else { Some(address) },
                        city: if city.is_empty() { None } else { Some(city) },
                        state: if state.is_empty() { None } else { Some(state) },
                        postal_code: if postal_code.is_empty() { None } else { Some(postal_code) },
                        credit_limit,
                        current_balance,
                        loyalty_points,
                        notes: if notes.is_empty() { None } else { Some(notes) },
                        is_active: is_active == 1,
                        created_at,
                    }
                })
                .collect();

            Json(ApiResponse {
                success: true,
                data: Some(customers),
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

pub async fn get_customer(
    State(state): State<AppState>,
    Path(customer_id): Path<String>,
) -> Json<ApiResponse<Customer>> {
    let db = state.db.lock().await;
    
    let result: Result<(String, String, String, String, String, String, String, String, String, f64, f64, i32, String, i32, String), sqlx::Error> = 
        sqlx::query_as(
            r#"
            SELECT id, name, COALESCE(email, ''), COALESCE(phone, ''), COALESCE(rfc, ''),
                   COALESCE(address, ''), COALESCE(city, ''), COALESCE(state, ''), COALESCE(postal_code, ''),
                   credit_limit, current_balance, loyalty_points, COALESCE(notes, ''), is_active, created_at
            FROM customers 
            WHERE id = ?
            "#
        )
        .bind(&customer_id)
        .fetch_one(db.pool())
        .await;

    match result {
        Ok((id, name, email, phone, rfc, address, city, state, postal_code, credit_limit, current_balance, loyalty_points, notes, is_active, created_at)) => {
            let customer = Customer {
                id,
                name,
                email: if email.is_empty() { None } else { Some(email) },
                phone: if phone.is_empty() { None } else { Some(phone) },
                rfc: if rfc.is_empty() { None } else { Some(rfc) },
                address: if address.is_empty() { None } else { Some(address) },
                city: if city.is_empty() { None } else { Some(city) },
                state: if state.is_empty() { None } else { Some(state) },
                postal_code: if postal_code.is_empty() { None } else { Some(postal_code) },
                credit_limit,
                current_balance,
                loyalty_points,
                notes: if notes.is_empty() { None } else { Some(notes) },
                is_active: is_active == 1,
                created_at,
            };

            Json(ApiResponse {
                success: true,
                data: Some(customer),
                message: None,
            })
        }
        Err(_) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some("Cliente no encontrado".to_string()),
        }),
    }
}

pub async fn create_customer(
    State(state): State<AppState>,
    Json(payload): Json<CreateCustomerRequest>,
) -> Json<ApiResponse<Customer>> {
    let db = state.db.lock().await;
    
    let customer_id = uuid::Uuid::new_v4().to_string();
    
    let result = sqlx::query(
        r#"
        INSERT INTO customers (id, name, email, phone, rfc, address, city, state, postal_code, credit_limit, current_balance, loyalty_points, notes, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 1, datetime('now'), datetime('now'))
        "#
    )
    .bind(&customer_id)
    .bind(&payload.name)
    .bind(&payload.email)
    .bind(&payload.phone)
    .bind(&payload.rfc)
    .bind(&payload.address)
    .bind(&payload.city)
    .bind(&payload.state)
    .bind(&payload.postal_code)
    .bind(payload.credit_limit.unwrap_or(0.0))
    .bind(&payload.notes)
    .execute(db.pool())
    .await;

    match result {
        Ok(_) => {
            let customer = Customer {
                id: customer_id,
                name: payload.name,
                email: payload.email,
                phone: payload.phone,
                rfc: payload.rfc,
                address: payload.address,
                city: payload.city,
                state: payload.state,
                postal_code: payload.postal_code,
                credit_limit: payload.credit_limit.unwrap_or(0.0),
                current_balance: 0.0,
                loyalty_points: 0,
                notes: payload.notes,
                is_active: true,
                created_at: chrono::Utc::now().to_rfc3339(),
            };

            Json(ApiResponse {
                success: true,
                data: Some(customer),
                message: Some("Cliente creado exitosamente".to_string()),
            })
        }
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some(format!("Error al crear cliente: {}", e)),
        }),
    }
}

pub async fn update_customer(
    State(state): State<AppState>,
    Path(customer_id): Path<String>,
    Json(payload): Json<UpdateCustomerRequest>,
) -> Json<ApiResponse<String>> {
    let db = state.db.lock().await;
    
    let mut updates = Vec::new();
    let mut values: Vec<String> = Vec::new();
    
    if let Some(name) = &payload.name {
        updates.push("name = ?");
        values.push(name.clone());
    }
    if let Some(email) = &payload.email {
        updates.push("email = ?");
        values.push(email.clone());
    }
    if let Some(phone) = &payload.phone {
        updates.push("phone = ?");
        values.push(phone.clone());
    }
    if let Some(rfc) = &payload.rfc {
        updates.push("rfc = ?");
        values.push(rfc.clone());
    }
    if let Some(address) = &payload.address {
        updates.push("address = ?");
        values.push(address.clone());
    }
    if let Some(city) = &payload.city {
        updates.push("city = ?");
        values.push(city.clone());
    }
    if let Some(state) = &payload.state {
        updates.push("state = ?");
        values.push(state.clone());
    }
    if let Some(postal_code) = &payload.postal_code {
        updates.push("postal_code = ?");
        values.push(postal_code.clone());
    }
    
    // FIX: Guardar credit_limit como String para el formato
    let credit_limit_str = payload.credit_limit.map(|cl| cl.to_string());
    if let Some(ref cl) = credit_limit_str {
        updates.push("credit_limit = ?");
        values.push(cl.clone());
    }
    
    if let Some(notes) = &payload.notes {
        updates.push("notes = ?");
        values.push(notes.clone());
    }
    
    // FIX: Guardar is_active como String para el formato
    let is_active_str = payload.is_active.map(|ia| if ia { "1".to_string() } else { "0".to_string() });
    if let Some(ref ia) = is_active_str {
        updates.push("is_active = ?");
        values.push(ia.clone());
    }
    
    if updates.is_empty() {
        return Json(ApiResponse {
            success: false,
            data: None,
            message: Some("No hay cambios para actualizar".to_string()),
        });
    }
    
    let query_str = format!(
        "UPDATE customers SET {}, updated_at = datetime('now') WHERE id = ?",
        updates.join(", ")
    );
    
    values.push(customer_id);
    
    let mut query_builder = sqlx::query(&query_str);
    for value in &values {
        query_builder = query_builder.bind(value);
    }
    
    let result = query_builder.execute(db.pool()).await;

    match result {
        Ok(_) => Json(ApiResponse {
            success: true,
            data: Some("Cliente actualizado".to_string()),
            message: Some("Cliente actualizado exitosamente".to_string()),
        }),
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some(format!("Error: {}", e)),
        }),
    }
}

pub async fn delete_customer(
    State(state): State<AppState>,
    Path(customer_id): Path<String>,
) -> Json<ApiResponse<String>> {
    let db = state.db.lock().await;
    
    let result = sqlx::query(
        "UPDATE customers SET is_active = 0, updated_at = datetime('now') WHERE id = ?"
    )
    .bind(&customer_id)
    .execute(db.pool())
    .await;

    match result {
        Ok(_) => Json(ApiResponse {
            success: true,
            data: Some("Cliente eliminado".to_string()),
            message: Some("Cliente desactivado exitosamente".to_string()),
        }),
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some(format!("Error: {}", e)),
        }),
    }
}

pub async fn get_customer_purchases(
    State(state): State<AppState>,
    Path(customer_id): Path<String>,
) -> Json<ApiResponse<Vec<CustomerPurchase>>> {
    let db = state.db.lock().await;
    
    let result: Result<Vec<(String, String, String, f64, i32, String)>, sqlx::Error> = sqlx::query_as(
        r#"
        SELECT s.id, s.sale_number, s.created_at, s.total,
               (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as items_count,
               s.payment_status
        FROM sales s
        WHERE s.customer_id = ? AND s.status = 'completed'
        ORDER BY s.created_at DESC
        LIMIT 50
        "#
    )
    .bind(&customer_id)
    .fetch_all(db.pool())
    .await;

    match result {
        Ok(rows) => {
            let purchases: Vec<CustomerPurchase> = rows
                .into_iter()
                .map(|(id, sale_number, date, total, items_count, payment_status)| CustomerPurchase {
                    sale_id: id,
                    sale_number,
                    date,
                    total,
                    items_count,
                    payment_status,
                })
                .collect();

            Json(ApiResponse {
                success: true,
                data: Some(purchases),
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

pub async fn get_customer_stats(
    State(state): State<AppState>,
    Path(customer_id): Path<String>,
) -> Json<ApiResponse<CustomerStats>> {
    let db = state.db.lock().await;
    
    let total_purchases: i32 = sqlx::query_as::<_, (i32,)>(
        "SELECT COUNT(*) FROM sales WHERE customer_id = ? AND status = 'completed'"
    )
    .bind(&customer_id)
    .fetch_one(db.pool())
    .await
    .unwrap_or((0,)).0;

    let total_spent: f64 = sqlx::query_as::<_, (f64,)>(
        "SELECT COALESCE(SUM(total), 0) FROM sales WHERE customer_id = ? AND status = 'completed'"
    )
    .bind(&customer_id)
    .fetch_one(db.pool())
    .await
    .unwrap_or((0.0,)).0;

    let average_purchase = if total_purchases > 0 {
        total_spent / total_purchases as f64
    } else {
        0.0
    };

    let last_purchase_date: Option<String> = sqlx::query_as::<_, (String,)>(
        "SELECT created_at FROM sales WHERE customer_id = ? AND status = 'completed' ORDER BY created_at DESC LIMIT 1"
    )
    .bind(&customer_id)
    .fetch_optional(db.pool())
    .await
    .ok()
    .flatten()
    .map(|t| t.0);

    let loyalty_points: i32 = sqlx::query_as::<_, (i32,)>(
        "SELECT loyalty_points FROM customers WHERE id = ?"
    )
    .bind(&customer_id)
    .fetch_one(db.pool())
    .await
    .unwrap_or((0,)).0;

    let stats = CustomerStats {
        total_purchases,
        total_spent,
        average_purchase,
        last_purchase_date,
        loyalty_points,
    };

    Json(ApiResponse {
        success: true,
        data: Some(stats),
        message: None,
    })
}

#[derive(Deserialize)]
pub struct AddLoyaltyPointsRequest {
    pub points: i32,
}

pub async fn add_loyalty_points(
    State(state): State<AppState>,
    Path(customer_id): Path<String>,
    Json(payload): Json<AddLoyaltyPointsRequest>,
) -> Json<ApiResponse<String>> {
    let db = state.db.lock().await;
    
    let result = sqlx::query(
        "UPDATE customers SET loyalty_points = loyalty_points + ?, updated_at = datetime('now') WHERE id = ?"
    )
    .bind(payload.points)
    .bind(&customer_id)
    .execute(db.pool())
    .await;

    match result {
        Ok(_) => Json(ApiResponse {
            success: true,
            data: Some("Puntos agregados".to_string()),
            message: Some(format!("{} puntos agregados exitosamente", payload.points)),
        }),
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some(format!("Error: {}", e)),
        }),
    }
}