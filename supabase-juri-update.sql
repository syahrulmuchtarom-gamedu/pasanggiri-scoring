-- Step 1: Drop constraint first
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Update existing JURI users to JURI_PUTRA
UPDATE users SET role = 'JURI_PUTRA' WHERE role = 'JURI';

-- Step 3: Update any existing juri_putra users to JURI_PUTRA role
UPDATE users SET role = 'JURI_PUTRA' WHERE username LIKE 'juri%' AND role != 'JURI_PUTRA';

-- Step 4: Add new constraint
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'KOORDINATOR_PUTRA', 'KOORDINATOR_PUTRI', 'SIRKULATOR_PUTRA', 'SIRKULATOR_PUTRI', 'JURI_PUTRA', 'JURI_PUTRI', 'VIEWER'));

-- Step 5: Insert new JURI_PUTRI users
INSERT INTO users (username, password_hash, role, is_active) 
VALUES 
('juri_putri1', 'password123', 'JURI_PUTRI', true),
('juri_putri2', 'password123', 'JURI_PUTRI', true),
('juri_putri3', 'password123', 'JURI_PUTRI', true),
('juri_putri4', 'password123', 'JURI_PUTRI', true),
('juri_putri5', 'password123', 'JURI_PUTRI', true)
ON CONFLICT (username) DO UPDATE SET role = 'JURI_PUTRI';