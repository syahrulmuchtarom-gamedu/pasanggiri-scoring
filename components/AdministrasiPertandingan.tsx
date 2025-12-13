'use client';

import { useState, useEffect } from 'react';
import { DESA_LIST, GOLONGAN_LIST, KATEGORI_LIST } from '@/types';
import ModalPeserta from './ModalPeserta';
import PesertaTerdaftarTab from './PesertaTerdaftarTab';

interface Props {
  userRole: string;
  userId: string;
}

export default function AdministrasiPertandingan({ userRole, userId }: Props) {
  const [activeTab, setActiveTab] = useState<'PUTRA' | 'PUTRI' | 'PESERTA'>('PUTRA');
  const [eventStatus, setEventStatus] = useState<any>(null);
  const [undianData, setUndianData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUndian, setSelectedUndian] = useState<any>(null);
  const [addingTo, setAddingTo] = useState<{ kategori: string; golongan: string } | null>(null);

  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
  const canEdit = isAdmin && !eventStatus?.is_locked;

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, undianRes] = await Promise.all([
        fetch(`/api/event-status?kelas=${activeTab}`),
        fetch(`/api/undian?kelas=${activeTab}`)
      ]);

      const statusData = await statusRes.json();
      const undianDataRes = await undianRes.json();

      setEventStatus(statusData[0] || { kelas: activeTab, is_locked: false });
      setUndianData(undianDataRes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLockEvent = async () => {
    if (!confirm(`${eventStatus?.is_locked ? 'Unlock' : 'Lock'} event ${activeTab}?`)) return;

    try {
      await fetch('/api/event-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kelas: activeTab,
          is_locked: !eventStatus?.is_locked,
          locked_by: userId
        })
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  const handleAddDesa = async (kategori: string, golongan: string) => {
    const existingDesas = undianData
      .filter(u => u.kategori === kategori && u.golongan === golongan)
      .map(u => u.desa);

    const availableDesas = DESA_LIST.filter(d => !existingDesas.includes(d));

    if (availableDesas.length === 0) {
      alert('Semua desa sudah ditambahkan!');
      return;
    }

    const desa = prompt(`Pilih desa:\n${availableDesas.join(', ')}`);
    if (!desa || !availableDesas.includes(desa as any)) return;

    const nextUrutan = Math.max(0, ...undianData
      .filter(u => u.kategori === kategori && u.golongan === golongan)
      .map(u => u.urutan)) + 1;

    try {
      await fetch('/api/undian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kategori,
          golongan,
          kelas: activeTab,
          desa,
          urutan: nextUrutan
        })
      });
      fetchData();
    } catch (error) {
      console.error('Error adding desa:', error);
      alert('Error: Desa sudah ada atau terjadi kesalahan');
    }
  };

  const handleDeleteUndian = async (id: string) => {
    if (!confirm('Hapus desa dari undian?')) return;

    try {
      await fetch(`/api/undian?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting undian:', error);
    }
  };

  const handleOpenModal = (undian: any) => {
    setSelectedUndian(undian);
    setModalOpen(true);
  };

  const getUndianByKategoriGolongan = (kategori: string, golongan: string) => {
    return undianData
      .filter(u => u.kategori === kategori && u.golongan === golongan)
      .sort((a, b) => a.urutan - b.urutan);
  };

  const getPesertaCount = (undian: any) => {
    return undian.peserta?.length || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Administrasi Pertandingan
          </h2>
          {isAdmin && (
            <button
              onClick={handleLockEvent}
              className={`px-4 py-2 rounded font-semibold ${
                eventStatus?.is_locked
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {eventStatus?.is_locked ? '🔓 Unlock Event' : '🔒 Lock Event'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setActiveTab('PUTRA')}
            className={`px-6 py-2 rounded font-semibold ${
              activeTab === 'PUTRA'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            PUTRA
          </button>
          <button
            onClick={() => setActiveTab('PUTRI')}
            className={`px-6 py-2 rounded font-semibold ${
              activeTab === 'PUTRI'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            PUTRI
          </button>
          <button
            onClick={() => setActiveTab('PESERTA')}
            className={`px-6 py-2 rounded font-semibold ${
              activeTab === 'PESERTA'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            📋 Peserta Terdaftar
          </button>
        </div>

        {/* Status */}
        {activeTab !== 'PESERTA' && (
          <div className={`p-4 rounded ${
            eventStatus?.is_locked
              ? 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700'
              : 'bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700'
          }`}>
            <p className="font-semibold text-gray-900 dark:text-white">
              Status Event: {eventStatus?.is_locked ? '🔴 EVENT BERJALAN (LOCKED)' : '🟢 BELUM DIMULAI'}
            </p>
            {eventStatus?.is_locked && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                ⚠️ Data tidak dapat diubah selama event berjalan
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tab Peserta Terdaftar */}
      {activeTab === 'PESERTA' && (
        <div className="space-y-4">
          <PesertaTerdaftarTab
            kelas="PUTRA"
            isLocked={eventStatus?.is_locked || false}
            canEdit={canEdit}
            onUpdate={fetchData}
          />
          <div className="border-t-4 border-gray-300 dark:border-gray-600 my-8"></div>
          <PesertaTerdaftarTab
            kelas="PUTRI"
            isLocked={eventStatus?.is_locked || false}
            canEdit={canEdit}
            onUpdate={fetchData}
          />
        </div>
      )}

      {/* Undian List */}
      {activeTab !== 'PESERTA' && (
      <div className="space-y-6">
        {KATEGORI_LIST.map(kategori => (
          <div key={kategori} className="space-y-4">
            {GOLONGAN_LIST.map(golongan => {
              const undianList = getUndianByKategoriGolongan(kategori, golongan);
              
              return (
                <div key={`${kategori}-${golongan}`} className="card">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    📋 {kategori} ({golongan})
                  </h3>

                  {undianList.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                      Belum ada peserta
                    </p>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {undianList.map((undian) => (
                        <div
                          key={undian.id}
                          className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900 dark:text-white">
                              {undian.urutan}.
                            </span>
                            <button
                              onClick={() => handleOpenModal(undian)}
                              className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
                            >
                              {undian.desa}
                            </button>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ({getPesertaCount(undian)} peserta) 👤
                            </span>
                          </div>
                          {canEdit && (
                            <button
                              onClick={() => handleDeleteUndian(undian.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {canEdit && (
                    <button
                      onClick={() => handleAddDesa(kategori, golongan)}
                      className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-semibold"
                    >
                      + Tambah Desa
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      )}

      {/* Modal */}
      {selectedUndian && (
        <ModalPeserta
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedUndian(null);
          }}
          undianId={selectedUndian.id}
          desa={selectedUndian.desa}
          kategori={selectedUndian.kategori}
          golongan={selectedUndian.golongan}
          kelas={selectedUndian.kelas}
          isLocked={eventStatus?.is_locked || false}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}
