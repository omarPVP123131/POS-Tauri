-- Insert sample products for testing
INSERT INTO products (id, sku, barcode, name, description, price, cost, stock, min_stock, unit, is_active, created_at, updated_at)
VALUES 
  ('prod_001', 'COCA600', '7501055363032', 'Coca-Cola 600ml', 'Refresco de cola 600ml', 18.50, 12.00, 150, 20, 'pz', 1, datetime('now'), datetime('now')),
  ('prod_002', 'PAN001', '7501000123456', 'Pan Blanco', 'Pan de caja blanco 680g', 35.00, 22.00, 80, 15, 'pz', 1, datetime('now'), datetime('now')),
  ('prod_003', 'LECHE1L', '7501234567890', 'Leche Entera 1L', 'Leche entera pasteurizada', 24.90, 18.00, 120, 25, 'lt', 1, datetime('now'), datetime('now')),
  ('prod_004', 'HUEVO18', '7501111222333', 'Huevo Rojo 18pz', 'Huevos rojos tamaño grande', 58.00, 42.00, 60, 10, 'paq', 1, datetime('now'), datetime('now')),
  ('prod_005', 'CAFE200', '7502222333444', 'Café Instantáneo 200g', 'Café soluble premium', 89.90, 65.00, 45, 8, 'pz', 1, datetime('now'), datetime('now'))
ON CONFLICT(id) DO NOTHING;
