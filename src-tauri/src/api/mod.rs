use axum::{
    routing::{get, post, put, delete},
    Router,
    Json,
};
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_http::cors::{CorsLayer, Any};
use crate::db::Database;
use crate::models::ApiResponse;

pub mod auth;
pub mod customers;
pub mod cash_register;
pub mod inventory;
pub mod reports;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<Mutex<Database>>,
}


pub async fn start_server(db: Arc<Mutex<Database>>) -> anyhow::Result<()> {
    let state = AppState { db };

    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/auth/login", post(auth::login))
        .route("/api/customers", get(customers::list_customers))
        .route("/api/customers", post(customers::create_customer))
        .route("/api/customers/:id", get(customers::get_customer))
        .route("/api/customers/:id", put(customers::update_customer))
        .route("/api/customers/:id", delete(customers::delete_customer))
        .route("/api/customers/:id/purchases", get(customers::get_customer_purchases))
        .route("/api/customers/:id/stats", get(customers::get_customer_stats))
        .route("/api/customers/:id/loyalty-points", post(customers::add_loyalty_points))
        .route("/api/cash-registers", get(cash_register::list_registers))
        .route("/api/shifts", get(cash_register::list_shifts))
        .route("/api/shifts/open", post(cash_register::open_shift))
        .route("/api/shifts/:id/close", post(cash_register::close_shift))
        .route("/api/shifts/current/:user_id", get(cash_register::get_current_shift))
        .route("/api/inventory/products", get(inventory::list_products_with_categories))
        .route("/api/inventory/products", post(inventory::create_product))
        .route("/api/inventory/products/:id", put(inventory::update_product))
        .route("/api/inventory/products/:id", delete(inventory::delete_product))
        .route("/api/inventory/products/low-stock", get(inventory::get_low_stock_products))
        .route("/api/inventory/stock/adjust", post(inventory::adjust_stock))
        .route("/api/inventory/movements", get(inventory::list_movements))
        .route("/api/inventory/categories", get(inventory::list_categories))
        .route("/api/inventory/categories", post(inventory::create_category))
        .route("/api/reports/sales/summary", get(reports::get_sales_summary))
        .route("/api/reports/sales/top-products", get(reports::get_top_products))
        .route("/api/reports/sales/by-day", get(reports::get_sales_by_day))
        .route("/api/reports/sales/by-hour", get(reports::get_sales_by_hour))
        .route("/api/reports/sales/by-payment-method", get(reports::get_sales_by_payment_method))
        .route("/api/reports/inventory/value", get(reports::get_inventory_value))
        .route("/api/reports/sales/by-category", get(reports::get_category_sales))
        .route("/api/reports/users/performance", get(reports::get_user_performance))
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3030").await?;
    println!("🚀 API Server running on http://127.0.0.1:3030");
    axum::serve(listener, app).await?;
    Ok(())
}

async fn health_check() -> Json<ApiResponse<String>> {
    Json(ApiResponse {
        success: true,
        data: Some("OK".to_string()),
        message: None,
    })
}