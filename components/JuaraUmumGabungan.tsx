'use client';

import { useState, useEffect } from 'react';
import { DESA_LIST } from '@/types';
import { calculateFinalScore } from '@/lib/scoring';

interface JuaraUmumGabunganResult {
  desa: string;
  totalPutra: number;
  totalPutri: number;
  totalGabungan: number;
  sesiPutra: number;
  sesiPutri: number;
}

export default function JuaraUmumGabungan() {
  const [results, setResults] = useState<JuaraUmumGabunganResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchJuaraUmumGabungan();
        if (!isCancelled) {
          setResults(result);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching juara umum gabungan:', error);
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
  }, []);

  const fetchJuaraUmumGabungan = async (): Promise<JuaraUmumGabunganResult[]> => {
    try {
      // Fetch data untuk PUTRA dan PUTRI
      const [competitionsRes, scoresRes] = await Promise.all([
        fetch('/api/competitions?status=COMPLETED'),
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

      // Initialize results untuk semua desa
      const desaResults: Record<string, JuaraUmumGabunganResult> = {};
      
      DESA_LIST.forEach(desa => {
        desaResults[desa] = {
          desa,
          totalPutra: 0,
          totalPutri: 0,
          totalGabungan: 0,
          sesiPutra: 0,
          sesiPutri: 0
        };
      });

      // Process competitions
      const processedCompetitions = new Set<string>();
      
      competitions.forEach((comp: any) => {
        if (processedCompetitions.has(comp.id)) return;
        processedCompetitions.add(comp.id);
        
        const competitionScores = scores.filter((score: any) => 
          score.competition_id === comp.id
        );
        
        if (competitionScores.length > 0) {
          const validScores = competitionScores.filter(score => 
            typeof score.total_score === 'number'
          );
          
          if (validScores.length === 0) return;
          
          const finalScore = calculateFinalScore(validScores);
          
          if (!desaResults[comp.desa] || isNaN(finalScore) || finalScore < 0) return;
          
          // Tambahkan ke total sesuai kelas
          if (comp.kelas === 'PUTRA') {
            desaResults[comp.desa].totalPutra += finalScore;
            desaResults[comp.desa].sesiPutra++;
          } else if (comp.kelas === 'PUTRI') {
            desaResults[comp.desa].totalPutri += finalScore;
            desaResults[comp.desa].sesiPutri++;
          }
        }
      });

      // Calculate total gabungan dan filter yang ikut
      const finalResults = Object.values(desaResults)
        .map(result => ({
          ...result,
          totalGabungan: result.totalPutra + result.totalPutri
        }))
        .filter(result => result.sesiPutra > 0 || result.sesiPutri > 0) // Hanya yang ikut
        .sort((a, b) => b.totalGabungan - a.totalGabungan); // Sort by total gabungan

      console.log('=== JUARA UMUM GABUNGAN ===');
      finalResults.forEach((result, index) => {
        console.log(`${index + 1}. ${result.desa}: ${result.totalGabungan} poin (P:${result.totalPutra} + Pr:${result.totalPutri})`);
      });

      return finalResults;
    } catch (error) {
      console.error('Error fetching juara umum gabungan:', error);
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
          🏆 JUARA UMUM GABUNGAN (PUTRA + PUTRI)
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Rank</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Desa</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">Total PUTRA</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">Total PUTRI</th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">TOTAL GABUNGAN</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={result.desa} className={
                  index < 3 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-white dark:bg-gray-800'
                }>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-bold">
                    {index + 1}
                    {index === 0 && ' 🥇'}
                    {index === 1 && ' 🥈'}
                    {index === 2 && ' 🥉'}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                    {result.desa}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                    {result.totalPutra}
                    <div className="text-xs text-gray-500">({result.sesiPutra} sesi)</div>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                    {result.totalPutri}
                    <div className="text-xs text-gray-500">({result.sesiPutri} sesi)</div>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-bold text-primary-600 text-lg">
                    {result.totalGabungan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>🏆 <strong>Juara Umum:</strong> Desa dengan total poin gabungan PUTRA + PUTRI tertinggi</p>
          <p>📊 <strong>Perhitungan:</strong> Total semua final score dari sesi yang diikuti (middle 3 values per sesi)</p>
          <p>✅ <strong>Fleksibel:</strong> Desa boleh ikut kelas manapun sesuai kemampuan atlet</p>
          <p>🎯 <strong>Partisipasi:</strong> {results.length} desa berpartisipasi</p>
        </div>
      </div>
    </div>
  );
}