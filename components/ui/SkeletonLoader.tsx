'use client';

interface SkeletonLoaderProps {
  type: 'card' | 'table' | 'list' | 'text' | 'avatar';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ type, count = 1, className = '' }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4 animate-pulse ${className}`}>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        );
      
      case 'table':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden animate-pulse ${className}`}>
            <div className="h-12 bg-gray-200 dark:bg-gray-700"></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 flex items-center px-6 space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        );
      
      case 'list':
        return (
          <div className={`space-y-3 animate-pulse ${className}`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'text':
        return (
          <div className={`space-y-2 animate-pulse ${className}`}>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        );
      
      case 'avatar':
        return (
          <div className={`h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse ${className}`}></div>
        );
      
      default:
        return (
          <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}></div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
}