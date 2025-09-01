'use client';

import { useState, useEffect } from 'react';
import { DESA_LIST, GOLONGAN_LIST, KATEGORI_LIST } from '@/types';
import { calculateFinalScore } from '@/lib/scoring';


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
      
      // Get all competitions with scores
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

      // Group by desa only (combine all golongan for each desa)
      const desaResults: Record<string, DesaResult> = {};

      competitions.forEach((comp: any) => {
        // Filter by selected filters
        if (selectedGolongan !== 'ALL' && comp.golongan !== selectedGolongan) return;
        if (selectedKategori !== 'ALL' && comp.kategori !== selectedKategori) return;

        const key = comp.desa; // Group by desa only
        
        if (!desaResults[key]) {
          desaResults[key] = {
            desa: comp.desa,
            kelas: comp.kelas,
            golongan: 'ALL', // Show all golongan combined
            categories: {},
            total_score: 0
          };
        }

        // Calculate total score for this competition using new scoring system
        const competitionScores = scores.filter((score: any) => score.competition_id === comp.id);
        const totalScore = calculateFinalScore(competitionScores);
        
        console.log(`Competition ${comp.desa}-${comp.kategori}: ${competitionScores.length} scores, total: ${totalScore}`);
        
        // Add score to existing category or create new
        if (desaResults[key].categories[comp.kategori]) {
          desaResults[key].categories[comp.kategori] += totalScore;
        } else {
          desaResults[key].categories[comp.kategori] = totalScore;
        }
        desaResults[key].total_score += totalScore;
      });

      // Convert to array and sort by desa name (alphabetical)
      const sortedResults = Object.values(desaResults).sort((a, b) => a.desa.localeCompare(b.desa));
      console.log('Final results:', sortedResults);
      setResults(sortedResults);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    // Create clean HTML for PDF
    const title = `Hasil ${selectedKategori === 'ALL' ? 'Semua Kategori' : selectedKategori} - ${kelas}${selectedGolongan !== 'ALL' ? ` - ${selectedGolongan}` : ''}`;
    
    const tableHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; margin-bottom: 30px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 0 auto; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; text-align: center; }
          td:first-child, td:last-child { text-align: center; font-weight: bold; }
          .total { color: #2563eb; }
          @media print {
            body { margin: 0; }
            h1 { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>
              <th>Desa</th>
              ${selectedKategori === 'ALL' ? KATEGORI_LIST.map(kat => `<th>${kat}</th>`).join('') : ''}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${results.map((result) => `
              <tr>
                <td>${result.desa}</td>
                ${selectedKategori === 'ALL' ? KATEGORI_LIST.map(kat => `<td style="text-align: center;">${result.categories[kat] || '-'}</td>`).join('') : ''}
                <td class="total">${result.total_score}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            }
          }
        </script>
      </body>
      </html>
    `;
    
    // Open new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(tableHTML);
      printWindow.document.close();
    }
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
    const headers = ['Desa', ...KATEGORI_LIST, 'Total'];
    const rows = results.map((result) => [
      result.desa,
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

  // Removed JuaraUmumView from individual class results
  // Juara Umum is now only available in the dedicated JUARA UMUM tab

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filter Ranking</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Kelas</label>
            <input 
              type="text" 
              value={kelas} 
              disabled 
              className="input-field bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Golongan</label>
            <select
              value={selectedGolongan}
              onChange={(e) => setSelectedGolongan(e.target.value)}
              className="input-field"
            >
              <option value="ALL">Semua Golongan</option>
              {GOLONGAN_LIST.map(golongan => (
                <option key={golongan} value={golongan}>{golongan}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Kategori</label>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="input-field"
            >
              <option value="ALL">Semua Kategori</option>
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
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Hasil {selectedKategori === 'ALL' ? 'Semua Kategori' : selectedKategori} - {kelas}
          {selectedGolongan !== 'ALL' && ` - ${selectedGolongan}`}
        </h3>
        
        {results.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Belum ada hasil untuk filter yang dipilih</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Desa</th>
                  {selectedKategori === 'ALL' && KATEGORI_LIST.map(kategori => (
                    <th key={kategori} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-white">{kategori}</th>
                  ))}
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-white">Total</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.desa} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium text-gray-900 dark:text-white">{result.desa}</td>
                    {selectedKategori === 'ALL' && KATEGORI_LIST.map(kategori => (
                      <td key={kategori} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-white">
                        {result.categories[kategori] || '-'}
                      </td>
                    ))}
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-bold text-primary-600 dark:text-primary-400">
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