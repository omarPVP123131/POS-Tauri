-- Insert sample customers for testing
INSERT INTO customers (id, name, email, phone, rfc, address, city, state, postal_code, credit_limit, current_balance, loyalty_points, is_active, created_at, updated_at)
VALUES 
  ('cust_001', 'María González López', 'maria.gonzalez@email.com', '5512345678', 'GOLM850215ABC', 'Av. Insurgentes 123', 'CDMX', 'Ciudad de México', '03100', 10000.00, 0.00, 250, 1, datetime('now', '-6 months'), datetime('now')),
  ('cust_002', 'Juan Pérez Ramírez', 'juan.perez@email.com', '5523456789', 'PERJ900315DEF', 'Calle Reforma 456', 'Guadalajara', 'Jalisco', '44100', 5000.00, 0.00, 180, 1, datetime('now', '-4 months'), datetime('now')),
  ('cust_003', 'Ana Martínez Cruz', 'ana.martinez@email.com', '5534567890', 'MACA920420GHI', 'Blvd. Juárez 789', 'Monterrey', 'Nuevo León', '64000', 15000.00, 0.00, 420, 1, datetime('now', '-8 months'), datetime('now'))
ON CONFLICT(id) DO NOTHING;
