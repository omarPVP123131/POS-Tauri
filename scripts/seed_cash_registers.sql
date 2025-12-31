-- Insert default cash registers
INSERT INTO cash_registers (id, name, location, is_active, created_at)
VALUES 
  ('cr_001', 'Caja Principal', 'Mostrador 1', 1, datetime('now')),
  ('cr_002', 'Caja 2', 'Mostrador 2', 1, datetime('now')),
  ('cr_003', 'Caja Express', 'Entrada', 1, datetime('now'))
ON CONFLICT(id) DO NOTHING;
