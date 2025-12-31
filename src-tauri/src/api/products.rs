use axum::{Json, extract::{State, Path}};
use crate::api::AppState;
use crate::models::{ApiResponse, Product};

pub async fn list_products(
    State(state): State<AppState>,
) -> Json<ApiResponse<Vec<Product>>> {
    let db = state.db.lock().await;
    
    let result: Result<Vec<(String, String, String, String, String, f64, f64, i32, i32, String, i32)>, sqlx::Error> = 
        sqlx::query_as(
            "SELECT id, sku, COALESCE(barcode, ''), name, COALESCE(description, ''), price, cost, stock, min_stock, unit, is_active 
             FROM products WHERE is_active = 1 ORDER BY name"
        )
        .fetch_all(db.pool())
        .await;

    match result {
        Ok(rows) => {
            let products: Vec<Product> = rows
                .into_iter()
                .map(|(id, sku, barcode, name, description, price, cost, stock, min_stock, unit, is_active)| Product {
                    id,
                    sku,
                    barcode: if barcode.is_empty() { None } else { Some(barcode) },
                    name,
                    description: if description.is_empty() { None } else { Some(description) },
                    category_id: None,
                    price,
                    cost,
                    stock,
                    min_stock,
                    unit,
                    image_url: None,
                    is_active: is_active == 1,
                })
                .collect();

            Json(ApiResponse {
                success: true,
                data: Some(products),
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

pub async fn get_product(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Json<ApiResponse<Product>> {
    let db = state.db.lock().await;
    
    let result: Result<(String, String, String, String, String, f64, f64, i32, i32, String, i32), sqlx::Error> = 
        sqlx::query_as(
            "SELECT id, sku, COALESCE(barcode, ''), name, COALESCE(description, ''), price, cost, stock, min_stock, unit, is_active 
             FROM products WHERE id = ?"
        )
        .bind(&id)
        .fetch_one(db.pool())
        .await;

    match result {
        Ok((id, sku, barcode, name, description, price, cost, stock, min_stock, unit, is_active)) => {
            let product = Product {
                id,
                sku,
                barcode: if barcode.is_empty() { None } else { Some(barcode) },
                name,
                description: if description.is_empty() { None } else { Some(description) },
                category_id: None,
                price,
                cost,
                stock,
                min_stock,
                unit,
                image_url: None,
                is_active: is_active == 1,
            };

            Json(ApiResponse {
                success: true,
                data: Some(product),
                message: None,
            })
        }
        Err(_) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some("Producto no encontrado".to_string()),
        }),
    }
}
