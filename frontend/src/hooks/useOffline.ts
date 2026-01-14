import { useState, useEffect } from 'react';

export interface OfflineQueueItem {
  id: string;
  url: string;
  method: string;
  body?: any;
  timestamp: number;
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Process offline queue when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      processQueue();
    }
  }, [isOnline, queue]);

  const addToQueue = (url: string, method: string, body?: any) => {
    const queueItem: OfflineQueueItem = {
      id: Date.now().toString(),
      url,
      method,
      body,
      timestamp: Date.now()
    };
    
    setQueue(prev => [...prev, queueItem]);
    localStorage.setItem('offline-queue', JSON.stringify([...queue, queueItem]));
  };

  const processQueue = async () => {
    const itemsToProcess = [...queue];
    setQueue([]);
    
    for (const item of itemsToProcess) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(item.body)
        });

        if (response.ok) {
          // Remove from queue
          const currentQueue = JSON.parse(localStorage.getItem('offline-queue') || '[]');
          const updatedQueue = currentQueue.filter((q: OfflineQueueItem) => q.id !== item.id);
          localStorage.setItem('offline-queue', JSON.stringify(updatedQueue));
        }
      } catch (error) {
        console.error('Failed to process queued item:', error);
        // Add back to queue
        addToQueue(item.url, item.method, item.body);
      }
    }
    
    localStorage.setItem('offline-queue', JSON.stringify([]));
  };

  return {
    isOnline,
    queue,
    addToQueue,
    queueLength: queue.length
  };
}