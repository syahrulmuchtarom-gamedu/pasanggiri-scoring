'use client';

import { useState, useEffect } from 'react';
import { DESA_LIST, GOLONGAN_LIST, KATEGORI_LIST, SCORING_CRITERIA } from '@/types';
import { calculateFinalScore, calculateMiddle3SumForCriteria, getMiddle3ValuesForCriteria } from '@/lib/scoring';


interface Props {
  kelas: 'PUTRA' | 'PUTRI';
}

interface DesaResult {
  desa: string;
  kelas: string;
  golongan: string;
  categories: Record<string, number>;
  categoryDetails: Record<string, any[]>; // Store scores for each category
  total_score: number;
  rank?: number;
}

export default function RankingView({ kelas }: Props) {
  const [results, setResults] = useState<DesaResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGolongan, setSelectedGolongan] = useState<string>('ALL');
  const [selectedKategori, setSelectedKategori] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ desa: string; kategori: string; scores: any[] } | null>(null);

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
            categoryDetails: {},
            total_score: 0
          };
        }

        // Calculate total score for this competition using new scoring system
        const competitionScores = scores.filter((score: any) => score.competition_id === comp.id);
        const totalScore = calculateFinalScore(competitionScores);
        
        console.log(`Competition ${comp.desa}-${comp.kategori}: ${competitionScores.length} scores, total: ${totalScore}`);
        
        // Store scores for detail view
        if (!desaResults[key].categoryDetails[comp.kategori]) {
          desaResults[key].categoryDetails[comp.kategori] = [];
        }
        desaResults[key].categoryDetails[comp.kategori].push(...competitionScores);
        
        // Add score to existing category or create new
        if (desaResults[key].categories[comp.kategori]) {
          desaResults[key].categories[comp.kategori] += totalScore;
        } else {
          desaResults[key].categories[comp.kategori] = totalScore;
        }
        desaResults[key].total_score += totalScore;
      });

      // Convert to array and sort by total score (descending)
      const sortedResults = Object.values(desaResults).sort((a, b) => b.total_score - a.total_score);
      
      // Assign rankings with tie handling
      let currentRank = 1;
      const rankedResults = sortedResults.map((result, index) => {
        if (index > 0 && sortedResults[index - 1].total_score !== result.total_score) {
          currentRank = index + 1;
        }
        return { ...result, rank: currentRank };
      });
      
      console.log('Final results:', rankedResults);
      setResults(rankedResults);
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

  const handleCategoryClick = (desa: string, kategori: string, scores: any[]) => {
    if (scores && scores.length > 0) {
      setModalData({ desa, kategori, scores });
      setModalOpen(true);
    }
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
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-white">Rank</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Desa</th>
                  {selectedKategori === 'ALL' && KATEGORI_LIST.map(kategori => (
                    <th key={kategori} className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-white">{kategori}</th>
                  ))}
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-white">Total</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => {
                  const isTied = results.filter(r => r.rank === result.rank).length > 1;
                  return (
                    <tr key={result.desa} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold ${
                            result.rank === 1 ? 'bg-yellow-500' :
                            result.rank === 2 ? 'bg-gray-400' :
                            result.rank === 3 ? 'bg-orange-600' :
                            'bg-gray-300 text-gray-700'
                          }`}>
                            {result.rank}
                          </span>
                          {isTied && (
                            <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
                              (Bersama)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium text-gray-900 dark:text-white">{result.desa}</td>
                      {selectedKategori === 'ALL' && KATEGORI_LIST.map(kategori => (
                        <td 
                          key={kategori} 
                          className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-white"
                        >
                          {result.categories[kategori] ? (
                            <button
                              onClick={() => handleCategoryClick(result.desa, kategori, result.categoryDetails[kategori] || [])}
                              className="text-primary-600 dark:text-primary-400 hover:underline font-semibold cursor-pointer"
                              title="Klik untuk lihat detail kriteria"
                            >
                              {result.categories[kategori]} 🔍
                            </button>
                          ) : '-'}
                        </td>
                      ))}
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-bold text-primary-600 dark:text-primary-400">
                        {result.total_score}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Kriteria */}
      {modalOpen && modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setModalOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Detail Kriteria - {modalData.desa}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Kategori: {modalData.kategori}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Nilai: <span className="font-bold text-primary-600 dark:text-primary-400">{calculateFinalScore(modalData.scores)}</span>
              </p>
            </div>

            <div className="space-y-4">
              {SCORING_CRITERIA[modalData.kategori as keyof typeof SCORING_CRITERIA]?.map((criteria) => {
                const sum = calculateMiddle3SumForCriteria(modalData.scores, criteria.name);
                return (
                  <div key={criteria.name} className="border border-gray-300 dark:border-gray-600 rounded p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-semibold text-gray-900 dark:text-white">{criteria.name}</h5>
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{sum}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{criteria.description}</p>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Range: {criteria.min} - {criteria.max}
                    </div>
                    <div className="mt-2 text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Nilai 3 juri tengah: </span>
                      {getMiddle3ValuesForCriteria(modalData.scores, criteria.name).map((val, idx, arr) => (
                        <span key={idx} className="text-green-600 dark:text-green-400 font-semibold">
                          {val}
                          {idx < arr.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
