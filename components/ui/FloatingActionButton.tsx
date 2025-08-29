'use client';

import { useState } from 'react';

interface FABAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  mainIcon?: string;
  position?: 'bottom-right' | 'bottom-left';
}

export default function FloatingActionButton({ 
  actions, 
  mainIcon = '⚡', 
  position = 'bottom-right' 
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-40`}>
      {/* Action Buttons */}
      <div className={`flex flex-col space-y-3 mb-3 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => {
              action.action();
              setIsOpen(false);
            }}
            className={`flex items-center space-x-3 bg-white dark:bg-gray-800 shadow-lg rounded-full px-4 py-3 hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
              action.color || 'text-gray-700 dark:text-gray-300'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-lg">{action.icon}</span>
            <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform ${
          isOpen ? 'rotate-45 scale-110' : 'hover:scale-105'
        }`}
      >
        <span className="text-xl">{isOpen ? '×' : mainIcon}</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}