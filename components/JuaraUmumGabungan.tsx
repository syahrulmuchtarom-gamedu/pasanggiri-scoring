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

  const exportToPDF = () => {
    const title = 'JUARA UMUM PASANGGIRI JAKARTA BARAT CENGKARENG';
    
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
          .rank-1 { background-color: #fff9c4; }
          .rank-2 { background-color: #f3f4f6; }
          .rank-3 { background-color: #fef3c7; }
          .total { color: #2563eb; font-size: 18px; }
          .sesi { font-size: 10px; color: #666; }
          @media print {
            body { margin: 0; }
            h1 { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>🏆 ${title}</h1>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Desa</th>
              <th>Total PUTRA</th>
              <th>Total PUTRI</th>
              <th>TOTAL GABUNGAN</th>
            </tr>
          </thead>
          <tbody>
            ${results.map((result, index) => `
              <tr class="${index < 3 ? `rank-${index + 1}` : ''}">
                <td>
                  ${index + 1}
                  ${index === 0 ? ' 🥇' : index === 1 ? ' 🥈' : index === 2 ? ' 🥉' : ''}
                </td>
                <td>${result.desa}</td>
                <td style="text-align: center;">
                  ${result.totalPutra}<br>
                  <span class="sesi">(${result.sesiPutra} sesi)</span>
                </td>
                <td style="text-align: center;">
                  ${result.totalPutri}<br>
                  <span class="sesi">(${result.sesiPutri} sesi)</span>
                </td>
                <td class="total">${result.totalGabungan}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 30px; font-size: 12px; color: #666;">
          <p><strong>Juara Umum:</strong> Desa dengan total poin gabungan PUTRA + PUTRI tertinggi</p>
          <p><strong>Perhitungan:</strong> Total semua final score dari sesi yang diikuti (middle 3 values per sesi)</p>
          <p><strong>Partisipasi:</strong> ${results.length} desa berpartisipasi</p>
        </div>
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
    a.download = 'juara-umum-gabungan.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCSV = () => {
    const headers = ['Rank', 'Desa', 'Total PUTRA', 'Sesi PUTRA', 'Total PUTRI', 'Sesi PUTRI', 'TOTAL GABUNGAN'];
    const rows = results.map((result, index) => [
      index + 1,
      result.desa,
      result.totalPutra,
      result.sesiPutra,
      result.totalPutri,
      result.sesiPutri,
      result.totalGabungan
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0">
            🏆 JUARA UMUM PASANGGIRI JAKARTA BARAT CENGKARENG
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={exportToPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              📄 PDF
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              📊 Excel
            </button>
          </div>
        </div>
        
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