'use client';

import { useState, useEffect } from 'react';
import { KATEGORI_LIST, GOLONGAN_LIST } from '@/types';

interface Props {
  kelas: 'PUTRA' | 'PUTRI';
  isLocked: boolean;
  canEdit: boolean;
  onUpdate: () => void;
}

interface UndianWithPeserta {
  id: string;
  kategori: string;
  golongan: string;
  desa: string;
  kelas: string;
  peserta: any[];
}

interface GroupedData {
  kategori: string;
  golongan: string;
  desas: {
    id: string;
    desa: string;
    count: number;
  }[];
  totalPeserta: number;
}

export default function PesertaTerdaftarTab({ kelas, isLocked, canEdit, onUpdate }: Props) {
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [undianData, setUndianData] = useState<UndianWithPeserta[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedDetail, setSelectedDetail] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [kelas]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/undian?kelas=${kelas}`);
      const data = await res.json();
      setUndianData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedData: GroupedData[] = KATEGORI_LIST.map(kategori => {
    return GOLONGAN_LIST.map(golongan => {
      const filtered = undianData.filter(
        u => u.kategori === kategori && u.golongan === golongan
      );

      if (filtered.length === 0) return null;

      const desas = filtered.map(u => ({
        id: u.id,
        desa: u.desa,
        count: u.peserta?.length || 0
      }));

      const totalPeserta = desas.reduce((sum, d) => sum + d.count, 0);

      return {
        kategori,
        golongan,
        desas,
        totalPeserta
      };
    }).filter(Boolean);
  }).flat().filter(Boolean) as GroupedData[];

  const filteredData = groupedData.filter(group => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      group.kategori.toLowerCase().includes(query) ||
      group.golongan.toLowerCase().includes(query) ||
      group.desas.some(d => d.desa.toLowerCase().includes(query))
    );
  });

  const totalPeserta = groupedData.reduce((sum, g) => sum + g.totalPeserta, 0);
  const totalKategori = groupedData.length;
  const totalDesa = groupedData.reduce((sum, g) => sum + g.desas.length, 0);

  const toggleCategory = (key: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDelete = async (undianId: string, desa: string, kategori: string) => {
    if (!confirm(`Hapus semua peserta dari ${desa} di kategori ${kategori}?`)) return;

    try {
      await fetch(`/api/undian?id=${undianId}`, { method: 'DELETE' });
      fetchData();
      onUpdate();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Gagal menghapus data');
    }
  };

  const handleViewDetail = async (undianId: string, desa: string) => {
    try {
      const res = await fetch(`/api/peserta?undian_id=${undianId}`);
      const peserta = await res.json();
      setSelectedDetail({ desa, peserta });
    } catch (error) {
      console.error('Error fetching detail:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (groupedData.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Belum Ada Peserta Terdaftar
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Belum ada peserta terdaftar untuk kelas {kelas}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Kelas Header */}
      <div className="card bg-gradient-to-r from-primary-600 to-primary-700">
        <h2 className="text-2xl font-bold text-white text-center">
          {kelas === 'PUTRA' ? '👨 KELAS PUTRA' : '👩 KELAS PUTRI'}
        </h2>
      </div>

      {/* Header Controls */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <input
              type="text"
              placeholder="🔍 Cari kategori, golongan, atau desa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 rounded font-semibold ${
                viewMode === 'card'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              📋 Card
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded font-semibold ${
                viewMode === 'table'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              📊 Table
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-4 flex gap-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            📊 <strong>{totalPeserta}</strong> peserta
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            📋 <strong>{totalKategori}</strong> kategori
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            🏘️ <strong>{totalDesa}</strong> desa
          </span>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="space-y-4">
          {filteredData.map((group) => {
            const key = `${group.kategori}-${group.golongan}`;
            const isExpanded = expandedCategories.has(key);

            return (
              <div key={key} className="card">
                <button
                  onClick={() => toggleCategory(key)}
                  className="w-full flex justify-between items-center text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    📋 {group.kategori} - {group.golongan}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      ({group.totalPeserta} peserta)
                    </span>
                  </h3>
                  <span className="text-2xl">{isExpanded ? '▼' : '▶'}</span>
                </button>

                {isExpanded && (
                  <div className="mt-4 space-y-3">
                    {group.desas.map((desa, idx) => (
                      <div
                        key={desa.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 dark:text-white">
                                {idx + 1}.
                              </span>
                              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                🏘️ {desa.desa}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              👤 {desa.count} peserta
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetail(desa.id, desa.desa)}
                              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                              👁️ Detail
                            </button>
                            {canEdit && !isLocked && (
                              <button
                                onClick={() => handleDelete(desa.id, desa.desa, group.kategori)}
                                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                              >
                                🗑️ Hapus
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        📊 Subtotal: {group.totalPeserta} peserta
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="text-left py-3 px-4 text-gray-900 dark:text-white">Kategori</th>
                <th className="text-left py-3 px-4 text-gray-900 dark:text-white">Desa</th>
                <th className="text-center py-3 px-4 text-gray-900 dark:text-white">Peserta</th>
                <th className="text-center py-3 px-4 text-gray-900 dark:text-white">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((group) =>
                group.desas.map((desa, idx) => (
                  <tr
                    key={desa.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {idx === 0 && (
                      <td
                        rowSpan={group.desas.length}
                        className="py-3 px-4 font-semibold text-gray-900 dark:text-white align-top"
                      >
                        📋 {group.kategori}<br />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {group.golongan}
                        </span>
                      </td>
                    )}
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      🏘️ {desa.desa}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-900 dark:text-white">
                      👤 {desa.count}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleViewDetail(desa.id, desa.desa)}
                          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                        >
                          👁️
                        </button>
                        {canEdit && !isLocked && (
                          <button
                            onClick={() => handleDelete(desa.id, desa.desa, group.kategori)}
                            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDetail && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDetail(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Detail Peserta - {selectedDetail.desa}
            </h3>
            {selectedDetail.peserta.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Belum ada peserta</p>
            ) : (
              <div className="space-y-2">
                {selectedDetail.peserta.map((p: any, idx: number) => (
                  <div
                    key={p.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {idx + 1}. {p.nama_peserta}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setSelectedDetail(null)}
              className="mt-4 w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
