-- Insert sample categories
INSERT INTO categories (id, name, description, color, icon, is_active, created_at)
VALUES 
  ('cat_001', 'Bebidas', 'Bebidas y refrescos', '#3b82f6', 'droplet', 1, datetime('now')),
  ('cat_002', 'Abarrotes', 'Productos de abarrotes', '#10b981', 'package', 1, datetime('now')),
  ('cat_003', 'Lácteos', 'Productos lácteos', '#f59e0b', 'milk', 1, datetime('now')),
  ('cat_004', 'Panadería', 'Pan y productos de panadería', '#ef4444', 'croissant', 1, datetime('now')),
  ('cat_005', 'Limpieza', 'Productos de limpieza', '#8b5cf6', 'sparkles', 1, datetime('now'))
ON CONFLICT(id) DO NOTHING;

-- Update products with categories
UPDATE products SET category_id = 'cat_001' WHERE sku = 'COCA600';
UPDATE products SET category_id = 'cat_004' WHERE sku = 'PAN001';
UPDATE products SET category_id = 'cat_003' WHERE sku = 'LECHE1L';
UPDATE products SET category_id = 'cat_002' WHERE sku = 'HUEVO18';
UPDATE products SET category_id = 'cat_001' WHERE sku = 'CAFE200';
