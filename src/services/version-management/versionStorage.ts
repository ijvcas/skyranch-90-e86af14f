
import type { UnifiedVersionInfo, VersionHistory } from './types';

export class VersionStorage {
  private readonly VERSION_KEY = 'skyranch-unified-version';
  private readonly HISTORY_KEY = 'skyranch-version-history';

  getCurrentVersion(): UnifiedVersionInfo | null {
    try {
      const stored = localStorage.getItem(this.VERSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to parse current version:', error);
      return null;
    }
  }

  saveCurrentVersion(version: UnifiedVersionInfo): void {
    localStorage.setItem(this.VERSION_KEY, JSON.stringify(version));
  }

  getVersionHistory(): VersionHistory[] {
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

  saveVersionHistory(history: VersionHistory[]): void {
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
  }
}
