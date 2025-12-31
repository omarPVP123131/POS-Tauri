use axum::{Json, extract::{State, Path}};
use serde::{Deserialize, Serialize};
use crate::api::AppState;
use crate::models::{ApiResponse, Product};

#[derive(Serialize)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub is_active: bool,
}

#[derive(Deserialize)]
pub struct CreateProductRequest {
    pub sku: String,
    pub barcode: Option<String>,
    pub name: String,
    pub description: Option<String>,
    pub category_id: Option<String>,
    pub price: f64,
    pub cost: f64,
    pub stock: i32,
    pub min_stock: i32,
    pub max_stock: Option<i32>,
    pub unit: String,
    pub tax_rate: Option<f64>,
}

#[derive(Deserialize)]
pub struct UpdateProductRequest {
    pub name: Option<String>,
    pub description: Option<String>,
    pub category_id: Option<String>,
    pub price: Option<f64>,
    pub cost: Option<f64>,
    pub min_stock: Option<i32>,
    pub max_stock: Option<i32>,
    pub unit: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Deserialize)]
pub struct StockAdjustmentRequest {
    pub product_id: String,
    pub quantity: i32,
    pub adjustment_type: String, // 'in' or 'out'
    pub notes: Option<String>,
    pub user_id: String,
}

#[derive(Serialize)]
pub struct InventoryMovement {
    pub id: String,
    pub product_id: String,
    pub product_name: String,
    pub movement_type: String,
    pub quantity: f64,
    pub reference_id: Option<String>,
    pub notes: Option<String>,
    pub user_name: String,
    pub created_at: String,
}

#[derive(Serialize)]
pub struct ProductWithCategory {
    pub id: String,
    pub sku: String,
    pub barcode: Option<String>,
    pub name: String,
    pub description: Option<String>,
    pub category_id: Option<String>,
    pub category_name: Option<String>,
    pub price: f64,
    pub cost: f64,
    pub stock: i32,
    pub min_stock: i32,
    pub max_stock: Option<i32>,
    pub unit: String,
    pub image_url: Option<String>,
    pub is_active: bool,
    pub tax_rate: f64,
}

pub async fn create_product(
    State(state): State<AppState>,
    Json(payload): Json<CreateProductRequest>,
) -> Json<ApiResponse<Product>> {
    let db = state.db.lock().await;
    
    let product_id = uuid::Uuid::new_v4().to_string();
    
    let result = sqlx::query(
        r#"
        INSERT INTO products (id, sku, barcode, name, description, category_id, price, cost, stock, min_stock, max_stock, unit, tax_rate, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
        "#
    )
    .bind(&product_id)
    .bind(&payload.sku)
    .bind(&payload.barcode)
    .bind(&payload.name)
    .bind(&payload.description)
    .bind(&payload.category_id)
    .bind(payload.price)
    .bind(payload.cost)
    .bind(payload.stock)
    .bind(payload.min_stock)
    .bind(payload.max_stock)
    .bind(&payload.unit)
    .bind(payload.tax_rate.unwrap_or(0.16))
    .execute(db.pool())
    .await;

    match result {
        Ok(_) => {
            let product = Product {
                id: product_id,
                sku: payload.sku,
                barcode: payload.barcode,
                name: payload.name,
                description: payload.description,
                category_id: payload.category_id,
                price: payload.price,
                cost: payload.cost,
                stock: payload.stock,
                min_stock: payload.min_stock,
                unit: payload.unit,
                image_url: None,
                is_active: true,
            };

            Json(ApiResponse {
                success: true,
                data: Some(product),
                message: Some("Producto creado exitosamente".to_string()),
            })
        }
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some(format!("Error al crear producto: {}", e)),
        }),
    }
}

pub async fn update_product(
    State(state): State<AppState>,
    Path(product_id): Path<String>,
    Json(payload): Json<UpdateProductRequest>,
) -> Json<ApiResponse<String>> {
    let db = state.db.lock().await;
    
    let mut query = String::from("UPDATE products SET updated_at = datetime('now')");
    let mut bindings: Vec<String> = Vec::new();
    
    if let Some(name) = &payload.name {
        query.push_str(", name = ?");
        bindings.push(name.clone());
    }
    if let Some(desc) = &payload.description {
        query.push_str(", description = ?");
        bindings.push(desc.clone());
    }
    if let Some(cat_id) = &payload.category_id {
        query.push_str(", category_id = ?");
        bindings.push(cat_id.clone());
    }
    if let Some(price) = payload.price {
        query.push_str(&format!(", price = {}", price));
    }
    if let Some(cost) = payload.cost {
        query.push_str(&format!(", cost = {}", cost));
    }
    if let Some(min_stock) = payload.min_stock {
        query.push_str(&format!(", min_stock = {}", min_stock));
    }
    if let Some(max_stock) = payload.max_stock {
        query.push_str(&format!(", max_stock = {}", max_stock));
    }
    if let Some(unit) = &payload.unit {
        query.push_str(", unit = ?");
        bindings.push(unit.clone());
    }
    if let Some(is_active) = payload.is_active {
        query.push_str(&format!(", is_active = {}", if is_active { 1 } else { 0 }));
    }
    
    query.push_str(" WHERE id = ?");
    bindings.push(product_id);
    
    let result = sqlx::query(&query)
        .bind(&bindings[0])
        .execute(db.pool())
        .await;

    match result {
        Ok(_) => Json(ApiResponse {
            success: true,
            data: Some("Producto actualizado".to_string()),
            message: Some("Producto actualizado exitosamente".to_string()),
        }),
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some(format!("Error: {}", e)),
        }),
    }
}

pub async fn delete_product(
    State(state): State<AppState>,
    Path(product_id): Path<String>,
) -> Json<ApiResponse<String>> {
    let db = state.db.lock().await;
    
    let result = sqlx::query(
        "UPDATE products SET is_active = 0, updated_at = datetime('now') WHERE id = ?"
    )
    .bind(&product_id)
    .execute(db.pool())
    .await;

    match result {
        Ok(_) => Json(ApiResponse {
            success: true,
            data: Some("Producto eliminado".to_string()),
            message: Some("Producto desactivado exitosamente".to_string()),
        }),
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some(format!("Error: {}", e)),
        }),
    }
}

pub async fn list_products_with_categories(
    State(state): State<AppState>,
) -> Json<ApiResponse<Vec<ProductWithCategory>>> {
    let db = state.db.lock().await;
    
    // FIX: Cambiar tipo de max_stock de String a i32
    let result: Result<Vec<(String, String, String, String, String, String, String, f64, f64, i32, i32, i32, String, String, i32, f64)>, sqlx::Error> = 
        sqlx::query_as(
            r#"
            SELECT p.id, p.sku, COALESCE(p.barcode, ''), p.name, COALESCE(p.description, ''), 
                   COALESCE(p.category_id, ''), COALESCE(c.name, ''),
                   p.price, p.cost, p.stock, p.min_stock, COALESCE(p.max_stock, 0),
                   p.unit, COALESCE(p.image_url, ''), p.is_active, p.tax_rate
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.name
            "#
        )
        .fetch_all(db.pool())
        .await;

    match result {
        Ok(rows) => {
            let products: Vec<ProductWithCategory> = rows
                .into_iter()
                .map(|(id, sku, barcode, name, description, category_id, category_name, price, cost, stock, min_stock, max_stock, unit, image_url, is_active, tax_rate)| {
                    ProductWithCategory {
                        id,
                        sku,
                        barcode: if barcode.is_empty() { None } else { Some(barcode) },
                        name,
                        description: if description.is_empty() { None } else { Some(description) },
                        category_id: if category_id.is_empty() { None } else { Some(category_id) },
                        category_name: if category_name.is_empty() { None } else { Some(category_name) },
                        price,
                        cost,
                        stock,
                        min_stock,
                        max_stock: if max_stock == 0 { None } else { Some(max_stock) },
                        unit,
                        image_url: if image_url.is_empty() { None } else { Some(image_url) },
                        is_active: is_active == 1,
                        tax_rate,
                    }
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

pub async fn adjust_stock(
    State(state): State<AppState>,
    Json(payload): Json<StockAdjustmentRequest>,
) -> Json<ApiResponse<String>> {
    let db = state.db.lock().await;
    
    let movement_type = match payload.adjustment_type.as_str() {
        "in" => "adjustment_in",
        "out" => "adjustment_out",
        _ => "adjustment",
    };
    
    let quantity_change = if payload.adjustment_type == "in" {
        payload.quantity
    } else {
        -payload.quantity
    };
    
    // Update stock
    let result = sqlx::query(
        "UPDATE products SET stock = stock + ?, updated_at = datetime('now') WHERE id = ?"
    )
    .bind(quantity_change)
    .bind(&payload.product_id)
    .execute(db.pool())
    .await;

    match result {
        Ok(_) => {
            // Record movement
            let _ = sqlx::query(
                r#"
                INSERT INTO inventory_movements (id, product_id, type, quantity, notes, user_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
                "#
            )
            .bind(uuid::Uuid::new_v4().to_string())
            .bind(&payload.product_id)
            .bind(movement_type)
            .bind(payload.quantity as f64)
            .bind(&payload.notes)
            .bind(&payload.user_id)
            .execute(db.pool())
            .await;

            Json(ApiResponse {
                success: true,
                data: Some("Stock ajustado".to_string()),
                message: Some("Stock actualizado exitosamente".to_string()),
            })
        }
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some(format!("Error: {}", e)),
        }),
    }
}

pub async fn list_movements(
    State(state): State<AppState>,
) -> Json<ApiResponse<Vec<InventoryMovement>>> {
    let db = state.db.lock().await;
    
    let result: Result<Vec<(String, String, String, String, f64, String, String, String, String)>, sqlx::Error> = 
        sqlx::query_as(
            r#"
            SELECT m.id, m.product_id, p.name, m.type, m.quantity, 
                   COALESCE(m.reference_id, ''), COALESCE(m.notes, ''),
                   u.full_name, m.created_at
            FROM inventory_movements m
            JOIN products p ON m.product_id = p.id
            JOIN users u ON m.user_id = u.id
            ORDER BY m.created_at DESC
            LIMIT 100
            "#
        )
        .fetch_all(db.pool())
        .await;

    match result {
        Ok(rows) => {
            let movements: Vec<InventoryMovement> = rows
                .into_iter()
                .map(|(id, product_id, product_name, movement_type, quantity, reference_id, notes, user_name, created_at)| {
                    InventoryMovement {
                        id,
                        product_id,
                        product_name,
                        movement_type,
                        quantity,
                        reference_id: if reference_id.is_empty() { None } else { Some(reference_id) },
                        notes: if notes.is_empty() { None } else { Some(notes) },
                        user_name,
                        created_at,
                    }
                })
                .collect();

            Json(ApiResponse {
                success: true,
                data: Some(movements),
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

pub async fn list_categories(
    State(state): State<AppState>,
) -> Json<ApiResponse<Vec<Category>>> {
    let db = state.db.lock().await;
    
    let result: Result<Vec<(String, String, String, String, String, i32)>, sqlx::Error> = 
        sqlx::query_as(
            "SELECT id, name, COALESCE(description, ''), COALESCE(color, ''), COALESCE(icon, ''), is_active FROM categories ORDER BY name"
        )
        .fetch_all(db.pool())
        .await;

    match result {
        Ok(rows) => {
            let categories: Vec<Category> = rows
                .into_iter()
                .map(|(id, name, description, color, icon, is_active)| Category {
                    id,
                    name,
                    description: if description.is_empty() { None } else { Some(description) },
                    color: if color.is_empty() { None } else { Some(color) },
                    icon: if icon.is_empty() { None } else { Some(icon) },
                    is_active: is_active == 1,
                })
                .collect();

            Json(ApiResponse {
                success: true,
                data: Some(categories),
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

#[derive(Deserialize)]
pub struct CreateCategoryRequest {
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
}

pub async fn create_category(
    State(state): State<AppState>,
    Json(payload): Json<CreateCategoryRequest>,
) -> Json<ApiResponse<Category>> {
    let db = state.db.lock().await;
    
    let category_id = uuid::Uuid::new_v4().to_string();
    
    let result = sqlx::query(
        r#"
        INSERT INTO categories (id, name, description, color, icon, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, 1, datetime('now'))
        "#
    )
    .bind(&category_id)
    .bind(&payload.name)
    .bind(&payload.description)
    .bind(&payload.color)
    .bind(&payload.icon)
    .execute(db.pool())
    .await;

    match result {
        Ok(_) => {
            let category = Category {
                id: category_id,
                name: payload.name,
                description: payload.description,
                color: payload.color,
                icon: payload.icon,
                is_active: true,
            };

            Json(ApiResponse {
                success: true,
                data: Some(category),
                message: Some("Categoría creada exitosamente".to_string()),
            })
        }
        Err(e) => Json(ApiResponse {
            success: false,
            data: None,
            message: Some(format!("Error: {}", e)),
        }),
    }
}

pub async fn get_low_stock_products(
    State(state): State<AppState>,
) -> Json<ApiResponse<Vec<ProductWithCategory>>> {
    let db = state.db.lock().await;
    
    // FIX: Cambiar tipo de max_stock de String a i32
    let result: Result<Vec<(String, String, String, String, String, String, String, f64, f64, i32, i32, i32, String, String, i32, f64)>, sqlx::Error> = 
        sqlx::query_as(
            r#"
            SELECT p.id, p.sku, COALESCE(p.barcode, ''), p.name, COALESCE(p.description, ''), 
                   COALESCE(p.category_id, ''), COALESCE(c.name, ''),
                   p.price, p.cost, p.stock, p.min_stock, COALESCE(p.max_stock, 0),
                   p.unit, COALESCE(p.image_url, ''), p.is_active, p.tax_rate
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.stock <= p.min_stock AND p.is_active = 1
            ORDER BY (p.min_stock - p.stock) DESC
            "#
        )
        .fetch_all(db.pool())
        .await;

    match result {
        Ok(rows) => {
            let products: Vec<ProductWithCategory> = rows
                .into_iter()
                .map(|(id, sku, barcode, name, description, category_id, category_name, price, cost, stock, min_stock, max_stock, unit, image_url, is_active, tax_rate)| {
                    ProductWithCategory {
                        id,
                        sku,
                        barcode: if barcode.is_empty() { None } else { Some(barcode) },
                        name,
                        description: if description.is_empty() { None } else { Some(description) },
                        category_id: if category_id.is_empty() { None } else { Some(category_id) },
                        category_name: if category_name.is_empty() { None } else { Some(category_name) },
                        price,
                        cost,
                        stock,
                        min_stock,
                        max_stock: if max_stock == 0 { None } else { Some(max_stock) },
                        unit,
                        image_url: if image_url.is_empty() { None } else { Some(image_url) },
                        is_active: is_active == 1,
                        tax_rate,
                    }
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