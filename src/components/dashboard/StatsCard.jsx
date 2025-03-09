import { useState, useEffect } from 'react';
import Icon from '../ui/icons/Icon';

// Add loading skeleton component
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
);

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

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Your Progress
      </h3>
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
              Course Completion
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-primary-600">
              {progress}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
          <div
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"
          ></div>
        </div>
      </div>
    </div>
  );
} 