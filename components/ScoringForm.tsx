'use client';

import { useState } from 'react';
import { Competition, SCORING_CRITERIA } from '@/types';

interface Props {
  competition: Competition;
  juriName: string;
  onSubmitted: () => void;
}

export default function ScoringForm({ competition, juriName, onSubmitted }: Props) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const criteria = SCORING_CRITERIA[competition.kategori];
  
  const totalScore = Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
  const maxPossibleScore = criteria.reduce((sum, c) => sum + c.max, 0);

  const handleScoreChange = (criteriaName: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setScores(prev => ({ ...prev, [criteriaName]: numValue }));
  };

  const validateScores = () => {
    for (const criterion of criteria) {
      const score = scores[criterion.name] || 0;
      if (score < criterion.min || score > criterion.max) {
        return `${criterion.name} harus antara ${criterion.min}-${criterion.max}`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateScores();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competition_id: competition.id,
          juri_name: juriName,
          criteria_scores: scores,
          total_score: totalScore,
        }),
      });

      if (response.ok) {
        onSubmitted();
      } else {
        const data = await response.json();
        setError(data.error || 'Gagal menyimpan nilai');
      }
    } catch (error) {
      setError('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {criteria.map(criterion => (
            <div key={criterion.name} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{criterion.name}</h3>
                  <p className="text-sm text-gray-600">{criterion.description}</p>
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {criterion.min}-{criterion.max}
                </span>
              </div>
              
              <div className="mt-3">
                <input
                  type="number"
                  min={criterion.min}
                  max={criterion.max}
                  step="0.1"
                  value={scores[criterion.name] || ''}
                  onChange={(e) => handleScoreChange(criterion.name, e.target.value)}
                  className="input-field text-lg font-medium text-center"
                  placeholder={`${criterion.min}-${criterion.max}`}
                  required
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Nilai:</span>
            <span className="text-2xl font-bold text-primary-600">
              {totalScore.toFixed(1)} / {maxPossibleScore}
            </span>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setScores({})}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Reset
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={loading || Object.keys(scores).length !== criteria.length}
          >
            {loading ? 'Menyimpan...' : 'Input Data'}
          </button>
        </div>
      </form>
    </div>
  );
}