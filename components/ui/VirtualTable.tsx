'use client';

import { useState, useEffect, useRef } from 'react';

interface VirtualTableProps {
  data: any[];
  columns: { key: string; label: string; render?: (item: any) => React.ReactNode }[];
  itemHeight?: number;
  containerHeight?: number;
  className?: string;
}

export default function VirtualTable({ 
  data, 
  columns, 
  itemHeight = 60, 
  containerHeight = 400,
  className = ''
}: VirtualTableProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount, data.length);
  const visibleData = data.slice(startIndex, endIndex);
  
  const totalHeight = data.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div className={`overflow-auto ${className}`} style={{ height: containerHeight }}>
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height: containerHeight, overflowY: 'auto' }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">
                <tr>
                  {columns.map(column => (
                    <th 
                      key={column.key}
                      className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleData.map((item, index) => (
                  <tr 
                    key={startIndex + index}
                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    style={{ height: itemHeight }}
                  >
                    {columns.map(column => (
                      <td 
                        key={column.key}
                        className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white"
                      >
                        {column.render ? column.render(item) : item[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}