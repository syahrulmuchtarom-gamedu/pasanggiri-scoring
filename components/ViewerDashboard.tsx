'use client';

import { useState } from 'react';
import { User } from '@/types';
import RankingView from './RankingView';

interface Props {
  user: User;
}

export default function ViewerDashboard({ user }: Props) {
  const [activeTab, setActiveTab] = useState<'putra' | 'putri'>('putra');

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab('putra')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'putra'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Hasil PUTRA
        </button>
        <button
          onClick={() => setActiveTab('putri')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'putri'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Hasil PUTRI
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Hasil Pertandingan - {activeTab.toUpperCase()}
          </h2>
          <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
            Mode Viewer (Read-Only)
          </div>
        </div>
        
        <RankingView kelas={activeTab.toUpperCase() as 'PUTRA' | 'PUTRI'} />
      </div>
    </div>
  );
}