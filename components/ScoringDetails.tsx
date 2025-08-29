'use client';

import { getScoringDetails } from '@/lib/scoring';

interface Props {
  scores: any[];
  showDetails?: boolean;
}

export default function ScoringDetails({ scores, showDetails = false }: Props) {
  if (scores.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-sm">
        Belum ada penilaian
      </div>
    );
  }

  const details = getScoringDetails(scores);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-4">
        <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
          Nilai Final: {details.finalScore}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          ({scores.length} juri)
        </span>
      </div>

      {showDetails && (
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm space-y-2">
          <div className="font-medium text-gray-700 dark:text-gray-300">
            {details.method}
          </div>
          
          {details.usedScores.length > 0 && (
            <div>
              <span className="text-green-700 dark:text-green-400 font-medium">Nilai yang dipakai: </span>
              <span className="text-green-600 dark:text-green-300">
                {details.usedScores.join(', ')} = {details.finalScore}
              </span>
            </div>
          )}
          
          {details.discardedScores.length > 0 && (
            <div>
              <span className="text-red-700 dark:text-red-400 font-medium">Nilai yang dibuang: </span>
              <span className="text-red-600 dark:text-red-300">
                {details.discardedScores.join(', ')}
              </span>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Semua nilai juri: {scores.map(s => s.total_score).sort((a, b) => a - b).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}