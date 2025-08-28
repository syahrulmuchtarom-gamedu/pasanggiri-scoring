-- Update users table to support new roles and status
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- Insert super admin user (change password after first login)
INSERT INTO users (username, password, role, is_active) 
VALUES ('superadmin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SUPER_ADMIN', true)
ON CONFLICT (username) DO NOTHING;

-- Insert admin user
INSERT INTO users (username, password, role, is_active) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', true)
ON CONFLICT (username) DO NOTHING;

-- Insert koordinator users
INSERT INTO users (username, password, role, is_active) 
VALUES 
('koordinator_putra', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KOORDINATOR_PUTRA', true),
('koordinator_putri', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'KOORDINATOR_PUTRI', true)
ON CONFLICT (username) DO NOTHING;

-- Insert viewer user
INSERT INTO users (username, password, role, is_active) 
VALUES ('viewer', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'VIEWER', true)
ON CONFLICT (username) DO NOTHING;

-- Update existing users to have is_active = true
UPDATE users SET is_active = true WHERE is_active IS NULL;