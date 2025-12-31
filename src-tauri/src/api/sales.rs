use axum::{Json, extract::State};
use serde::Deserialize;
use crate::api::AppState;
use crate::models::{ApiResponse, Sale};

#[derive(Deserialize)]
pub struct CreateSaleRequest {
    pub user_id: String,
    pub customer_id: Option<String>,
    pub shift_id: Option<String>,
    pub items: Vec<SaleItemRequest>,
    pub subtotal: f64,
    pub tax_amount: f64,
    pub discount_amount: f64,
    pub total: f64,
    pub payment_method: Option<String>,
}

#[derive(Deserialize)]
pub struct SaleItemRequest {
    pub product_id: String,
    pub quantity: f64,
    pub unit_price: f64,
    pub discount_amount: f64,
    pub tax_rate: f64,
}

pub async fn create_sale(
    State(state): State<AppState>,
    Json(payload): Json<CreateSaleRequest>,
) -> Json<ApiResponse<Sale>> {
    let db = state.db.lock().await;
    
    // Generate sale number
    let sale_number = format!("SALE-{}", uuid::Uuid::new_v4().simple().to_string()[..8].to_uppercase());
    let sale_id = uuid::Uuid::new_v4().to_string();

    // Insert sale
    let result = sqlx::query(
        r#"
        INSERT INTO sales (id, sale_number, user_id, customer_id, shift_id, subtotal, tax_amount, discount_amount, total, status, payment_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', 'paid', datetime('now'))
        "#
    )
    .bind(&sale_id)
    .bind(&sale_number)
    .bind(&payload.user_id)
    .bind(&payload.customer_id)
    .bind(&payload.shift_id)
    .bind(payload.subtotal)
    .bind(payload.tax_amount)
    .bind(payload.discount_amount)
    .bind(payload.total)
    .execute(db.pool())
    .await;

    match result {
        Ok(_) => {
            // Insert sale items
            for item in payload.items {
                let _ = sqlx::query(
                    r#"
                    INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, discount_amount, tax_rate, subtotal, total)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    "#
                )
                .bind(uuid::Uuid::new_v4().to_string())
                .bind(&sale_id)
                .bind(&item.product_id)
                .bind(item.quantity)
                .bind(item.unit_price)
                .bind(item.discount_amount)
                .bind(item.tax_rate)
                .bind(item.quantity * item.unit_price)
                .bind(item.quantity * item.unit_price - item.discount_amount)
                .execute(db.pool())
                .await;

                // Update stock
                let _ = sqlx::query(
                    "UPDATE products SET stock = stock - ? WHERE id = ?"
                )
                .bind(item.quantity as i32)
                .bind(&item.product_id)
                .execute(db.pool())
                .await;
            }

            let payment_method = payload.payment_method.unwrap_or_else(|| "cash".to_string());
            let _ = sqlx::query(
                r#"
                INSERT INTO payments (id, sale_id, method, amount, status, created_at)
                VALUES (?, ?, ?, ?, 'completed', datetime('now'))
                "#
            )
            .bind(uuid::Uuid::new_v4().to_string())
            .bind(&sale_id)
            .bind(&payment_method)
            .bind(payload.total)
            .execute(db.pool())
            .await;

            let sale = Sale {
                id: sale_id,
                sale_number,
                user_id: payload.user_id,
                customer_id: payload.customer_id,
                shift_id: payload.shift_id,
                subtotal: payload.subtotal,
                tax_amount: payload.tax_amount,
                discount_amount: payload.discount_amount,
                total: payload.total,
                status: "completed".to_string(),
                payment_status: "paid".to_string(),
            };

            Json(ApiResponse {
                success: true,
                data: Some(sale),
                message: Some("Venta creada exitosamente".to_string()),
            })
        }
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some(format!("Error al crear venta: {}", e)),
        }),
    }
}
