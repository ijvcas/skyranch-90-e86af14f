
import { databaseVersionService, type DatabaseVersion } from '@/services/databaseVersionService';
import type { UnifiedVersionInfo } from './types';

export class DatabaseVersionManager {
  private readonly STORAGE_KEY = 'skyranch-unified-version-cache';

  async getCurrentVersion(): Promise<UnifiedVersionInfo | null> {
    try {
      // Always try to get from database first
      const dbVersion = await databaseVersionService.getCurrentVersion();
      
      if (dbVersion) {
        const unifiedVersion: UnifiedVersionInfo = {
          version: dbVersion.version,
          buildNumber: dbVersion.build_number,
          versionType: this.determineVersionType(dbVersion.version),
          releaseDate: dbVersion.created_at,
          notes: dbVersion.notes || 'Database version',
          publishedBy: 'Database'
        };
        
        // Cache it locally
        this.cacheVersion(unifiedVersion);
        return unifiedVersion;
      }
      
      // Fallback to cached version if database fails
      return this.getCachedVersion();
    } catch (error) {
      console.error('Error fetching database version:', error);
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
    } catch (error) {
      console.error('Error caching version:', error);
    }
  }

  async publishNewVersion(
    type: 'major' | 'minor' | 'patch',
    notes: string,
    publishedBy?: string
  ): Promise<UnifiedVersionInfo | null> {
    try {
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
      const dbVersions = await databaseVersionService.getVersionHistory();
      
      return dbVersions.map((dbVersion, index) => ({
        id: dbVersion.id,
        version: dbVersion.version,
        buildNumber: dbVersion.build_number,
        versionType: this.determineVersionType(dbVersion.version),
        releaseDate: dbVersion.created_at,
        notes: dbVersion.notes || 'Database version',
        publishedBy: 'Database',
        isCurrent: index === 0 // First item is current
      }));
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
