
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseVersion {
  id: string;
  version: string;
  build_number: number;
  created_at: string;
  created_by: string | null;
  notes: string | null;
  is_current: boolean;
}

class DatabaseVersionService {
  
  public async getCurrentVersion(): Promise<DatabaseVersion | null> {
    try {
      const { data, error } = await supabase
        .from('app_version')
        .select('*')
        .eq('is_current', true)
        .single();

      if (error) {
        console.error('Error fetching current version:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCurrentVersion:', error);
      return null;
    }
  }

  public async getVersionHistory(): Promise<DatabaseVersion[]> {
    try {
      const { data, error } = await supabase
        .from('app_version')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching version history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getVersionHistory:', error);
      return [];
    }
  }

  public async incrementVersion(notes?: string, versionType: 'major' | 'minor' | 'patch' = 'patch'): Promise<DatabaseVersion | null> {
    try {
      const { data, error } = await supabase.functions.invoke('increment-version', {
        body: { notes, versionType }
      });

      if (error) {
        console.error('Error incrementing version:', error);
        return null;
      }

      return data.version;
    } catch (error) {
      console.error('Error in incrementVersion:', error);
      return null;
    }
  }

  public getFormattedVersion(version: DatabaseVersion): string {
    return `v${version.version}`;
  }

  // Subscribe to version changes
  public subscribeToVersionChanges(callback: (version: DatabaseVersion) => void) {
    const channel = supabase
      .channel('version-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'app_version',
          filter: 'is_current=eq.true'
        },
        (payload) => {
          console.log('New version detected:', payload.new);
          callback(payload.new as DatabaseVersion);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const databaseVersionService = new DatabaseVersionService();
