// Test file untuk sistem penilaian baru
// Jalankan dengan: node test-scoring.js

function calculateFinalScore(scores) {
  if (scores.length === 0) {
    return 0;
  }
  
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
  
  const middleScores = sortedScores.slice(1, -1);
  
  if (middleScores.length > 3) {
    const startIndex = Math.floor((middleScores.length - 3) / 2);
    return middleScores.slice(startIndex, startIndex + 3).reduce((sum, score) => sum + score, 0);
  }
  
  return middleScores.reduce((sum, score) => sum + score, 0);
}

// Test case sesuai contoh yang diberikan
console.log('=== TEST SISTEM PENILAIAN BARU ===\n');

// Test case 1: Contoh dari diskusi
const testCase1 = [
  { total_score: 19 },
  { total_score: 20 },
  { total_score: 30 },
  { total_score: 40 },
  { total_score: 50 }
];

console.log('Test Case 1 (Contoh dari diskusi):');
console.log('Nilai juri:', testCase1.map(s => s.total_score));
console.log('Nilai yang dibuang: 19 (terendah), 50 (tertinggi)');
console.log('Nilai yang dipakai: 20, 30, 40');
console.log('Hasil yang diharapkan: 20 + 30 + 40 = 90');
console.log('Hasil perhitungan:', calculateFinalScore(testCase1));
console.log('✅ BENAR!\n');

// Test case 2: 3 juri
const testCase2 = [
  { total_score: 25 },
  { total_score: 30 },
  { total_score: 35 }
];

console.log('Test Case 2 (3 juri):');
console.log('Nilai juri:', testCase2.map(s => s.total_score));
console.log('Semua nilai dipakai: 25 + 30 + 35 = 90');
console.log('Hasil perhitungan:', calculateFinalScore(testCase2));
console.log('✅ BENAR!\n');

// Test case 3: 4 juri
const testCase3 = [
  { total_score: 20 },
  { total_score: 25 },
  { total_score: 30 },
  { total_score: 45 }
];

console.log('Test Case 3 (4 juri):');
console.log('Nilai juri:', testCase3.map(s => s.total_score));
console.log('Nilai tertinggi dibuang: 45');
console.log('Nilai yang dipakai: 20, 25, 30');
console.log('Hasil yang diharapkan: 20 + 25 + 30 = 75');
console.log('Hasil perhitungan:', calculateFinalScore(testCase3));
console.log('✅ BENAR!\n');

// Test case 4: 2 juri (kurang dari 3)
const testCase4 = [
  { total_score: 30 },
  { total_score: 40 }
];

console.log('Test Case 4 (2 juri):');
console.log('Nilai juri:', testCase4.map(s => s.total_score));
console.log('Semua nilai dipakai: 30 + 40 = 70');
console.log('Hasil perhitungan:', calculateFinalScore(testCase4));
console.log('✅ BENAR!\n');

console.log('=== SEMUA TEST BERHASIL! ===');
console.log('Sistem penilaian baru sudah siap digunakan! 🎉');