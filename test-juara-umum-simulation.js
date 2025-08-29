// SIMULASI PERHITUNGAN JUARA UMUM
// Untuk memverifikasi logika perhitungan

const DESA_LIST = ['KALIDERES', 'CENGKARENG', 'KEBON JAHE'];
const GOLONGAN_LIST = ['USIA DINI', 'PRA REMAJA'];
const KATEGORI_LIST = ['PERORANGAN', 'BERKELOMPOK'];

// Simulasi data competitions
const competitions = [
  { id: '1', desa: 'KALIDERES', kelas: 'PUTRI', golongan: 'USIA DINI', kategori: 'PERORANGAN' },
  { id: '2', desa: 'KALIDERES', kelas: 'PUTRI', golongan: 'USIA DINI', kategori: 'BERKELOMPOK' },
  { id: '3', desa: 'KALIDERES', kelas: 'PUTRI', golongan: 'PRA REMAJA', kategori: 'PERORANGAN' },
  { id: '4', desa: 'CENGKARENG', kelas: 'PUTRI', golongan: 'USIA DINI', kategori: 'PERORANGAN' },
];

// Simulasi data scores (5 juri per kompetisi)
const scores = [
  // Competition 1: KALIDERES USIA DINI PERORANGAN
  { competition_id: '1', juri_name: 'juri1', total_score: 85 },
  { competition_id: '1', juri_name: 'juri2', total_score: 90 },
  { competition_id: '1', juri_name: 'juri3', total_score: 88 },
  { competition_id: '1', juri_name: 'juri4', total_score: 92 },
  { competition_id: '1', juri_name: 'juri5', total_score: 87 },
  
  // Competition 2: KALIDERES USIA DINI BERKELOMPOK
  { competition_id: '2', juri_name: 'juri1', total_score: 80 },
  { competition_id: '2', juri_name: 'juri2', total_score: 85 },
  { competition_id: '2', juri_name: 'juri3', total_score: 83 },
  { competition_id: '2', juri_name: 'juri4', total_score: 88 },
  { competition_id: '2', juri_name: 'juri5', total_score: 82 },
  
  // Competition 3: KALIDERES PRA REMAJA PERORANGAN
  { competition_id: '3', juri_name: 'juri1', total_score: 90 },
  { competition_id: '3', juri_name: 'juri2', total_score: 95 },
  { competition_id: '3', juri_name: 'juri3', total_score: 93 },
  { competition_id: '3', juri_name: 'juri4', total_score: 97 },
  { competition_id: '3', juri_name: 'juri5', total_score: 92 },
  
  // Competition 4: CENGKARENG USIA DINI PERORANGAN
  { competition_id: '4', juri_name: 'juri1', total_score: 88 },
  { competition_id: '4', juri_name: 'juri2', total_score: 93 },
  { competition_id: '4', juri_name: 'juri3', total_score: 91 },
  { competition_id: '4', juri_name: 'juri4', total_score: 95 },
  { competition_id: '4', juri_name: 'juri5', total_score: 89 },
];

// Fungsi calculateFinalScore (copy dari lib/scoring.ts)
function calculateFinalScore(scores) {
  if (scores.length === 0) return 0;
  if (scores.length < 3) {
    return scores.reduce((sum, score) => sum + score.total_score, 0);
  }
  
  const sortedScores = scores.map(score => score.total_score).sort((a, b) => a - b);
  
  if (scores.length === 3) {
    return sortedScores.reduce((sum, score) => sum + score, 0);
  }
  
  if (scores.length === 4) {
    return sortedScores.slice(0, 3).reduce((sum, score) => sum + score, 0);
  }
  
  // 5 juri: buang tertinggi & terendah, ambil 3 tengah
  const middleScores = sortedScores.slice(1, -1);
  return middleScores.reduce((sum, score) => sum + score, 0);
}

// SIMULASI PERHITUNGAN
console.log('=== SIMULASI JUARA UMUM CALCULATION ===');

// Initialize results
const desaResults = {};
DESA_LIST.forEach(desa => {
  desaResults[desa] = {
    desa,
    totalScore: 0,
    completedSessions: 0,
    categoryScores: {}
  };
  
  GOLONGAN_LIST.forEach(golongan => {
    desaResults[desa].categoryScores[golongan] = {};
    KATEGORI_LIST.forEach(kategori => {
      desaResults[desa].categoryScores[golongan][kategori] = 0;
    });
  });
});

// Process competitions
const processedCompetitions = new Set();

competitions.forEach(comp => {
  if (processedCompetitions.has(comp.id)) return;
  processedCompetitions.add(comp.id);
  
  const competitionScores = scores.filter(score => score.competition_id === comp.id);
  
  if (competitionScores.length > 0) {
    const finalScore = calculateFinalScore(competitionScores);
    
    console.log(`\n${comp.desa} - ${comp.golongan} - ${comp.kategori}:`);
    console.log(`  Scores: [${competitionScores.map(s => s.total_score).sort((a,b) => a-b).join(', ')}]`);
    console.log(`  Final Score: ${finalScore} (middle 3 values)`);
    
    desaResults[comp.desa].categoryScores[comp.golongan][comp.kategori] = finalScore;
    desaResults[comp.desa].totalScore += finalScore;
    desaResults[comp.desa].completedSessions++;
  }
});

// Final results
console.log('\n=== HASIL JUARA UMUM ===');
const finalResults = Object.values(desaResults)
  .filter(result => result.completedSessions > 0)
  .sort((a, b) => b.totalScore - a.totalScore);

finalResults.forEach((result, index) => {
  console.log(`${index + 1}. ${result.desa}: ${result.totalScore} poin (${result.completedSessions} sesi)`);
});

console.log('\n=== VERIFIKASI MANUAL ===');
console.log('KALIDERES:');
console.log('  Comp 1: [85,87,88,90,92] → middle 3: [87,88,90] = 265');
console.log('  Comp 2: [80,82,83,85,88] → middle 3: [82,83,85] = 250'); 
console.log('  Comp 3: [90,92,93,95,97] → middle 3: [92,93,95] = 280');
console.log('  Total: 265 + 250 + 280 = 795');

console.log('\nCENGKARENG:');
console.log('  Comp 4: [88,89,91,93,95] → middle 3: [89,91,93] = 273');
console.log('  Total: 273');

console.log('\n=== EXPECTED RANKING ===');
console.log('1. KALIDERES: 795 poin');
console.log('2. CENGKARENG: 273 poin');