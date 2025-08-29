'use client';

import { useState, useEffect } from 'react';
import { DESA_LIST, GOLONGAN_LIST, KATEGORI_LIST } from '@/types';
import { calculateFinalScore } from '@/lib/scoring';

interface Props {
  kelas: 'PUTRA' | 'PUTRI';
}

interface JuaraUmumResult {
  desa: string;
  totalScore: number;
  completedSessions: number;
  totalSessions: number;
  isComplete: boolean;
  categoryScores: Record<string, Record<string, number>>;
}

export default function JuaraUmumView({ kelas }: Props) {
  const [results, setResults] = useState<JuaraUmumResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchJuaraUmum();
        if (!isCancelled) {
          setResults(result);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error in useEffect:', error);
          setResults([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isCancelled = true;
    };
  }, [kelas]);

  const fetchJuaraUmum = async (): Promise<JuaraUmumResult[]> => {
    try {
      const [competitionsRes, scoresRes] = await Promise.all([
        fetch(`/api/competitions?kelas=${kelas}&status=COMPLETED`),
        fetch('/api/scores')
      ]);

      if (!competitionsRes.ok || !scoresRes.ok) {
        throw new Error(`API Error: competitions=${competitionsRes.status}, scores=${scoresRes.status}`);
      }
      
      const competitions = await competitionsRes.json();
      const scores = await scoresRes.json();
      
      // Validate API responses
      if (!Array.isArray(competitions)) {
        throw new Error('Invalid competitions data: not an array');
      }
      if (!Array.isArray(scores)) {
        throw new Error('Invalid scores data: not an array');
      }

      // Initialize results for all desa
      const desaResults: Record<string, JuaraUmumResult> = {};
      
      DESA_LIST.forEach(desa => {
        desaResults[desa] = {
          desa,
          totalScore: 0,
          completedSessions: 0,
          totalSessions: 25, // 5 golongan × 5 kategori
          isComplete: false,
          categoryScores: {}
        };
        
        // Initialize category scores
        GOLONGAN_LIST.forEach(golongan => {
          desaResults[desa].categoryScores[golongan] = {};
          KATEGORI_LIST.forEach(kategori => {
            desaResults[desa].categoryScores[golongan][kategori] = 0;
          });
        });
      });

      // Process competitions - ensure no duplicates
      const processedCompetitions = new Set<string>();
      
      competitions.forEach((comp: any) => {
        // Skip if already processed (prevent duplicates)
        if (processedCompetitions.has(comp.id)) {
          return;
        }
        processedCompetitions.add(comp.id);
        
        const competitionScores = scores.filter((score: any) => 
          score.competition_id === comp.id
        );
        
        if (competitionScores.length > 0) {
          // Validate score data structure
          const validScores = competitionScores.filter(score => {
            if (typeof score.total_score !== 'number') {
              console.error('Invalid score data:', score);
              return false;
            }
            return true;
          });
          
          if (validScores.length === 0) {
            console.warn(`No valid scores for competition ${comp.id}`);
            return;
          }
          
          const finalScore = calculateFinalScore(validScores);
          
          // Ensure desa exists in results
          if (!desaResults[comp.desa]) {
            console.warn(`Desa ${comp.desa} not found in DESA_LIST`);
            return;
          }
          
          // Validate final score
          if (isNaN(finalScore) || finalScore < 0) {
            console.error(`Invalid final score ${finalScore} for ${comp.desa} - ${comp.golongan} - ${comp.kategori}`);
            return;
          }
          
          // Debug per competition
          console.log(`Processing: ${comp.desa} - ${comp.golongan} - ${comp.kategori}`);
          console.log(`  Valid Scores: [${validScores.map(s => s.total_score).sort((a,b) => a-b).join(', ')}]`);
          console.log(`  Final Score: ${finalScore}`);
          
          desaResults[comp.desa].categoryScores[comp.golongan][comp.kategori] = finalScore;
          desaResults[comp.desa].totalScore += finalScore;
          desaResults[comp.desa].completedSessions++;
        } else {
          console.warn(`No scores found for competition ${comp.id} (${comp.desa} - ${comp.golongan} - ${comp.kategori})`);
        }
      });

      // Get all participating desa and mark completeness
      const allResults = Object.values(desaResults)
        .filter(result => result.completedSessions > 0) // Only show desa that participated
        .map(result => ({
          ...result,
          isComplete: result.completedSessions === 25
        }))
        .sort((a, b) => {
          // Sort by total score regardless of completeness (for better reference display)
          return b.totalScore - a.totalScore;
        });
      
      const finalResults = allResults;

      // Debug logging
      console.log('=== JUARA UMUM CALCULATION ===');
      console.log('Kelas:', kelas);
      console.log('Total COMPLETED competitions:', competitions.length);
      console.log('Total scores:', scores.length);
      console.log('Processed competitions:', processedCompetitions.size);
      console.log('Participating desa:', finalResults.length);
      finalResults.forEach((result, index) => {
        console.log(`${index + 1}. ${result.desa}: ${result.totalScore} poin (${result.completedSessions}/25 sesi)`);
      });
      console.log('===============================');

      return finalResults;
    } catch (error) {
      console.error('Error fetching juara umum:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          🏆 Juara Umum {kelas}
        </h3>
        
        {results.filter(r => r.isComplete).length === 0 && results.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                Tidak ada desa yang eligible untuk Juara Umum (belum ada yang lengkap 25 sesi)
              </p>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Rank</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Desa</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">Sesi Selesai</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">Status</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">Total Poin</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Pre-calculate complete participants once (performance optimization)
                const completeParticipants = results.filter(r => r.isComplete);
                
                return results.map((result, index) => {
                  const rankAmongComplete = result.isComplete 
                    ? completeParticipants.findIndex(r => r.desa === result.desa) + 1 
                    : 0;
                  const isTopThree = result.isComplete && rankAmongComplete <= 3;
                
                return (
                <tr key={result.desa} className={
                  result.isComplete 
                    ? (isTopThree ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-white dark:bg-gray-800')
                    : 'bg-gray-100 dark:bg-gray-700 opacity-60'
                }>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-bold">
                    {result.isComplete ? (
                      <>
                        {rankAmongComplete}
                        {rankAmongComplete === 1 && ' 🥇'}
                        {rankAmongComplete === 2 && ' 🥈'}
                        {rankAmongComplete === 3 && ' 🥉'}
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                    {result.desa}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                    {result.completedSessions}/{result.totalSessions}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      result.isComplete 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.isComplete ? 'LENGKAP' : 'TIDAK LENGKAP'}
                    </span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-bold text-primary-600">
                    {result.totalScore}
                  </td>
                </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>🏆 <strong>Juara Umum:</strong> HANYA desa yang mengikuti SEMUA 25 sesi (5 golongan × 5 kategori)</p>
          <p>📊 <strong>Perhitungan:</strong> Total poin dari semua sesi yang diikuti (middle 3 values per sesi)</p>
          <p>⚠️ <strong>Syarat Mutlak:</strong> Desa harus lengkap 25 sesi untuk masuk ranking juara umum</p>
          <p>📝 <strong>Referensi:</strong> Desa tidak lengkap ditampilkan sebagai informasi saja</p>
          <p>🔢 <strong>Eligible:</strong> {results.filter(r => r.isComplete).length} dari {results.length} desa</p>
        </div>
      </div>
    </div>
  );
}