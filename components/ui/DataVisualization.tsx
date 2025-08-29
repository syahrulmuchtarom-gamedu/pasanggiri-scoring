'use client';

import { useState, useEffect } from 'react';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface DataVisualizationProps {
  data: ChartData[];
  type: 'bar' | 'pie' | 'line';
  title: string;
  className?: string;
}

export default function DataVisualization({ data, type, title, className = '' }: DataVisualizationProps) {
  const [animatedData, setAnimatedData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Animate data entry
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 100);
    return () => clearTimeout(timer);
  }, [data]);

  if (data.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">{title}</h3>
        <div className="text-center text-gray-500 dark:text-gray-400">No data available</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  const renderBarChart = () => (
    <div className="space-y-3">
      {animatedData.map((item, index) => (
        <div key={item.label} className="flex items-center space-x-3">
          <div className="w-20 text-sm text-gray-600 dark:text-gray-400 truncate">
            {item.label}
          </div>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
              style={{ 
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color,
                animationDelay: `${index * 100}ms`
              }}
            >
              <span className="text-xs font-medium text-white">
                {item.value}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {animatedData.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              currentAngle += angle;

              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);

              const largeArcFlag = angle > 180 ? 1 : 0;

              return (
                <path
                  key={item.label}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={item.color}
                  className="transition-all duration-500 hover:opacity-80"
                  style={{ animationDelay: `${index * 200}ms` }}
                />
              );
            })}
          </svg>
          
          {/* Legend */}
          <div className="absolute -right-32 top-0 space-y-2">
            {data.map((item) => (
              <div key={item.label} className="flex items-center space-x-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-gray-700 dark:text-gray-300">
                  {item.label}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLineChart = () => (
    <div className="relative h-48">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={i}
            x1="0"
            y1={i * 40}
            x2="400"
            y2={i * 40}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-gray-300 dark:text-gray-600"
          />
        ))}
        
        {/* Data line */}
        <polyline
          fill="none"
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={animatedData.map((item, index) => 
            `${data.length > 1 ? (index / (data.length - 1)) * 400 : 200},${200 - (item.value / maxValue) * 180}`
          ).join(' ')}
          className="animate-fade-in"
        />
        
        {/* Data points */}
        {animatedData.map((item, index) => (
          <circle
            key={item.label}
            cx={data.length > 1 ? (index / (data.length - 1)) * 400 : 200}
            cy={200 - (item.value / maxValue) * 180}
            r="4"
            fill={item.color}
            className="animate-fade-in hover:r-6 transition-all"
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
        {data.map(item => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
        {title}
      </h3>
      
      <div className="animate-slide-up">
        {type === 'bar' && renderBarChart()}
        {type === 'pie' && renderPieChart()}
        {type === 'line' && renderLineChart()}
      </div>
    </div>
  );
}