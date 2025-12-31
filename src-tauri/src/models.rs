use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub username: String,
    pub email: String,
    pub full_name: String,
    pub phone: Option<String>,
    pub role_id: String,
    pub is_active: bool,
    pub photo_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Product {
    pub id: String,
    pub sku: String,
    pub barcode: Option<String>,
    pub name: String,
    pub description: Option<String>,
    pub category_id: Option<String>,
    pub price: f64,
    pub cost: f64,
    pub stock: i32,
    pub min_stock: i32,
    pub unit: String,
    pub image_url: Option<String>,
    pub is_active: bool,
}

/* #[derive(Debug, Serialize, Deserialize)]
pub struct Sale {
    pub id: String,
    pub sale_number: String,
    pub user_id: String,
    pub customer_id: Option<String>,
    pub shift_id: Option<String>,
    pub subtotal: f64,
    pub tax_amount: f64,
    pub discount_amount: f64,
    pub total: f64,
    pub status: String,
    pub payment_status: String,
} */

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub message: Option<String>,
}
