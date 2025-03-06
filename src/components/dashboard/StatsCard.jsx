import { useState, useEffect } from 'react';
import Icon from '../ui/icons/Icon';

export default function StatsCard({ userId }) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Create an AbortController for cleanup
    const abortController = new AbortController();

    async function fetchProgress() {
      try {
        // In a real app, this would be an API call with proper error handling
        // For demo, simulating API call with reduced timeout
        await new Promise(resolve => setTimeout(resolve, 100));
        setProgress(25); // Replace with actual API call
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error fetching progress:', error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchProgress();

    // Cleanup function
    return () => {
      abortController.abort();
    };
  }, [userId]);

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <Icon name="mdi:book-open-page-variant" className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Course Progress</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your learning journey</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isLoading ? '...' : `${progress}%`}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-primary-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${isLoading ? 0 : progress}%` }}
          />
        </div>
      </div>
    </div>
  );
} 