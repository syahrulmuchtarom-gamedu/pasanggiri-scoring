'use client';

import { useState } from 'react';
import { getScoringDetails } from '@/lib/scoring';
import { Kategori } from '@/types';
import ScoreBreakdownModal from './ScoreBreakdownModal';

interface Props {
  scores: any[];
  showDetails?: boolean;
  kategori?: Kategori;
}

export default function ScoringDetails({ scores, showDetails = false, kategori }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScore, setSelectedScore] = useState<any>(null);

  const handleScoreClick = (score: any) => {
    setSelectedScore(score);
    setModalOpen(true);
  };
  if (scores.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-sm">
        Belum ada penilaian
      </div>
    );
  }

  const details = getScoringDetails(scores);

  return (
    <>
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

          <div className="text-xs mt-3 space-y-1">
            <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">Detail Nilai Juri:</div>
            {(() => {
              // Create array of scores with juri names
              const juriScores = scores.map(s => ({
                juri: s.juri_name,
                score: s.total_score
              }));
              
              // Sort by score
              juriScores.sort((a, b) => a.score - b.score);
              
              // Determine which scores are discarded
              const lowestScore = juriScores[0]?.score;
              const highestScore = juriScores[juriScores.length - 1]?.score;
              
              return juriScores.map((item, index) => {
                const isLowest = index === 0;
                const isHighest = index === juriScores.length - 1;
                const isDiscarded = isLowest || isHighest;
                const fullScore = scores.find(s => s.juri_name === item.juri);
                
                return (
                  <div key={index} className={isDiscarded ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {isDiscarded ? '🔴' : '🟢'} {item.juri}: 
                    {kategori ? (
                      <button
                        onClick={() => handleScoreClick(fullScore)}
                        className="inline-flex items-center gap-1 underline hover:no-underline font-medium"
                      >
                        {item.score} 🔍
                      </button>
                    ) : (
                      <span className="font-medium">{item.score}</span>
                    )}
                    {isLowest && ' (dibuang - terendah)'}
                    {isHighest && ' (dibuang - tertinggi)'}
                    {!isDiscarded && ' (dipakai)'}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}
    </div>

    {/* Modal */}
    {kategori && (
      <ScoreBreakdownModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        score={selectedScore}
        kategori={kategori}
      />
    )}
    </>
  );
}