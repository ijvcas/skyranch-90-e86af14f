import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

interface OfflineData {
  animals: any[];
  breedingRecords: any[];
  healthRecords: any[];
  lastSync: string;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);

  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine && pendingChanges.length > 0) {
        syncPendingChanges();
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Load offline data on mount
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [pendingChanges]);

  const loadOfflineData = async () => {
    try {
      const { value } = await Preferences.get({ key: 'farmika_offline_data' });
      if (value) {
        setOfflineData(JSON.parse(value));
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const saveOfflineData = async (data: OfflineData) => {
    try {
      await Preferences.set({
        key: 'farmika_offline_data',
        value: JSON.stringify(data)
      });
      setOfflineData(data);
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  const addPendingChange = async (change: any) => {
    const newChanges = [...pendingChanges, { ...change, timestamp: Date.now() }];
    setPendingChanges(newChanges);
    
    try {
      await Preferences.set({
        key: 'farmika_pending_changes',
        value: JSON.stringify(newChanges)
      });
    } catch (error) {
      console.error('Error saving pending changes:', error);
    }
  };

  const syncPendingChanges = async () => {
    if (!isOnline || pendingChanges.length === 0) return;

    try {
      // Process each pending change
      for (const change of pendingChanges) {
        switch (change.type) {
          case 'animal_create':
          case 'animal_update':
          case 'breeding_record_create':
          case 'health_record_create':
            // Sync with Supabase
            await syncChangeToSupabase(change);
            break;
          default:
            console.warn('Unknown change type:', change.type);
        }
      }

      // Clear pending changes after successful sync
      setPendingChanges([]);
      await Preferences.remove({ key: 'farmika_pending_changes' });
      
      console.log('Successfully synced all pending changes');
    } catch (error) {
      console.error('Error syncing pending changes:', error);
    }
  };

  const syncChangeToSupabase = async (change: any) => {
    // Implementation would depend on the specific change type
    // This would interact with your existing Supabase services
    console.log('Syncing change to Supabase:', change);
  };

  const enableBackgroundSync = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // Background sync would be implemented here for production
        console.log('Background sync would be registered here');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  };

  return {
    isOnline,
    offlineData,
    pendingChanges,
    saveOfflineData,
    addPendingChange,
    syncPendingChanges,
    enableBackgroundSync
  };
};