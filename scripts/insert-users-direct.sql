-- Insert users langsung tanpa hash
INSERT INTO users (username, password, role, created_at) VALUES
('juri1', 'password123', 'JURI', NOW()),
('juri2', 'password123', 'JURI', NOW()),
('juri3', 'password123', 'JURI', NOW()),
('juri4', 'password123', 'JURI', NOW()),
('juri5', 'password123', 'JURI', NOW()),
('sirkulator_putra', 'password123', 'SIRKULATOR_PUTRA', NOW()),
('sirkulator_putri', 'password123', 'SIRKULATOR_PUTRI', NOW())
ON CONFLICT (username) DO UPDATE SET
password = EXCLUDED.password,
role = EXCLUDED.role;