/**
 * Calculate final score using middle 3 values (remove highest and lowest)
 * This implements the new scoring system where:
 * - If 5 juries: remove highest and lowest, sum the middle 3
 * - If 4 juries: remove highest, sum the remaining 3
 * - If 3 juries: sum all 3
 * - If less than 3: sum all available
 */
export function calculateFinalScore(scores: any[]): number {
  if (scores.length === 0) {
    return 0;
  }
  
  if (scores.length < 3) {
    // If less than 3 scores, use all available scores
    return scores.reduce((sum: number, score: any) => sum + score.total_score, 0);
  }
  
  // Sort scores by total_score
  const sortedScores = scores.map(score => score.total_score).sort((a, b) => a - b);
  
  if (scores.length === 3) {
    // If exactly 3 scores, use all
    return sortedScores.reduce((sum, score) => sum + score, 0);
  }
  
  if (scores.length === 4) {
    // If 4 scores, remove only the highest, use the remaining 3
    return sortedScores.slice(0, -1).reduce((sum, score) => sum + score, 0);
  }
  
  // If 5 or more scores, remove highest and lowest, use middle values
  const middleScores = sortedScores.slice(1, -1);
  
  // If more than 5 scores, take only 3 middle values
  if (middleScores.length > 3) {
    const startIndex = Math.floor((middleScores.length - 3) / 2);
    return middleScores.slice(startIndex, startIndex + 3).reduce((sum, score) => sum + score, 0);
  }
  
  return middleScores.reduce((sum, score) => sum + score, 0);
}

/**
 * Get scoring details for display purposes
 * Returns information about which scores were used and which were discarded
 */
export function getScoringDetails(scores: any[]): {
  usedScores: number[];
  discardedScores: number[];
  finalScore: number;
  method: string;
} {
  if (scores.length === 0) {
    return {
      usedScores: [],
      discardedScores: [],
      finalScore: 0,
      method: 'No scores available'
    };
  }
  
  const allScores = scores.map(score => score.total_score);
  const sortedScores = [...allScores].sort((a, b) => a - b);
  
  if (scores.length < 3) {
    return {
      usedScores: sortedScores,
      discardedScores: [],
      finalScore: calculateFinalScore(scores),
      method: `All ${scores.length} scores used`
    };
  }
  
  if (scores.length === 3) {
    return {
      usedScores: sortedScores,
      discardedScores: [],
      finalScore: calculateFinalScore(scores),
      method: 'All 3 scores used'
    };
  }
  
  if (scores.length === 4) {
    return {
      usedScores: sortedScores.slice(0, -1),
      discardedScores: [sortedScores[sortedScores.length - 1]],
      finalScore: calculateFinalScore(scores),
      method: 'Highest score discarded, 3 lowest used'
    };
  }
  
  // 5 or more scores
  const middleScores = sortedScores.slice(1, -1);
  let usedScores: number[];
  
  if (middleScores.length > 3) {
    const startIndex = Math.floor((middleScores.length - 3) / 2);
    usedScores = middleScores.slice(startIndex, startIndex + 3);
  } else {
    usedScores = middleScores;
  }
  
  const discardedScores = sortedScores.filter(score => !usedScores.includes(score));
  
  return {
    usedScores,
    discardedScores,
    finalScore: calculateFinalScore(scores),
    method: 'Highest and lowest scores discarded, middle 3 used'
  };
}

/**
 * Calculate sum of middle 3 values for a specific criteria
 */
export function calculateMiddle3SumForCriteria(scores: any[], criteriaName: string): number {
  if (scores.length === 0) return 0;
  
  const criteriaValues = scores
    .map(score => score.criteria_scores?.[criteriaName] || 0)
    .sort((a, b) => a - b);
  
  if (criteriaValues.length < 3) {
    return criteriaValues.reduce((sum, val) => sum + val, 0);
  }
  
  if (criteriaValues.length === 3) {
    return criteriaValues.reduce((sum, val) => sum + val, 0);
  }
  
  if (criteriaValues.length === 4) {
    return criteriaValues.slice(0, -1).reduce((sum, val) => sum + val, 0);
  }
  
  const middleValues = criteriaValues.slice(1, -1);
  if (middleValues.length > 3) {
    const startIndex = Math.floor((middleValues.length - 3) / 2);
    return middleValues.slice(startIndex, startIndex + 3).reduce((sum, val) => sum + val, 0);
  }
  
  return middleValues.reduce((sum, val) => sum + val, 0);
}

/**
 * Get middle 3 values for a specific criteria (for display)
 */
export function getMiddle3ValuesForCriteria(scores: any[], criteriaName: string): number[] {
  if (scores.length === 0) return [];
  
  const criteriaValues = scores
    .map(score => score.criteria_scores?.[criteriaName] || 0)
    .sort((a, b) => a - b);
  
  if (criteriaValues.length < 3) {
    return criteriaValues;
  }
  
  if (criteriaValues.length === 3) {
    return criteriaValues;
  }
  
  if (criteriaValues.length === 4) {
    return criteriaValues.slice(0, -1);
  }
  
  const middleValues = criteriaValues.slice(1, -1);
  if (middleValues.length > 3) {
    const startIndex = Math.floor((middleValues.length - 3) / 2);
    return middleValues.slice(startIndex, startIndex + 3);
  }
  
  return middleValues;
}

/**
 * Get middle 3 juries based on total score
 */
export function getMiddle3Juries(scores: any[]): string[] {
  if (scores.length === 0) return [];
  
  const sortedScores = [...scores].sort((a, b) => a.total_score - b.total_score);
  
  if (sortedScores.length < 3) {
    return sortedScores.map(s => s.juri_name);
  }
  
  if (sortedScores.length === 3) {
    return sortedScores.map(s => s.juri_name);
  }
  
  if (sortedScores.length === 4) {
    return sortedScores.slice(0, -1).map(s => s.juri_name);
  }
  
  const middleScores = sortedScores.slice(1, -1);
  if (middleScores.length > 3) {
    const startIndex = Math.floor((middleScores.length - 3) / 2);
    return middleScores.slice(startIndex, startIndex + 3).map(s => s.juri_name);
  }
  
  return middleScores.map(s => s.juri_name);
}

/**
 * Get middle 3 juries with their scores for a specific criteria
 */
export function getMiddle3JuriesForCriteria(scores: any[], criteriaName: string): { juri: string; value: number }[] {
  const middle3Juries = getMiddle3Juries(scores);
  
  return scores
    .filter(score => middle3Juries.includes(score.juri_name))
    .map(score => ({
      juri: score.juri_name,
      value: score.criteria_scores?.[criteriaName] || 0
    }))
    .sort((a, b) => a.value - b.value);
}

/**
 * Get tie-breaker criteria priority based on category
 */
export function getTieBreakerPriority(kategori: string): string[] {
  const priorities: Record<string, string[]> = {
    'PERORANGAN': ['ORISINALITAS', 'KEMANTAPAN', 'STAMINA'],
    'ATT': ['ORISINALITAS', 'KEMANTAPAN', 'KEKAYAAAN TEKNIK'],
    'BERKELOMPOK': ['ORISINALITAS', 'KEMANTAPAN', 'KEKOMPAKAN'],
    'MASAL': ['ORISINALITAS', 'KEMANTAPAN', 'KEKOMPAKAN', 'KREATIFITAS'],
    'BERPASANGAN': ['TEKNIK SERANG BELA', 'KEMANTAPAN', 'PENGHAYATAN']
  };
  
  return priorities[kategori] || [];
}

/**
 * Apply tie-breaker logic to compare two results
 * Returns: -1 if a > b, 1 if b > a, 0 if tie
 */
export function applyTieBreaker(
  resultA: { finalScore: number; scores: any[] },
  resultB: { finalScore: number; scores: any[] },
  kategori: string
): number {
  // First compare by final score
  if (resultA.finalScore !== resultB.finalScore) {
    return resultB.finalScore - resultA.finalScore;
  }
  
  // If final scores are equal, apply tie-breaker
  const priorities = getTieBreakerPriority(kategori);
  
  for (const criteria of priorities) {
    const sumA = calculateMiddle3SumForCriteria(resultA.scores, criteria);
    const sumB = calculateMiddle3SumForCriteria(resultB.scores, criteria);
    
    if (sumA !== sumB) {
      return sumB - sumA; // Higher is better
    }
  }
  
  // If all criteria are equal, it's a tie (co-champion)
  return 0;
}

/**
 * Sort results with tie-breaker and assign rankings
 */
export function sortWithTieBreaker<T extends { finalScore: number; scores: any[] }>(
  results: T[],
  kategori: string
): (T & { rank: number })[] {
  // Sort using tie-breaker
  const sorted = [...results].sort((a, b) => applyTieBreaker(a, b, kategori));
  
  // Assign rankings with tie handling
  let currentRank = 1;
  const rankedResults = sorted.map((result, index) => {
    if (index > 0) {
      const prevResult = sorted[index - 1];
      const comparison = applyTieBreaker(result, prevResult, kategori);
      
      if (comparison !== 0) {
        // Different score, update rank
        currentRank = index + 1;
      }
      // If comparison === 0, keep same rank (tie)
    }
    
    return {
      ...result,
      rank: currentRank
    };
  });
  
  return rankedResults;
}
