
import type { UnifiedVersionInfo } from './types';
import { VersionUtils } from './versionUtils';
import { VersionStorage } from './versionStorage';
import { VersionHistoryManager } from './versionHistoryManager';
import { DatabaseVersionManager } from './databaseVersionManager';

export class UnifiedVersionManager {
  private storage: VersionStorage;
  private historyManager: VersionHistoryManager;
  private databaseManager: DatabaseVersionManager;
  private isInitialized: boolean = false;

  constructor() {
    this.storage = new VersionStorage();
    this.historyManager = new VersionHistoryManager(this.storage);
    this.databaseManager = new DatabaseVersionManager();
  }

  private async initializeSystem(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Get current version from database (this is the source of truth)
      const dbVersion = await this.databaseManager.getCurrentVersion();
      
      if (dbVersion) {
        console.log(`🔄 Initialized with database version: v${dbVersion.version}`);
        // No reset! Just use what's in the database
      } else {
        console.log('⚠️ No database version found, keeping cached version');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing version system:', error);
      this.isInitialized = true; // Don't block the app
    }
  }

  public incrementVersion(currentVersion: string, type: 'major' | 'minor' | 'patch'): string {
    return VersionUtils.incrementVersion(currentVersion, type);
  }

  public async getCurrentVersion(): Promise<UnifiedVersionInfo | null> {
    await this.initializeSystem();
    return this.databaseManager.getCurrentVersion();
  }

  public async getVersionHistory() {
    return this.databaseManager.getVersionHistory();
  }

  public async publishNewVersion(
    type: 'major' | 'minor' | 'patch',
    notes: string,
    publishedBy?: string
  ): Promise<UnifiedVersionInfo | null> {
    await this.initializeSystem();
    return this.databaseManager.publishNewVersion(type, notes, publishedBy);
  }

  public getFormattedVersion(): string {
    return this.databaseManager.getFormattedVersion();
  }

  public getBuildNumber(): number {
    return this.databaseManager.getBuildNumber();
  }

  public getVersionCriteria(): Record<string, string> {
    return VersionUtils.getVersionCriteria();
  }

  public canIncrementTo(type: 'major' | 'minor' | 'patch'): boolean {
    // Always allow increments since we're using database
    return true;
  }

  public getIncrementSuggestion(): 'major' | 'minor' | 'patch' {
    return 'patch'; // Default suggestion
  }

  public async getNextVersionPreview(type: 'major' | 'minor' | 'patch'): Promise<string> {
    const current = await this.getCurrentVersion();
    if (!current) return 'v0.0.1';
    
    return `v${this.incrementVersion(current.version, type)}`;
  }
}
