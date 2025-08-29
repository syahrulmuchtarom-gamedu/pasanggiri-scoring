'use client';

import { useState } from 'react';
import { User } from '@/types';
import RankingView from './RankingView';

interface Props {
  user: User;
  activeTab?: string;
}

export default function ViewerDashboard({ user, activeTab: externalActiveTab }: Props) {
  const [activeTab, setActiveTab] = useState<'putra' | 'putri'>('putra');
  
  // Handle external activeTab for sidebar navigation
  const showResults = !externalActiveTab || externalActiveTab === 'results';
  const showRanking = externalActiveTab === 'ranking';

  return (
    <div className="space-y-6">
      {(showResults || showRanking) && (
        <>
          <div className="flex space-x-4 border-b dark:border-gray-700">
            <button
              onClick={() => setActiveTab('putra')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'putra'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {showRanking ? 'Ranking' : 'Hasil'} PUTRA
            </button>
            <button
              onClick={() => setActiveTab('putri')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'putri'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {showRanking ? 'Ranking' : 'Hasil'} PUTRI
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {showRanking ? 'Ranking' : 'Hasil'} Pertandingan - {activeTab.toUpperCase()}
              </h2>
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                Mode Viewer (Read-Only)
              </div>
            </div>
            
            <RankingView kelas={activeTab.toUpperCase() as 'PUTRA' | 'PUTRI'} />
          </div>
        </>
      )}
    </div>
  );
}