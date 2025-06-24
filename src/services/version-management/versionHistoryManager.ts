import type { UnifiedVersionInfo, VersionHistory } from './types';
import { VersionStorage } from './versionStorage';

export class VersionHistoryManager {
  private storage: VersionStorage;

  constructor(storage: VersionStorage) {
    this.storage = storage;
  }

  addToHistory(version: UnifiedVersionInfo, isCurrent: boolean = false): void {
    const history = this.storage.getVersionHistory();
    
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
    
    this.storage.saveVersionHistory(trimmedHistory);
  }

  getHistory(): VersionHistory[] {
    return this.storage.getVersionHistory();
  }
}
