use sqlx::{sqlite::SqlitePool, Pool, Sqlite};
use anyhow::{Result, Context};
use std::path::PathBuf;

pub struct Database {
    pool: Pool<Sqlite>,
    #[allow(dead_code)]
    db_path: PathBuf,
}

impl Database {
    pub async fn new() -> Result<Self> {
        let db_path = Self::get_database_path()?;
        
        // Crear directorio si no existe
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent)
                .context("Failed to create database directory")?;
        }

        let database_url = format!("sqlite:{}?mode=rwc", db_path.display());
        println!("📦 Database location: {}", db_path.display());
        
        let pool = SqlitePool::connect(&database_url).await
            .context("Failed to connect to database")?;
        
        // Configuraciones de optimización
        sqlx::query("PRAGMA journal_mode=WAL;")
            .execute(&pool)
            .await?;
        
        sqlx::query("PRAGMA synchronous=NORMAL;")
            .execute(&pool)
            .await?;
        
        sqlx::query("PRAGMA cache_size=-64000;") // 64MB cache
            .execute(&pool)
            .await?;
        
        sqlx::query("PRAGMA temp_store=MEMORY;")
            .execute(&pool)
            .await?;
        
        Ok(Self { pool, db_path })
    }

    fn get_database_path() -> Result<PathBuf> {
        #[cfg(target_os = "windows")]
        {
            let appdata = std::env::var("APPDATA")
                .context("Failed to get APPDATA environment variable")?;
            let mut path = PathBuf::from(appdata);
            path.push("POSDesktop");
            path.push("data");
            path.push("pos_data.db");
            Ok(path)
        }

        #[cfg(target_os = "macos")]
        {
            let home = std::env::var("HOME")
                .context("Failed to get HOME environment variable")?;
            let mut path = PathBuf::from(home);
            path.push("Library");
            path.push("Application Support");
            path.push("POSDesktop");
            path.push("pos_data.db");
            Ok(path)
        }

        #[cfg(target_os = "linux")]
        {
            let home = std::env::var("HOME")
                .context("Failed to get HOME environment variable")?;
            let mut path = PathBuf::from(home);
            path.push(".local");
            path.push("share");
            path.push("POSDesktop");
            path.push("pos_data.db");
            Ok(path)
        }

        #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
        {
            Ok(PathBuf::from("./pos_data.db"))
        }
    }

    pub fn pool(&self) -> &Pool<Sqlite> {
        &self.pool
    }

    #[allow(dead_code)]
    pub fn db_path(&self) -> &PathBuf {
        &self.db_path
    }

    pub async fn run_migrations(&self) -> Result<()> {
        println!("🔄 Running database migrations...");
        
        // Create tables
        self.create_users_table().await?;
        self.create_roles_table().await?;
        self.create_categories_table().await?;
        self.create_products_table().await?;
        self.create_customers_table().await?;
        self.create_cash_registers_table().await?;
        self.create_shifts_table().await?;
        self.create_sales_table().await?;
        self.create_sale_items_table().await?;
        self.create_payments_table().await?;
        self.create_inventory_movements_table().await?;
        self.create_audit_logs_table().await?;
        
        // Create indexes for better performance
        self.create_indexes().await?;
        
        // Insert default data
        self.insert_default_roles().await?;
        self.insert_default_admin().await?;
        self.insert_default_cash_register().await?;
        self.insert_sample_data().await?;
        
        println!("✅ Database migrations completed successfully");
        Ok(())
    }

    async fn create_indexes(&self) -> Result<()> {
        let indexes = vec![
            "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)",
            "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
            "CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)",
            "CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)",
            "CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)",
            "CREATE INDEX IF NOT EXISTS idx_sales_user ON sales(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id)",
            "CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at)",
            "CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id)",
            "CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id)",
            "CREATE INDEX IF NOT EXISTS idx_payments_sale ON payments(sale_id)",
            "CREATE INDEX IF NOT EXISTS idx_shifts_user ON shifts(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_shifts_register ON shifts(register_id)",
        ];

        for index in indexes {
            sqlx::query(index).execute(&self.pool).await?;
        }
        Ok(())
    }

    async fn create_users_table(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY NOT NULL,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                phone TEXT,
                role_id TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                photo_url TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (role_id) REFERENCES roles(id)
            )
            "#
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn create_roles_table(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS roles (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT UNIQUE NOT NULL,
                permissions TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            "#
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn create_categories_table(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                color TEXT,
                icon TEXT,
                parent_id TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                FOREIGN KEY (parent_id) REFERENCES categories(id)
            )
            "#
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn create_products_table(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY NOT NULL,
                sku TEXT UNIQUE NOT NULL,
                barcode TEXT UNIQUE,
                name TEXT NOT NULL,
                description TEXT,
                category_id TEXT,
                price REAL NOT NULL,
                cost REAL NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                min_stock INTEGER DEFAULT 0,
                max_stock INTEGER,
                unit TEXT NOT NULL,
                image_url TEXT,
                is_active INTEGER DEFAULT 1,
                has_variants INTEGER DEFAULT 0,
                tax_rate REAL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )
            "#
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn create_customers_table(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                rfc TEXT,
                address TEXT,
                city TEXT,
                state TEXT,
                postal_code TEXT,
                credit_limit REAL DEFAULT 0,
                current_balance REAL DEFAULT 0,
                loyalty_points INTEGER DEFAULT 0,
                notes TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            "#
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn create_cash_registers_table(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS cash_registers (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                location TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL
            )
            "#
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn create_shifts_table(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS shifts (
                id TEXT PRIMARY KEY NOT NULL,
                user_id TEXT NOT NULL,
                register_id TEXT NOT NULL,
                opened_at TEXT NOT NULL,
                closed_at TEXT,
                opening_balance REAL NOT NULL,
                closing_balance REAL,
                expected_balance REAL,
                difference REAL,
                notes TEXT,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (register_id) REFERENCES cash_registers(id)
            )
            "#
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn create_sales_table(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS sales (
                id TEXT PRIMARY KEY NOT NULL,
                sale_number TEXT UNIQUE NOT NULL,
                user_id TEXT NOT NULL,
                customer_id TEXT,
                shift_id TEXT,
                subtotal REAL NOT NULL,
                tax_amount REAL NOT NULL,
                discount_amount REAL DEFAULT 0,
                total REAL NOT NULL,
                status TEXT NOT NULL,
                payment_status TEXT NOT NULL,
                notes TEXT,
                device_id TEXT,
                created_at TEXT NOT NULL,
                completed_at TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (customer_id) REFERENCES customers(id),
                FOREIGN KEY (shift_id) REFERENCES shifts(id)
            )
            "#
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn create_sale_items_table(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS sale_items (
                id TEXT PRIMARY KEY NOT NULL,
                sale_id TEXT NOT NULL,
                product_id TEXT NOT NULL,
                quantity REAL NOT NULL,
                unit_price REAL NOT NULL,
                discount_amount REAL DEFAULT 0,
                tax_rate REAL DEFAULT 0,
                subtotal REAL NOT NULL,
                total REAL NOT NULL,
                notes TEXT,
                FOREIGN KEY (sale_id) REFERENCES sales(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
            "#
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn create_payments_table(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS payments (
                id TEXT PRIMARY KEY NOT NULL,
                sale_id TEXT NOT NULL,
                method TEXT NOT NULL,
                amount REAL NOT NULL,
                reference TEXT,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (sale_id) REFERENCES sales(id)
            )
            "#
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn create_inventory_movements_table(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS inventory_movements (
                id TEXT PRIMARY KEY NOT NULL,
                product_id TEXT NOT NULL,
                type TEXT NOT NULL,
                quantity REAL NOT NULL,
                reference_id TEXT,
                notes TEXT,
                user_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (product_id) REFERENCES products(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
            "#
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn create_audit_logs_table(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY NOT NULL,
                user_id TEXT NOT NULL,
                action TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                changes TEXT,
                device_id TEXT,
                ip_address TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
            "#
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn insert_default_roles(&self) -> Result<()> {
        let roles = vec![
            ("admin", r#"["all"]"#, "Administrador con acceso completo"),
            ("manager", r#"["sales","inventory","reports","customers"]"#, "Gerente con permisos avanzados"),
            ("cashier", r#"["sales"]"#, "Cajero con permisos básicos"),
        ];

        for (name, permissions, _desc) in roles {
            sqlx::query(
                r#"
                INSERT OR IGNORE INTO roles (id, name, permissions, created_at)
                VALUES (?, ?, ?, datetime('now'))
                "#
            )
            .bind(uuid::Uuid::new_v4().to_string())
            .bind(name)
            .bind(permissions)
            .execute(&self.pool)
            .await?;
        }
        Ok(())
    }

    async fn insert_default_admin(&self) -> Result<()> {
        let admin_role: Option<(String,)> = sqlx::query_as(
            "SELECT id FROM roles WHERE name = 'admin'"
        )
        .fetch_optional(&self.pool)
        .await?;

        if let Some((role_id,)) = admin_role {
            let password_hash = bcrypt::hash("admin123", bcrypt::DEFAULT_COST)?;
            
            sqlx::query(
                r#"
                INSERT OR IGNORE INTO users (id, username, email, password_hash, full_name, role_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                "#
            )
            .bind(uuid::Uuid::new_v4().to_string())
            .bind("admin")
            .bind("admin@pos.local")
            .bind(password_hash)
            .bind("Administrador")
            .bind(role_id)
            .execute(&self.pool)
            .await?;
        }
        Ok(())
    }

    async fn insert_default_cash_register(&self) -> Result<()> {
        sqlx::query(
            r#"
            INSERT OR IGNORE INTO cash_registers (id, name, location, is_active, created_at)
            VALUES (?, 'Caja Principal', 'Principal', 1, datetime('now'))
            "#
        )
        .bind(uuid::Uuid::new_v4().to_string())
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn insert_sample_data(&self) -> Result<()> {
        // Insertar categorías de ejemplo
        let categories = vec![
            ("Bebidas", "Bebidas y refrescos", "#3B82F6", "☕"),
            ("Abarrotes", "Productos de abarrotes", "#10B981", "🛒"),
            ("Lácteos", "Productos lácteos", "#F59E0B", "🥛"),
            ("Panadería", "Pan y repostería", "#EF4444", "🍞"),
            ("Limpieza", "Productos de limpieza", "#8B5CF6", "🧹"),
        ];

        for (name, desc, color, icon) in categories {
            sqlx::query(
                r#"
                INSERT OR IGNORE INTO categories (id, name, description, color, icon, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, 1, datetime('now'))
                "#
            )
            .bind(uuid::Uuid::new_v4().to_string())
            .bind(name)
            .bind(desc)
            .bind(color)
            .bind(icon)
            .execute(&self.pool)
            .await?;
        }

        // Insertar productos de ejemplo
        let bebidas_id: Option<(String,)> = sqlx::query_as(
            "SELECT id FROM categories WHERE name = 'Bebidas' LIMIT 1"
        )
        .fetch_optional(&self.pool)
        .await?;

        if let Some((cat_id,)) = bebidas_id {
            let products = vec![
                ("SKU001", "7501234567890", "Coca-Cola 600ml", "Refresco de cola", 25.00, 18.00, 50, 10),
                ("SKU002", "7501234567891", "Agua Mineral 1L", "Agua mineral natural", 15.00, 10.00, 100, 20),
                ("SKU003", "7501234567892", "Jugo de Naranja", "Jugo natural de naranja", 30.00, 22.00, 30, 5),
            ];

            for (sku, barcode, name, desc, price, cost, stock, min_stock) in products {
                sqlx::query(
                    r#"
                    INSERT OR IGNORE INTO products (id, sku, barcode, name, description, category_id, price, cost, stock, min_stock, unit, is_active, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pza', 1, datetime('now'), datetime('now'))
                    "#
                )
                .bind(uuid::Uuid::new_v4().to_string())
                .bind(sku)
                .bind(barcode)
                .bind(name)
                .bind(desc)
                .bind(cat_id.clone())
                .bind(price)
                .bind(cost)
                .bind(stock)
                .bind(min_stock)
                .execute(&self.pool)
                .await?;
            }
        }

        Ok(())
    }
}