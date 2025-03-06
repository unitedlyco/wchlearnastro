import { useState, useEffect } from 'react';
import Icon from '../ui/icons/Icon';

export default function UpcomingSessions({ userId }) {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchSessions() {
      try {
        // In a real app, this would be an API call with proper error handling
        // For demo, simulating API call with reduced timeout
        await new Promise(resolve => setTimeout(resolve, 100));
        setSessions([
          {
            id: 1,
            title: 'Introduction to Nutrition',
            datetime: 'Tomorrow, 10:00 AM'
          }
        ]); // Replace with actual API call
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error fetching sessions:', error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchSessions();

    return () => {
      abortController.abort();
    };
  }, [userId]);

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
          <Icon name="mdi:calendar-clock" className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Sessions</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your scheduled learning</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-pulse text-gray-400">Loading sessions...</div>
          </div>
        ) : sessions.length > 0 ? (
          sessions.map(session => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{session.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{session.datetime}</p>
              </div>
              <button 
                className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                onClick={() => console.log('View session:', session.id)}
              >
                View
              </button>
            </div>
          ))
        ) : (
          <div className="text-center p-4 text-gray-500">
            No upcoming sessions
          </div>
        )}
      </div>
    </div>
  );
} 