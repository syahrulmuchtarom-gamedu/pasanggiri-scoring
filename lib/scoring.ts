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
      usedScores: sortedScores.slice(0, 3),
      discardedScores: [sortedScores[3]],
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
  
  // Recalculate usedScores based on actual indices for accuracy
  const actualUsedScores = allScores.filter((_, idx) => usedIndices.has(idx));
  
  return {
    usedScores: actualUsedScores,
    discardedScores,
    finalScore: calculateFinalScore(scores),
    method: 'Highest and lowest scores discarded, middle 3 used'
  };
}

// Simplified version that matches calculateFinalScore exactly
export function getScoringDetailsSimple(scores: any[]): {
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
  
  // Handle duplicate values correctly by tracking indices
  const usedIndices = new Set<number>();
  const sortedWithIndex = allScores.map((score, idx) => ({score, idx})).sort((a, b) => a.score - b.score);
  
  if (scores.length === 4) {
    // Mark first 3 as used
    for (let i = 0; i < 3; i++) {
      usedIndices.add(sortedWithIndex[i].idx);
    }
  } else if (scores.length >= 5) {
    // Mark middle values as used
    const middleStart = 1;
    const middleEnd = sortedWithIndex.length - 1;
    let middleCount = middleEnd - middleStart;
    
    if (middleCount > 3) {
      const startIdx = middleStart + Math.floor((middleCount - 3) / 2);
      for (let i = startIdx; i < startIdx + 3; i++) {
        usedIndices.add(sortedWithIndex[i].idx);
      }
    } else {
      for (let i = middleStart; i < middleEnd; i++) {
        usedIndices.add(sortedWithIndex[i].idx);
      }
    }
  } else {
    // All scores used
    allScores.forEach((_, idx) => usedIndices.add(idx));
  }
  
  const discardedScores = allScores.filter((_, idx) => !usedIndices.has(idx));
  
  const discardedScores = sortedScores.filter(score => !usedScores.includes(score));
  
  return {
    usedScores,
    discardedScores,
    finalScore: calculateFinalScore(scores),
    method: 'Highest and lowest scores discarded, middle 3 used'
  };
}