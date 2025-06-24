
import type { UnifiedVersionInfo } from './types';
import { VersionUtils } from './versionUtils';
import { VersionStorage } from './versionStorage';
import { VersionHistoryManager } from './versionHistoryManager';

export class UnifiedVersionManager {
  private readonly CURRENT_VERSION = '2.4.0'; // Sync with actual codebase
  private storage: VersionStorage;
  private historyManager: VersionHistoryManager;

  constructor() {
    this.storage = new VersionStorage();
    this.historyManager = new VersionHistoryManager(this.storage);
    this.initializeSystem();
  }

  private initializeSystem(): void {
    const current = this.getCurrentVersion();
    if (!current || current.version !== this.CURRENT_VERSION) {
      this.resetToCurrentVersion();
    }
  }

  private resetToCurrentVersion(): void {
    const currentVersion: UnifiedVersionInfo = {
      version: this.CURRENT_VERSION,
      buildNumber: 1,
      versionType: 'minor',
      releaseDate: new Date().toISOString(),
      notes: 'Sistema de versionado unificado implementado',
      publishedBy: 'Sistema'
    };

    this.storage.saveCurrentVersion(currentVersion);
    this.historyManager.addToHistory(currentVersion, true);
  }

  public incrementVersion(currentVersion: string, type: 'major' | 'minor' | 'patch'): string {
    return VersionUtils.incrementVersion(currentVersion, type);
  }

  public getCurrentVersion(): UnifiedVersionInfo | null {
    return this.storage.getCurrentVersion();
  }

  public getVersionHistory() {
    return this.historyManager.getHistory();
  }

  public publishNewVersion(
    type: 'major' | 'minor' | 'patch',
    notes: string,
    publishedBy?: string
  ): UnifiedVersionInfo {
    const current = this.getCurrentVersion();
    if (!current) {
      throw new Error('No current version found');
    }

    const newVersionNumber = this.incrementVersion(current.version, type);
    const newVersion: UnifiedVersionInfo = {
      version: newVersionNumber,
      buildNumber: current.buildNumber + 1,
      versionType: type,
      releaseDate: new Date().toISOString(),
      notes: notes || `${type.charAt(0).toUpperCase() + type.slice(1)} update`,
      publishedBy: publishedBy || 'Usuario'
    };

    this.storage.saveCurrentVersion(newVersion);
    this.historyManager.addToHistory(newVersion, true);

    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('unified-version-updated', { 
      detail: newVersion 
    }));

    console.log(`🚀 Version published: v${newVersion.version} (Build #${newVersion.buildNumber})`);
    return newVersion;
  }

  public getFormattedVersion(): string {
    const current = this.getCurrentVersion();
    return current ? `v${current.version}` : 'v0.0.0';
  }

  public getBuildNumber(): number {
    const current = this.getCurrentVersion();
    return current ? current.buildNumber : 0;
  }

  public getVersionCriteria(): Record<string, string> {
    return VersionUtils.getVersionCriteria();
  }

  public canIncrementTo(type: 'major' | 'minor' | 'patch'): boolean {
    const current = this.getCurrentVersion();
    if (!current) return false;
    
    return VersionUtils.canIncrementTo(current.version, type);
  }

  public getIncrementSuggestion(): 'major' | 'minor' | 'patch' {
    const current = this.getCurrentVersion();
    if (!current) return 'patch';
    
    return VersionUtils.getIncrementSuggestion(current.version);
  }

  public getNextVersionPreview(type: 'major' | 'minor' | 'patch'): string {
    const current = this.getCurrentVersion();
    if (!current) return 'v0.0.1';
    
    return `v${this.incrementVersion(current.version, type)}`;
  }
}
