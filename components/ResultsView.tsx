'use client';

import { useState, useEffect } from 'react';
import { Competition, Score, DESA_LIST, KATEGORI_LIST, GOLONGAN_LIST } from '@/types';
import { calculateFinalScore } from '@/lib/scoring';
import ScoringDetails from './ScoringDetails';

interface Props {
  kelas: 'PUTRA' | 'PUTRI';
}

interface CompetitionResult {
  competition: Competition;
  scores: Score[];
  finalScore: number;
  juriCount: number;
}

export default function ResultsView({ kelas }: Props) {
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState<string>('ALL');
  const [selectedDesa, setSelectedDesa] = useState<string>('ALL');

  useEffect(() => {
    fetchResults();
  }, [kelas]);

  const fetchResults = async () => {
    try {
      const [competitionsRes, scoresRes] = await Promise.all([
        fetch(`/api/competitions?kelas=${kelas}`),
        fetch('/api/scores')
      ]);

      const competitions = await competitionsRes.json();
      const scores = await scoresRes.json();

      const resultsMap = new Map<string, CompetitionResult>();

      competitions.forEach((competition: Competition) => {
        const competitionScores = scores.filter((score: Score) => 
          score.competition_id === competition.id
        );

        const finalScore = competitionScores.length > 0
          ? calculateFinalScore(competitionScores)
          : 0;

        resultsMap.set(competition.id, {
          competition,
          scores: competitionScores,
          finalScore,
          juriCount: competitionScores.length
        });
      });

      setResults(Array.from(resultsMap.values()));
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(result => {
    if (selectedKategori !== 'ALL' && result.competition.kategori !== selectedKategori) {
      return false;
    }
    if (selectedDesa !== 'ALL' && result.competition.desa !== selectedDesa) {
      return false;
    }
    return true;
  });

  const groupedResults = filteredResults.reduce((acc, result) => {
    const key = `${result.competition.golongan}-${result.competition.kategori}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(result);
    return acc;
  }, {} as Record<string, CompetitionResult[]>);

  // Sort each group by final score (descending)
  Object.keys(groupedResults).forEach(key => {
    groupedResults[key].sort((a, b) => b.finalScore - a.finalScore);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedKategori}
          onChange={(e) => setSelectedKategori(e.target.value)}
          className="input-field w-auto"
        >
          <option value="ALL">Semua Kategori</option>
          {KATEGORI_LIST.map(kategori => (
            <option key={kategori} value={kategori}>{kategori}</option>
          ))}
        </select>

        <select
          value={selectedDesa}
          onChange={(e) => setSelectedDesa(e.target.value)}
          className="input-field w-auto"
        >
          <option value="ALL">Semua Desa</option>
          {DESA_LIST.map(desa => (
            <option key={desa} value={desa}>{desa}</option>
          ))}
        </select>
      </div>

      {Object.keys(groupedResults).length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada hasil pertandingan</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedResults).map(([key, results]) => {
            const [golongan, kategori] = key.split('-');
            return (
              <div key={key} className="card">
                <h3 className="text-lg font-semibold mb-4">
                  {golongan} - {kategori} ({kelas})
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Ranking</th>
                        <th className="text-left py-2">Desa</th>
                        <th className="text-center py-2">Detail Penilaian</th>
                        <th className="text-center py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={result.competition.id} className="border-b">
                          <td className="py-2">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold ${
                              index === 0 ? 'bg-yellow-500' :
                              index === 1 ? 'bg-gray-400' :
                              index === 2 ? 'bg-orange-600' :
                              'bg-gray-300 text-gray-700'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-2 font-medium">{result.competition.desa}</td>
                          <td className="py-2">
                            <ScoringDetails scores={result.scores} showDetails={true} />
                          </td>
                          <td className="py-2 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              result.competition.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {result.competition.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}