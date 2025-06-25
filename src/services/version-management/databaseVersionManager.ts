
import { databaseVersionService, type DatabaseVersion } from '@/services/databaseVersionService';
import type { UnifiedVersionInfo } from './types';

export class DatabaseVersionManager {
  private readonly STORAGE_KEY = 'skyranch-unified-version-cache';

  async getCurrentVersion(): Promise<UnifiedVersionInfo | null> {
    try {
      // Always try to get from database first
      const dbVersion = await databaseVersionService.getCurrentVersion();
      
      if (dbVersion) {
        console.log('📊 Database version found:', dbVersion);
        const unifiedVersion: UnifiedVersionInfo = {
          version: dbVersion.version,
          buildNumber: dbVersion.build_number,
          versionType: this.determineVersionType(dbVersion.version),
          releaseDate: dbVersion.created_at,
          notes: dbVersion.notes || 'Database version',
          publishedBy: 'Database'
        };
        
        // Clear any stale cache and update with fresh data
        this.clearCache();
        this.cacheVersion(unifiedVersion);
        console.log('✅ Version cached and returning:', unifiedVersion);
        return unifiedVersion;
      }
      
      console.log('⚠️ No database version found, checking cache...');
      const cached = this.getCachedVersion();
      if (cached) {
        console.log('📦 Using cached version:', cached);
      }
      return cached;
    } catch (error) {
      console.error('❌ Error fetching database version:', error);
      console.log('📦 Falling back to cached version');
      return this.getCachedVersion();
    }
  }

  private determineVersionType(version: string): 'major' | 'minor' | 'patch' {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0', 10);
    const minor = parseInt(parts[1] || '0', 10);
    
    if (patch > 0) return 'patch';
    if (minor > 0) return 'minor';
    return 'major';
  }

  private getCachedVersion(): UnifiedVersionInfo | null {
    try {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error reading cached version:', error);
      return null;
    }
  }

  private cacheVersion(version: UnifiedVersionInfo): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(version));
      console.log('💾 Version cached successfully');
    } catch (error) {
      console.error('Error caching version:', error);
    }
  }

  public clearCache(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🗑️ Version cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  public async forceRefresh(): Promise<UnifiedVersionInfo | null> {
    console.log('🔄 Force refreshing version from database...');
    this.clearCache();
    return await this.getCurrentVersion();
  }

  async publishNewVersion(
    type: 'major' | 'minor' | 'patch',
    notes: string,
    publishedBy?: string
  ): Promise<UnifiedVersionInfo | null> {
    try {
      console.log('🚀 Publishing new version to database...');
      const dbVersion = await databaseVersionService.incrementVersion(notes);
      
      if (dbVersion) {
        const unifiedVersion: UnifiedVersionInfo = {
          version: dbVersion.version,
          buildNumber: dbVersion.build_number,
          versionType: type,
          releaseDate: dbVersion.created_at,
          notes: dbVersion.notes || notes,
          publishedBy: publishedBy || 'Usuario'
        };
        
        // Clear cache and update with new version
        this.clearCache();
        this.cacheVersion(unifiedVersion);
        
        // Dispatch event to notify components
        window.dispatchEvent(new CustomEvent('unified-version-updated', { 
          detail: unifiedVersion 
        }));
        
        console.log(`🚀 Version published to database: v${unifiedVersion.version} (Build #${unifiedVersion.buildNumber})`);
        return unifiedVersion;
      }
      
      return null;
    } catch (error) {
      console.error('Error publishing version to database:', error);
      return null;
    }
  }

  async getVersionHistory() {
    try {
      console.log('📚 Fetching version history from database...');
      const dbVersions = await databaseVersionService.getVersionHistory();
      
      const history = dbVersions.map((dbVersion, index) => ({
        id: dbVersion.id,
        version: dbVersion.version,
        buildNumber: dbVersion.build_number,
        versionType: this.determineVersionType(dbVersion.version),
        releaseDate: dbVersion.created_at,
        notes: dbVersion.notes || 'Database version',
        publishedBy: 'Database',
        isCurrent: index === 0 // First item is current
      }));
      
      console.log('📚 Version history loaded:', history);
      return history;
    } catch (error) {
      console.error('Error fetching version history:', error);
      return [];
    }
  }

  getFormattedVersion(): string {
    const cached = this.getCachedVersion();
    return cached ? `v${cached.version}` : 'v0.0.0';
  }

  getBuildNumber(): number {
    const cached = this.getCachedVersion();
    return cached ? cached.buildNumber : 0;
  }
}
