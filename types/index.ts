export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'KOORDINATOR_PUTRA' | 'KOORDINATOR_PUTRI' | 'SIRKULATOR_PUTRA' | 'SIRKULATOR_PUTRI' | 'JURI' | 'VIEWER';

export type Golongan = 'USIA DINI' | 'PRA REMAJA' | 'REMAJA' | 'DEWASA' | 'ISTIMEWA';
export type Kelas = 'PUTRA' | 'PUTRI';
export type Kategori = 'PERORANGAN' | 'BERKELOMPOK' | 'MASAL' | 'ATT' | 'BERPASANGAN';
export type Desa = 'KALIDERES' | 'CENGKARENG' | 'KEBON JAHE' | 'JELAMBAR' | 'KAPUK MELATI' | 'CIPONDOH' | 'TAMAN KOTA' | 'BANDARA';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  username: string;
  action: string;
  details: string;
  created_at: string;
}

export interface Competition {
  id: string;
  desa: Desa;
  kelas: Kelas;
  kategori: Kategori;
  golongan: Golongan;
  status: 'ACTIVE' | 'COMPLETED';
  created_at: string;
}

export interface Score {
  id: string;
  competition_id: string;
  juri_name: string;
  criteria_scores: Record<string, number>;
  total_score: number;
  created_at: string;
}

export interface Result {
  id: string;
  desa: Desa;
  kelas: Kelas;
  kategori: Kategori;
  golongan: Golongan;
  total_scores: number[];
  final_score: number;
  ranking: number;
  created_at: string;
}

export interface ScoringCriteria {
  name: string;
  min: number;
  max: number;
  description: string;
}

export const SCORING_CRITERIA: Record<Kategori, ScoringCriteria[]> = {
  PERORANGAN: [
    { name: 'ORISINALITAS', min: 39, max: 50, description: 'Kebenaran Gerak Sesuai Kaidah Beladiri Pencak Silat' },
    { name: 'KEMANTAPAN', min: 20, max: 25, description: 'Kemantapan Gerak, Kemantapan Irama Gerak' },
    { name: 'STAMINA', min: 20, max: 25, description: 'Tenaga dan Stamina' }
  ],
  BERKELOMPOK: [
    { name: 'ORISINALITAS', min: 39, max: 50, description: 'Kebenaran Gerak Sesuai Kaidah Beladiri Pencak Silat' },
    { name: 'KEMANTAPAN', min: 20, max: 25, description: 'Kemantapan Gerak, Kemantapan Irama Gerak' },
    { name: 'KEKOMPAKAN', min: 14, max: 25, description: 'Kekompakan dan Soliditas Pesilat' }
  ],
  MASAL: [
    { name: 'ORISINALITAS', min: 14, max: 25, description: 'Kebenaran Gerak Sesuai Kaidah Beladiri' },
    { name: 'KEMANTAPAN', min: 20, max: 25, description: 'Kemantapan Gerak, Kemantapan Irama Gerak' },
    { name: 'KEKOMPAKAN', min: 14, max: 25, description: 'Kekompakan dan Soliditas Pesilat' },
    { name: 'KREATIFITAS', min: 20, max: 25, description: 'Formasi dan Pola Lantai' }
  ],
  ATT: [
    { name: 'ORISINALITAS', min: 35, max: 50, description: 'Kebenaran Gerak Sesuai Kaidah BELADIRI Pencak Silat' },
    { name: 'KEMANTAPAN', min: 20, max: 25, description: 'Kemantapan Gerak, Ketepatan Teknik' },
    { name: 'KEKAYAAAN TEKNIK', min: 20, max: 25, description: 'Kekayaan Teknik' }
  ],
  BERPASANGAN: [
    { name: 'TEKNIK SERANG BELA', min: 45, max: 50, description: 'Kualitas Teknik, Kekayaan Teknik, Keterampilan, Logika' },
    { name: 'KEMANTAPAN', min: 20, max: 25, description: 'Kemantapan Gerak, Kekompakan dan Soliditas Pesilat, Tenaga dan Stamina' },
    { name: 'PENGHAYATAN', min: 20, max: 25, description: 'Ekspresi, Penghayatan Gerak, Keserasian Irama Gerak' }
  ]
};

export const DESA_LIST: Desa[] = ['KALIDERES', 'CENGKARENG', 'KEBON JAHE', 'JELAMBAR', 'KAPUK MELATI', 'CIPONDOH', 'TAMAN KOTA', 'BANDARA'];
export const GOLONGAN_LIST: Golongan[] = ['USIA DINI', 'PRA REMAJA', 'REMAJA', 'DEWASA', 'ISTIMEWA'];
export const KELAS_LIST: Kelas[] = ['PUTRA', 'PUTRI'];
export const KATEGORI_LIST: Kategori[] = ['PERORANGAN', 'BERKELOMPOK', 'MASAL', 'ATT', 'BERPASANGAN'];