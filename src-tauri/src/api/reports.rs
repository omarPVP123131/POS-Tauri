use axum::{Json, extract::{State, Query}};
use serde::{Deserialize, Serialize};
use crate::api::AppState;
use crate::models::ApiResponse;

#[derive(Deserialize)]
pub struct DateRangeQuery {
    pub start_date: Option<String>,
    pub end_date: Option<String>,
}

#[derive(Serialize)]
pub struct SalesSummary {
    pub total_sales: f64,
    pub total_transactions: i32,
    pub average_ticket: f64,
    pub total_items_sold: f64,
    pub cash_sales: f64,
    pub card_sales: f64,
    pub other_sales: f64,
}

#[derive(Serialize)]
pub struct TopProduct {
    pub product_id: String,
    pub product_name: String,
    pub quantity_sold: f64,
    pub total_revenue: f64,
    pub times_sold: i32,
}

#[derive(Serialize)]
pub struct SalesByDay {
    pub date: String,
    pub total_sales: f64,
    pub transactions: i32,
}

#[derive(Serialize)]
pub struct SalesByHour {
    pub hour: i32,
    pub total_sales: f64,
    pub transactions: i32,
}

#[derive(Serialize)]
pub struct SalesByPaymentMethod {
    pub method: String,
    pub total: f64,
    pub count: i32,
}

#[derive(Serialize)]
pub struct InventoryValue {
    pub total_products: i32,
    pub total_stock_value: f64,
    pub low_stock_items: i32,
    pub out_of_stock_items: i32,
}

#[derive(Serialize)]
pub struct CategorySales {
    pub category_id: String,
    pub category_name: String,
    pub total_sales: f64,
    pub quantity_sold: f64,
}

#[derive(Serialize)]
pub struct UserPerformance {
    pub user_id: String,
    pub user_name: String,
    pub total_sales: f64,
    pub transactions: i32,
    pub average_ticket: f64,
}

pub async fn get_sales_summary(
    State(state): State<AppState>,
    Query(params): Query<DateRangeQuery>,
) -> Json<ApiResponse<SalesSummary>> {
    let db = state.db.lock().await;
    
    let date_filter = if let (Some(start), Some(end)) = (params.start_date, params.end_date) {
        format!("AND s.created_at BETWEEN '{}' AND '{}'", start, end)
    } else {
        "AND DATE(s.created_at) = DATE('now')".to_string()
    };

    // Total sales and transactions
    let sales_result: Result<(f64, i32), sqlx::Error> = sqlx::query_as(&format!(
        "SELECT COALESCE(SUM(total), 0), COUNT(*) FROM sales WHERE status = 'completed' {}",
        date_filter
    ))
    .fetch_one(db.pool())
    .await;

    let (total_sales, total_transactions) = sales_result.unwrap_or((0.0, 0));
    let average_ticket = if total_transactions > 0 {
        total_sales / total_transactions as f64
    } else {
        0.0
    };

    // Total items sold
    let items_result: Result<(f64,), sqlx::Error> = sqlx::query_as(&format!(
        "SELECT COALESCE(SUM(si.quantity), 0) FROM sale_items si 
         JOIN sales s ON si.sale_id = s.id 
         WHERE s.status = 'completed' {}",
        date_filter
    ))
    .fetch_one(db.pool())
    .await;

    let total_items_sold = items_result.unwrap_or((0.0,)).0;

    // Sales by payment method
    let cash_result: Result<(f64,), sqlx::Error> = sqlx::query_as(&format!(
        "SELECT COALESCE(SUM(p.amount), 0) FROM payments p 
         JOIN sales s ON p.sale_id = s.id 
         WHERE p.method = 'cash' AND s.status = 'completed' {}",
        date_filter
    ))
    .fetch_one(db.pool())
    .await;

    let card_result: Result<(f64,), sqlx::Error> = sqlx::query_as(&format!(
        "SELECT COALESCE(SUM(p.amount), 0) FROM payments p 
         JOIN sales s ON p.sale_id = s.id 
         WHERE p.method IN ('card', 'debit', 'credit') AND s.status = 'completed' {}",
        date_filter
    ))
    .fetch_one(db.pool())
    .await;

    // FIX: Extraer los valores antes de usarlos múltiples veces
    let cash_sales = cash_result.unwrap_or((0.0,)).0;
    let card_sales = card_result.unwrap_or((0.0,)).0;

    let summary = SalesSummary {
        total_sales,
        total_transactions,
        average_ticket,
        total_items_sold,
        cash_sales,
        card_sales,
        other_sales: total_sales - cash_sales - card_sales,
    };

    Json(ApiResponse {
        success: true,
        data: Some(summary),
        message: None,
    })
}

pub async fn get_top_products(
    State(state): State<AppState>,
    Query(params): Query<DateRangeQuery>,
) -> Json<ApiResponse<Vec<TopProduct>>> {
    let db = state.db.lock().await;
    
    let date_filter = if let (Some(start), Some(end)) = (params.start_date, params.end_date) {
        format!("AND s.created_at BETWEEN '{}' AND '{}'", start, end)
    } else {
        "AND DATE(s.created_at) = DATE('now')".to_string()
    };

    let result: Result<Vec<(String, String, f64, f64, i32)>, sqlx::Error> = sqlx::query_as(&format!(
        "SELECT p.id, p.name, 
                SUM(si.quantity) as quantity_sold,
                SUM(si.total) as total_revenue,
                COUNT(DISTINCT si.sale_id) as times_sold
         FROM sale_items si
         JOIN products p ON si.product_id = p.id
         JOIN sales s ON si.sale_id = s.id
         WHERE s.status = 'completed' {}
         GROUP BY p.id, p.name
         ORDER BY total_revenue DESC
         LIMIT 10",
        date_filter
    ))
    .fetch_all(db.pool())
    .await;

    match result {
        Ok(rows) => {
            let products: Vec<TopProduct> = rows
                .into_iter()
                .map(|(id, name, quantity, revenue, times)| TopProduct {
                    product_id: id,
                    product_name: name,
                    quantity_sold: quantity,
                    total_revenue: revenue,
                    times_sold: times,
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

pub async fn get_sales_by_day(
    State(state): State<AppState>,
    Query(params): Query<DateRangeQuery>,
) -> Json<ApiResponse<Vec<SalesByDay>>> {
    let db = state.db.lock().await;
    
    let date_filter = if let (Some(start), Some(end)) = (params.start_date, params.end_date) {
        format!("AND created_at BETWEEN '{}' AND '{}'", start, end)
    } else {
        "AND created_at >= DATE('now', '-30 days')".to_string()
    };

    let result: Result<Vec<(String, f64, i32)>, sqlx::Error> = sqlx::query_as(&format!(
        "SELECT DATE(created_at) as date, 
                SUM(total) as total_sales,
                COUNT(*) as transactions
         FROM sales
         WHERE status = 'completed' {}
         GROUP BY DATE(created_at)
         ORDER BY date DESC",
        date_filter
    ))
    .fetch_all(db.pool())
    .await;

    match result {
        Ok(rows) => {
            let data: Vec<SalesByDay> = rows
                .into_iter()
                .map(|(date, total, count)| SalesByDay {
                    date,
                    total_sales: total,
                    transactions: count,
                })
                .collect();

            Json(ApiResponse {
                success: true,
                data: Some(data),
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

pub async fn get_sales_by_hour(
    State(state): State<AppState>,
) -> Json<ApiResponse<Vec<SalesByHour>>> {
    let db = state.db.lock().await;
    
    let result: Result<Vec<(i32, f64, i32)>, sqlx::Error> = sqlx::query_as(
        "SELECT CAST(strftime('%H', created_at) AS INTEGER) as hour,
                SUM(total) as total_sales,
                COUNT(*) as transactions
         FROM sales
         WHERE status = 'completed' AND DATE(created_at) = DATE('now')
         GROUP BY hour
         ORDER BY hour"
    )
    .fetch_all(db.pool())
    .await;

    match result {
        Ok(rows) => {
            let data: Vec<SalesByHour> = rows
                .into_iter()
                .map(|(hour, total, count)| SalesByHour {
                    hour,
                    total_sales: total,
                    transactions: count,
                })
                .collect();

            Json(ApiResponse {
                success: true,
                data: Some(data),
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

pub async fn get_sales_by_payment_method(
    State(state): State<AppState>,
    Query(params): Query<DateRangeQuery>,
) -> Json<ApiResponse<Vec<SalesByPaymentMethod>>> {
    let db = state.db.lock().await;
    
    let date_filter = if let (Some(start), Some(end)) = (params.start_date, params.end_date) {
        format!("AND s.created_at BETWEEN '{}' AND '{}'", start, end)
    } else {
        "AND DATE(s.created_at) = DATE('now')".to_string()
    };

    let result: Result<Vec<(String, f64, i32)>, sqlx::Error> = sqlx::query_as(&format!(
        "SELECT p.method,
                SUM(p.amount) as total,
                COUNT(*) as count
         FROM payments p
         JOIN sales s ON p.sale_id = s.id
         WHERE s.status = 'completed' {}
         GROUP BY p.method
         ORDER BY total DESC",
        date_filter
    ))
    .fetch_all(db.pool())
    .await;

    match result {
        Ok(rows) => {
            let data: Vec<SalesByPaymentMethod> = rows
                .into_iter()
                .map(|(method, total, count)| SalesByPaymentMethod {
                    method,
                    total,
                    count,
                })
                .collect();

            Json(ApiResponse {
                success: true,
                data: Some(data),
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

pub async fn get_inventory_value(
    State(state): State<AppState>,
) -> Json<ApiResponse<InventoryValue>> {
    let db = state.db.lock().await;
    
    let total_products: i32 = sqlx::query_as::<_, (i32,)>(
        "SELECT COUNT(*) FROM products WHERE is_active = 1"
    )
    .fetch_one(db.pool())
    .await
    .unwrap_or((0,)).0;

    let total_stock_value: f64 = sqlx::query_as::<_, (f64,)>(
        "SELECT COALESCE(SUM(stock * cost), 0) FROM products WHERE is_active = 1"
    )
    .fetch_one(db.pool())
    .await
    .unwrap_or((0.0,)).0;

    let low_stock_items: i32 = sqlx::query_as::<_, (i32,)>(
        "SELECT COUNT(*) FROM products WHERE stock <= min_stock AND is_active = 1"
    )
    .fetch_one(db.pool())
    .await
    .unwrap_or((0,)).0;

    let out_of_stock_items: i32 = sqlx::query_as::<_, (i32,)>(
        "SELECT COUNT(*) FROM products WHERE stock = 0 AND is_active = 1"
    )
    .fetch_one(db.pool())
    .await
    .unwrap_or((0,)).0;

    let value = InventoryValue {
        total_products,
        total_stock_value,
        low_stock_items,
        out_of_stock_items,
    };

    Json(ApiResponse {
        success: true,
        data: Some(value),
        message: None,
    })
}

pub async fn get_category_sales(
    State(state): State<AppState>,
    Query(params): Query<DateRangeQuery>,
) -> Json<ApiResponse<Vec<CategorySales>>> {
    let db = state.db.lock().await;
    
    let date_filter = if let (Some(start), Some(end)) = (params.start_date, params.end_date) {
        format!("AND s.created_at BETWEEN '{}' AND '{}'", start, end)
    } else {
        "AND DATE(s.created_at) = DATE('now')".to_string()
    };

    let result: Result<Vec<(String, String, f64, f64)>, sqlx::Error> = sqlx::query_as(&format!(
        "SELECT COALESCE(c.id, 'uncategorized') as category_id,
                COALESCE(c.name, 'Sin categoría') as category_name,
                SUM(si.total) as total_sales,
                SUM(si.quantity) as quantity_sold
         FROM sale_items si
         JOIN products p ON si.product_id = p.id
         LEFT JOIN categories c ON p.category_id = c.id
         JOIN sales s ON si.sale_id = s.id
         WHERE s.status = 'completed' {}
         GROUP BY c.id, c.name
         ORDER BY total_sales DESC",
        date_filter
    ))
    .fetch_all(db.pool())
    .await;

    match result {
        Ok(rows) => {
            let data: Vec<CategorySales> = rows
                .into_iter()
                .map(|(id, name, total, quantity)| CategorySales {
                    category_id: id,
                    category_name: name,
                    total_sales: total,
                    quantity_sold: quantity,
                })
                .collect();

            Json(ApiResponse {
                success: true,
                data: Some(data),
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

pub async fn get_user_performance(
    State(state): State<AppState>,
    Query(params): Query<DateRangeQuery>,
) -> Json<ApiResponse<Vec<UserPerformance>>> {
    let db = state.db.lock().await;
    
    let date_filter = if let (Some(start), Some(end)) = (params.start_date, params.end_date) {
        format!("AND s.created_at BETWEEN '{}' AND '{}'", start, end)
    } else {
        "AND DATE(s.created_at) = DATE('now')".to_string()
    };

    let result: Result<Vec<(String, String, f64, i32)>, sqlx::Error> = sqlx::query_as(&format!(
        "SELECT u.id, u.full_name,
                SUM(s.total) as total_sales,
                COUNT(*) as transactions
         FROM sales s
         JOIN users u ON s.user_id = u.id
         WHERE s.status = 'completed' {}
         GROUP BY u.id, u.full_name
         ORDER BY total_sales DESC",
        date_filter
    ))
    .fetch_all(db.pool())
    .await;

    match result {
        Ok(rows) => {
            let data: Vec<UserPerformance> = rows
                .into_iter()
                .map(|(id, name, total, count)| {
                    let average = if count > 0 { total / count as f64 } else { 0.0 };
                    UserPerformance {
                        user_id: id,
                        user_name: name,
                        total_sales: total,
                        transactions: count,
                        average_ticket: average,
                    }
                })
                .collect();

            Json(ApiResponse {
                success: true,
                data: Some(data),
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