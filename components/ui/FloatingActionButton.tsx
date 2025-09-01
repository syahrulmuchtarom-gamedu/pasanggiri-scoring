'use client';

import { useState, useEffect, useRef } from 'react';

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
  const [isDragging, setIsDragging] = useState(false);
  const [fabPosition, setFabPosition] = useState({ x: 0, y: 0 });
  const fabRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  // Load saved position
  useEffect(() => {
    const saved = localStorage.getItem('fab-position');
    if (saved) {
      setFabPosition(JSON.parse(saved));
    } else {
      // Default positions
      const defaultPos = position === 'bottom-right' 
        ? { x: window.innerWidth - 80, y: window.innerHeight - 80 }
        : { x: 24, y: window.innerHeight - 80 };
      setFabPosition(defaultPos);
    }
  }, [position]);

  // Save position
  const savePosition = (pos: { x: number; y: number }) => {
    localStorage.setItem('fab-position', JSON.stringify(pos));
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: fabPosition.x,
      initialY: fabPosition.y
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    
    const newX = Math.max(0, Math.min(window.innerWidth - 56, dragRef.current.initialX + deltaX));
    const newY = Math.max(0, Math.min(window.innerHeight - 56, dragRef.current.initialY + deltaY));
    
    setFabPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      savePosition(fabPosition);
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: fabPosition.x,
      initialY: fabPosition.y
    };
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragRef.current.startX;
    const deltaY = touch.clientY - dragRef.current.startY;
    
    const newX = Math.max(0, Math.min(window.innerWidth - 56, dragRef.current.initialX + deltaX));
    const newY = Math.max(0, Math.min(window.innerHeight - 56, dragRef.current.initialY + deltaY));
    
    setFabPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      savePosition(fabPosition);
    }
  };

  // Event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, fabPosition]);

  return (
    <div 
      ref={fabRef}
      className="fixed z-40"
      style={{ 
        left: `${fabPosition.x}px`, 
        top: `${fabPosition.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
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
        onClick={() => !isDragging && setIsOpen(!isOpen)}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform select-none ${
          isOpen ? 'rotate-45 scale-110' : 'hover:scale-105'
        } ${isDragging ? 'scale-110 shadow-2xl' : ''}`}
      >
        <span className="text-xl pointer-events-none">{isOpen ? '×' : mainIcon}</span>
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