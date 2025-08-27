-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('JURI', 'SIRKULATOR_PUTRA', 'SIRKULATOR_PUTRI')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create competitions table
CREATE TABLE competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  desa VARCHAR(50) NOT NULL CHECK (desa IN ('KALIDERES', 'CENGKARENG', 'KEBON JAHE', 'JELAMBAR', 'KAPUK MELATI', 'CIPONDOH', 'TAMAN KOTA', 'BANDARA')),
  kelas VARCHAR(10) NOT NULL CHECK (kelas IN ('PUTRA', 'PUTRI')),
  golongan VARCHAR(20) NOT NULL CHECK (golongan IN ('USIA DINI', 'PRA REMAJA', 'REMAJA', 'DEWASA', 'ISTIMEWA')),
  kategori VARCHAR(20) NOT NULL CHECK (kategori IN ('PERORANGAN', 'BERKELOMPOK', 'MASAL', 'ATT', 'BERPASANGAN')),
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scores table
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  juri_name VARCHAR(50) NOT NULL,
  criteria_scores JSONB NOT NULL,
  total_score DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(competition_id, juri_name)
);

-- Create results table
CREATE TABLE results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  desa VARCHAR(50) NOT NULL,
  kelas VARCHAR(10) NOT NULL,
  golongan VARCHAR(20) NOT NULL,
  kategori VARCHAR(20) NOT NULL,
  total_scores DECIMAL(6,2)[] NOT NULL,
  final_score DECIMAL(6,2) NOT NULL,
  ranking INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default users
INSERT INTO users (username, password_hash, role) VALUES
('juri1', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'JURI'), -- password123
('juri2', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'JURI'), -- password123
('juri3', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'JURI'), -- password123
('juri4', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'JURI'), -- password123
('juri5', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'JURI'), -- password123
('sirkulator_putra', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'SIRKULATOR_PUTRA'), -- password123
('sirkulator_putri', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'SIRKULATOR_PUTRI'); -- password123

-- Create indexes for better performance
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_desa_kelas ON competitions(desa, kelas);
CREATE INDEX idx_scores_competition_id ON scores(competition_id);
CREATE INDEX idx_scores_juri_name ON scores(juri_name);
CREATE INDEX idx_results_ranking ON results(ranking);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on competitions" ON competitions FOR ALL USING (true);
CREATE POLICY "Allow all operations on scores" ON scores FOR ALL USING (true);
CREATE POLICY "Allow all operations on results" ON results FOR ALL USING (true);