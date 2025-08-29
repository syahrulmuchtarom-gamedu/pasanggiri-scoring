'use client';

import { useState, useEffect } from 'react';
import { Score } from '@/types';

interface SmartScoringAssistantProps {
  currentScores: Record<string, number>;
  kategori: string;
  onSuggestion: (suggestion: string) => void;
}

export default function SmartScoringAssistant({ currentScores, kategori, onSuggestion }: SmartScoringAssistantProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    analyzeScoringPattern();
  }, [currentScores, kategori]);

  const analyzeScoringPattern = () => {
    const newSuggestions: string[] = [];
    const newWarnings: string[] = [];
    
    const scores = Object.values(currentScores).filter(s => s > 0);
    if (scores.length === 0) return;

    // Check for extreme values
    const total = scores.reduce((sum, score) => sum + score, 0);
    const average = total / scores.length;
    
    Object.entries(currentScores).forEach(([criteriaName, score]) => {
      if (score === 0) return;
      
      // Too low warning
      if (score < average * 0.7) {
        newWarnings.push(`⚠️ ${criteriaName}: Nilai ${score} tampak rendah untuk kategori ${kategori}`);
      }
      
      // Too high warning  
      if (score > average * 1.3) {
        newWarnings.push(`⚠️ ${criteriaName}: Nilai ${score} tampak tinggi, pastikan sesuai kriteria`);
      }
    });

    // Consistency check
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
    if (variance > 100) {
      newWarnings.push('📊 Perbedaan nilai antar kriteria cukup besar, periksa kembali');
    }

    // Smart suggestions based on kategori
    if (kategori === 'PERORANGAN') {
      if (currentScores['Orisinalitas'] && currentScores['Orisinalitas'] < 42) {
        newSuggestions.push('💡 Untuk PERORANGAN, Orisinalitas biasanya 42-48 poin');
      }
    }

    setSuggestions(newSuggestions);
    setWarnings(newWarnings);
  };

  if (suggestions.length === 0 && warnings.length === 0) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center space-x-2">
        <span className="text-lg">🤖</span>
        <h3 className="font-medium text-blue-900 dark:text-blue-100">Smart Scoring Assistant</h3>
      </div>
      
      {warnings.map((warning, index) => (
        <div key={index} className="text-sm text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 p-2 rounded">
          {warning}
        </div>
      ))}
      
      {suggestions.map((suggestion, index) => (
        <div key={index} className="text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
          {suggestion}
        </div>
      ))}
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        💡 Saran berdasarkan analisis pola penilaian kompetisi sebelumnya
      </div>
    </div>
  );
}