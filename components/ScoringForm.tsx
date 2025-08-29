'use client';

import { useState } from 'react';
import { Competition, SCORING_CRITERIA } from '@/types';
import { SmartScoringAssistant } from './ui';

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
    // Force integer only - no decimals allowed
    const numValue = parseInt(value) || 0;
    setScores(prev => ({ ...prev, [criteriaName]: numValue }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Prevent decimal point and comma input
    if (e.key === '.' || e.key === ',') {
      e.preventDefault();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    // Remove any decimal values that might appear
    const target = e.target as HTMLInputElement;
    if (target.value.includes('.') || target.value.includes(',')) {
      target.value = Math.floor(parseFloat(target.value) || 0).toString();
    }
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
    <div className="card max-w-2xl mx-auto shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Form Penilaian</h2>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span>🥋</span>
          <span>{competition.desa} - {competition.kategori}</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2 animate-shake">
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {criteria.map(criterion => (
            <div key={criterion.name} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{criterion.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{criterion.description}</p>
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {criterion.min}-{criterion.max}
                </span>
              </div>
              
              <div className="mt-3">
                <input
                  type="number"
                  min={criterion.min}
                  max={criterion.max}
                  step="1"
                  value={scores[criterion.name] || ''}
                  onChange={(e) => handleScoreChange(criterion.name, e.target.value)}
                  onKeyPress={handleKeyPress}
                  onInput={handleInput}
                  className="input-field text-lg font-medium text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder={`${criterion.min}-${criterion.max}`}
                  required
                />
              </div>
            </div>
          ))}
        </div>

        {/* Smart Scoring Assistant */}
        <SmartScoringAssistant 
          currentScores={scores}
          kategori={competition.kategori}
          onSuggestion={(suggestion) => console.log('Suggestion:', suggestion)}
        />

        <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-primary-200 dark:border-primary-800">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900 dark:text-white">Total Nilai:</span>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {totalScore}
              </span>
              <span className="text-lg text-gray-500 dark:text-gray-400">/{maxPossibleScore}</span>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {((totalScore / maxPossibleScore) * 100).toFixed(1)}% dari maksimal
              </div>
            </div>
          </div>
          <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(totalScore / maxPossibleScore) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setScores({})}
            className="btn-secondary flex-1 hover:scale-105 transition-transform"
            disabled={loading}
          >
            🔄 Reset
          </button>
          <button
            type="submit"
            className="btn-primary flex-1 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || Object.keys(scores).length !== criteria.length}
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Menyimpan...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <span>✍️</span>
                <span>Input Data</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}