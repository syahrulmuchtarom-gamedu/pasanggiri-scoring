'use client';

import { useState, useEffect } from 'react';
import { DESA_LIST, GOLONGAN_LIST, KATEGORI_LIST } from '@/types';

interface Props {
  kelas: 'PUTRA' | 'PUTRI';
}

interface DesaResult {
  desa: string;
  kelas: string;
  golongan: string;
  categories: Record<string, number>;
  total_score: number;
}

export default function RankingView({ kelas }: Props) {
  const [results, setResults] = useState<DesaResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGolongan, setSelectedGolongan] = useState<string>('ALL');
  const [selectedKategori, setSelectedKategori] = useState<string>('ALL');

  useEffect(() => {
    fetchResults();
  }, [kelas, selectedGolongan, selectedKategori]);

  const fetchResults = async () => {
    try {
      console.log('Fetching results for:', { kelas, selectedGolongan, selectedKategori });
      
      // Get all completed competitions with scores
      const [competitionsRes, scoresRes] = await Promise.all([
        fetch(`/api/competitions?kelas=${kelas}&status=COMPLETED`),
        fetch('/api/scores')
      ]);

      if (!competitionsRes.ok || !scoresRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const competitions = await competitionsRes.json();
      const scores = await scoresRes.json();
      
      console.log('Competitions:', competitions);
      console.log('Scores:', scores);

      // Group by desa, golongan, kelas
      const desaResults: Record<string, DesaResult> = {};

      competitions.forEach((comp: any) => {
        // Filter by selected filters
        if (selectedGolongan !== 'ALL' && comp.golongan !== selectedGolongan) return;
        if (selectedKategori !== 'ALL' && comp.kategori !== selectedKategori) return;

        const key = `${comp.desa}-${comp.kelas}-${comp.golongan}`;
        
        if (!desaResults[key]) {
          desaResults[key] = {
            desa: comp.desa,
            kelas: comp.kelas,
            golongan: comp.golongan,
            categories: {},
            total_score: 0
          };
        }

        // Calculate total score for this competition (sum of all juri scores)
        const competitionScores = scores.filter((score: any) => score.competition_id === comp.id);
        const totalScore = competitionScores.reduce((sum: number, score: any) => sum + score.total_score, 0);
        
        console.log(`Competition ${comp.desa}-${comp.kategori}: ${competitionScores.length} scores, total: ${totalScore}`);
        
        desaResults[key].categories[comp.kategori] = totalScore;
        desaResults[key].total_score += totalScore;
      });

      // Convert to array and sort by total score
      const sortedResults = Object.values(desaResults).sort((a, b) => b.total_score - a.total_score);
      console.log('Final results:', sortedResults);
      setResults(sortedResults);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    window.print();
  };

  const exportToExcel = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ranking-${kelas}-${selectedGolongan}-${selectedKategori}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCSV = () => {
    const headers = ['Rank', 'Desa', 'Golongan', ...KATEGORI_LIST, 'Total'];
    const rows = results.map((result, index) => [
      index + 1,
      result.desa,
      result.golongan,
      ...KATEGORI_LIST.map(cat => result.categories[cat] || 0),
      result.total_score
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
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
      {/* Filters */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Filter Ranking</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Kelas</label>
            <input 
              type="text" 
              value={kelas} 
              disabled 
              className="w-full px-3 py-2 border rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Golongan</label>
            <select
              value={selectedGolongan}
              onChange={(e) => setSelectedGolongan(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="ALL">Semua Golongan</option>
              {GOLONGAN_LIST.map(golongan => (
                <option key={golongan} value={golongan}>{golongan}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Kategori</label>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="ALL">Juara Umum</option>
              {KATEGORI_LIST.map(kategori => (
                <option key={kategori} value={kategori}>{kategori}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          Ranking {selectedKategori === 'ALL' ? 'Juara Umum' : selectedKategori} - {kelas}
          {selectedGolongan !== 'ALL' && ` - ${selectedGolongan}`}
        </h3>
        
        {results.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Belum ada hasil untuk filter yang dipilih</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-4 py-2 text-left">Rank</th>
                  <th className="border px-4 py-2 text-left">Desa</th>
                  <th className="border px-4 py-2 text-left">Golongan</th>
                  {selectedKategori === 'ALL' && KATEGORI_LIST.map(kategori => (
                    <th key={kategori} className="border px-4 py-2 text-center">{kategori}</th>
                  ))}
                  <th className="border px-4 py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={`${result.desa}-${result.golongan}`} className={index < 3 ? 'bg-yellow-50' : ''}>
                    <td className="border px-4 py-2 font-bold">
                      {index + 1}
                      {index === 0 && ' 🥇'}
                      {index === 1 && ' 🥈'}
                      {index === 2 && ' 🥉'}
                    </td>
                    <td className="border px-4 py-2 font-medium">{result.desa}</td>
                    <td className="border px-4 py-2">{result.golongan}</td>
                    {selectedKategori === 'ALL' && KATEGORI_LIST.map(kategori => (
                      <td key={kategori} className="border px-4 py-2 text-center">
                        {result.categories[kategori] || '-'}
                      </td>
                    ))}
                    <td className="border px-4 py-2 text-center font-bold text-primary-600">
                      {result.total_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}