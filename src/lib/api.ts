const API_BASE_URL = "http://127.0.0.1:3030/api"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface User {
  id: string
  username: string
  email: string
  full_name: string
  phone?: string
  role_id: string
  is_active: boolean
  photo_url?: string
}

export interface Product {
  id: string
  sku: string
  barcode?: string
  name: string
  description?: string
  category_id?: string
  price: number
  cost: number
  stock: number
  min_stock: number
  unit: string
  image_url?: string
  is_active: boolean
}

export interface ProductWithCategory {
  id: string
  sku: string
  barcode?: string
  name: string
  description?: string
  category_id?: string
  category_name?: string
  price: number
  cost: number
  stock: number
  min_stock: number
  max_stock?: number
  unit: string
  image_url?: string
  is_active: boolean
  tax_rate: number
}

export interface Sale {
  id: string
  sale_number: string
  user_id: string
  customer_id?: string
  shift_id?: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total: number
  status: string
  payment_status: string
}

export interface CashRegister {
  id: string
  name: string
  location?: string
  is_active: boolean
}

export interface Shift {
  id: string
  user_id: string
  user_name: string
  register_id: string
  register_name: string
  opened_at: string
  closed_at?: string
  opening_balance: number
  closing_balance?: number
  expected_balance?: number
  difference?: number
  notes?: string
  status: string
}

export interface ShiftSummary {
  shift: Shift
  total_sales: number
  total_transactions: number
  cash_sales: number
  card_sales: number
  other_sales: number
}

export interface Category {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  is_active: boolean
}

export interface InventoryMovement {
  id: string
  product_id: string
  product_name: string
  movement_type: string
  quantity: number
  reference_id?: string
  notes?: string
  user_name: string
  created_at: string
}

export interface SalesSummary {
  total_sales: number
  total_transactions: number
  average_ticket: number
  total_items_sold: number
  cash_sales: number
  card_sales: number
  other_sales: number
}

export interface TopProduct {
  product_id: string
  product_name: string
  quantity_sold: number
  total_revenue: number
  times_sold: number
}

export interface SalesByDay {
  date: string
  total_sales: number
  transactions: number
}

export interface SalesByHour {
  hour: number
  total_sales: number
  transactions: number
}

export interface SalesByPaymentMethod {
  method: string
  total: number
  count: number
}

export interface InventoryValue {
  total_products: number
  total_stock_value: number
  low_stock_items: number
  out_of_stock_items: number
}

export interface CategorySales {
  category_id: string
  category_name: string
  total_sales: number
  quantity_sold: number
}

export interface UserPerformance {
  user_id: string
  user_name: string
  total_sales: number
  transactions: number
  average_ticket: number
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  rfc?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  credit_limit: number
  current_balance: number
  loyalty_points: number
  notes?: string
  is_active: boolean
  created_at: string
}

export interface CustomerPurchase {
  sale_id: string
  sale_number: string
  date: string
  total: number
  items_count: number
  payment_status: string
}

export interface CustomerStats {
  total_purchases: number
  total_spent: number
  average_purchase: number
  last_purchase_date?: string
  loyalty_points: number
}

export const api = {
  auth: {
    login: async (username: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      return response.json()
    },
  },
  products: {
    list: async (): Promise<ApiResponse<Product[]>> => {
      const response = await fetch(`${API_BASE_URL}/products`)
      return response.json()
    },
    get: async (id: string): Promise<ApiResponse<Product>> => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`)
      return response.json()
    },
  },
  sales: {
    create: async (data: any): Promise<ApiResponse<Sale>> => {
      const response = await fetch(`${API_BASE_URL}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return response.json()
    },
  },
  customers: {
    list: async (): Promise<ApiResponse<Customer[]>> => {
      const response = await fetch(`${API_BASE_URL}/customers`)
      return response.json()
    },
    get: async (id: string): Promise<ApiResponse<Customer>> => {
      const response = await fetch(`${API_BASE_URL}/customers/${id}`)
      return response.json()
    },
    create: async (data: any): Promise<ApiResponse<Customer>> => {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return response.json()
    },
    update: async (id: string, data: any): Promise<ApiResponse<string>> => {
      const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return response.json()
    },
    delete: async (id: string): Promise<ApiResponse<string>> => {
      const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: "DELETE",
      })
      return response.json()
    },
    getPurchases: async (id: string): Promise<ApiResponse<CustomerPurchase[]>> => {
      const response = await fetch(`${API_BASE_URL}/customers/${id}/purchases`)
      return response.json()
    },
    getStats: async (id: string): Promise<ApiResponse<CustomerStats>> => {
      const response = await fetch(`${API_BASE_URL}/customers/${id}/stats`)
      return response.json()
    },
    addLoyaltyPoints: async (id: string, points: number): Promise<ApiResponse<string>> => {
      const response = await fetch(`${API_BASE_URL}/customers/${id}/loyalty-points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      })
      return response.json()
    },
  },
  cashRegister: {
    listRegisters: async (): Promise<ApiResponse<CashRegister[]>> => {
      const response = await fetch(`${API_BASE_URL}/cash-registers`)
      return response.json()
    },
    listShifts: async (): Promise<ApiResponse<Shift[]>> => {
      const response = await fetch(`${API_BASE_URL}/shifts`)
      return response.json()
    },
    getCurrentShift: async (userId: string): Promise<ApiResponse<Shift>> => {
      const response = await fetch(`${API_BASE_URL}/shifts/current/${userId}`)
      return response.json()
    },
    openShift: async (data: { user_id: string; register_id: string; opening_balance: number }): Promise<
      ApiResponse<Shift>
    > => {
      const response = await fetch(`${API_BASE_URL}/shifts/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return response.json()
    },
    closeShift: async (
      shiftId: string,
      data: { closing_balance: number; notes?: string },
    ): Promise<ApiResponse<ShiftSummary>> => {
      const response = await fetch(`${API_BASE_URL}/shifts/${shiftId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return response.json()
    },
  },
  inventory: {
    listProducts: async (): Promise<ApiResponse<ProductWithCategory[]>> => {
      const response = await fetch(`${API_BASE_URL}/inventory/products`)
      return response.json()
    },
    createProduct: async (data: any): Promise<ApiResponse<Product>> => {
      const response = await fetch(`${API_BASE_URL}/inventory/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return response.json()
    },
    updateProduct: async (id: string, data: any): Promise<ApiResponse<string>> => {
      const response = await fetch(`${API_BASE_URL}/inventory/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return response.json()
    },
    deleteProduct: async (id: string): Promise<ApiResponse<string>> => {
      const response = await fetch(`${API_BASE_URL}/inventory/products/${id}`, {
        method: "DELETE",
      })
      return response.json()
    },
    getLowStock: async (): Promise<ApiResponse<ProductWithCategory[]>> => {
      const response = await fetch(`${API_BASE_URL}/inventory/products/low-stock`)
      return response.json()
    },
    adjustStock: async (data: {
      product_id: string
      quantity: number
      adjustment_type: string
      notes?: string
      user_id: string
    }): Promise<ApiResponse<string>> => {
      const response = await fetch(`${API_BASE_URL}/inventory/stock/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return response.json()
    },
    listMovements: async (): Promise<ApiResponse<InventoryMovement[]>> => {
      const response = await fetch(`${API_BASE_URL}/inventory/movements`)
      return response.json()
    },
    listCategories: async (): Promise<ApiResponse<Category[]>> => {
      const response = await fetch(`${API_BASE_URL}/inventory/categories`)
      return response.json()
    },
    createCategory: async (data: {
      name: string
      description?: string
      color?: string
      icon?: string
    }): Promise<ApiResponse<Category>> => {
      const response = await fetch(`${API_BASE_URL}/inventory/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      return response.json()
    },
  },
  reports: {
    getSalesSummary: async (startDate?: string, endDate?: string): Promise<ApiResponse<SalesSummary>> => {
      const params = new URLSearchParams()
      if (startDate) params.append("start_date", startDate)
      if (endDate) params.append("end_date", endDate)
      const response = await fetch(`${API_BASE_URL}/reports/sales/summary?${params}`)
      return response.json()
    },
    getTopProducts: async (startDate?: string, endDate?: string): Promise<ApiResponse<TopProduct[]>> => {
      const params = new URLSearchParams()
      if (startDate) params.append("start_date", startDate)
      if (endDate) params.append("end_date", endDate)
      const response = await fetch(`${API_BASE_URL}/reports/sales/top-products?${params}`)
      return response.json()
    },
    getSalesByDay: async (startDate?: string, endDate?: string): Promise<ApiResponse<SalesByDay[]>> => {
      const params = new URLSearchParams()
      if (startDate) params.append("start_date", startDate)
      if (endDate) params.append("end_date", endDate)
      const response = await fetch(`${API_BASE_URL}/reports/sales/by-day?${params}`)
      return response.json()
    },
    getSalesByHour: async (): Promise<ApiResponse<SalesByHour[]>> => {
      const response = await fetch(`${API_BASE_URL}/reports/sales/by-hour`)
      return response.json()
    },
    getSalesByPaymentMethod: async (
      startDate?: string,
      endDate?: string,
    ): Promise<ApiResponse<SalesByPaymentMethod[]>> => {
      const params = new URLSearchParams()
      if (startDate) params.append("start_date", startDate)
      if (endDate) params.append("end_date", endDate)
      const response = await fetch(`${API_BASE_URL}/reports/sales/by-payment-method?${params}`)
      return response.json()
    },
    getInventoryValue: async (): Promise<ApiResponse<InventoryValue>> => {
      const response = await fetch(`${API_BASE_URL}/reports/inventory/value`)
      return response.json()
    },
    getCategorySales: async (startDate?: string, endDate?: string): Promise<ApiResponse<CategorySales[]>> => {
      const params = new URLSearchParams()
      if (startDate) params.append("start_date", startDate)
      if (endDate) params.append("end_date", endDate)
      const response = await fetch(`${API_BASE_URL}/reports/sales/by-category?${params}`)
      return response.json()
    },
    getUserPerformance: async (startDate?: string, endDate?: string): Promise<ApiResponse<UserPerformance[]>> => {
      const params = new URLSearchParams()
      if (startDate) params.append("start_date", startDate)
      if (endDate) params.append("end_date", endDate)
      const response = await fetch(`${API_BASE_URL}/reports/users/performance?${params}`)
      return response.json()
    },
  },
}
