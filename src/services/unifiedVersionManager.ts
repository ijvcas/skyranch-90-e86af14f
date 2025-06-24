
export interface UnifiedVersionInfo {
  version: string;
  buildNumber: number;
  versionType: 'major' | 'minor' | 'patch';
  releaseDate: string;
  notes: string;
  publishedBy?: string;
}

export interface VersionHistory {
  id: string;
  version: string;
  buildNumber: number;
  versionType: 'major' | 'minor' | 'patch';
  releaseDate: string;
  notes: string;
  publishedBy?: string;
  isCurrent: boolean;
}

class UnifiedVersionManager {
  private readonly VERSION_KEY = 'skyranch-unified-version';
  private readonly HISTORY_KEY = 'skyranch-version-history';
  private readonly CURRENT_VERSION = '2.4.0'; // Sync with actual codebase

  constructor() {
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

    this.saveCurrentVersion(currentVersion);
    this.addToHistory(currentVersion, true);
  }

  private parseVersion(version: string): { major: number; minor: number; patch: number } {
    const parts = version.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0
    };
  }

  public incrementVersion(currentVersion: string, type: 'major' | 'minor' | 'patch'): string {
    const { major, minor, patch } = this.parseVersion(currentVersion);
    
    switch (type) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  public getCurrentVersion(): UnifiedVersionInfo | null {
    try {
      const stored = localStorage.getItem(this.VERSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to parse current version:', error);
      return null;
    }
  }

  private saveCurrentVersion(version: UnifiedVersionInfo): void {
    localStorage.setItem(this.VERSION_KEY, JSON.stringify(version));
  }

  public getVersionHistory(): VersionHistory[] {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      const history = stored ? JSON.parse(stored) : [];
      return history.sort((a: VersionHistory, b: VersionHistory) => 
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );
    } catch (error) {
      console.error('Failed to parse version history:', error);
      return [];
    }
  }

  private saveVersionHistory(history: VersionHistory[]): void {
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
  }

  private addToHistory(version: UnifiedVersionInfo, isCurrent: boolean = false): void {
    const history = this.getVersionHistory();
    
    // Mark all previous versions as not current
    const updatedHistory = history.map(h => ({ ...h, isCurrent: false }));
    
    // Add new version
    const historyEntry: VersionHistory = {
      id: Date.now().toString(),
      ...version,
      isCurrent
    };
    
    updatedHistory.unshift(historyEntry);
    
    // Keep only last 50 versions
    const trimmedHistory = updatedHistory.slice(0, 50);
    
    this.saveVersionHistory(trimmedHistory);
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

    this.saveCurrentVersion(newVersion);
    this.addToHistory(newVersion, true);

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
    return {
      patch: 'Correcciones de errores, mejoras menores, actualizaciones de seguridad',
      minor: 'Nuevas funcionalidades, mejoras significativas, cambios compatibles',
      major: 'Cambios importantes, funcionalidades principales, cambios incompatibles'
    };
  }

  public canIncrementTo(type: 'major' | 'minor' | 'patch'): boolean {
    const current = this.getCurrentVersion();
    if (!current) return false;

    const { patch } = this.parseVersion(current.version);
    
    // Suggest minor increment when patch number gets high
    if (type === 'minor' && patch >= 10) return true;
    if (type === 'major' && patch >= 50) return true;
    
    return true; // Always allow any increment type
  }

  public getIncrementSuggestion(): 'major' | 'minor' | 'patch' {
    const current = this.getCurrentVersion();
    if (!current) return 'patch';

    const { patch } = this.parseVersion(current.version);
    
    if (patch >= 50) return 'major';
    if (patch >= 10) return 'minor';
    
    return 'patch';
  }

  public getNextVersionPreview(type: 'major' | 'minor' | 'patch'): string {
    const current = this.getCurrentVersion();
    if (!current) return 'v0.0.1';
    
    return `v${this.incrementVersion(current.version, type)}`;
  }
}

export const unifiedVersionManager = new UnifiedVersionManager();
