
export interface VersionInfo {
  version: string;
  buildNumber: number;
  publishCount: number;
  lastPublishTime: string;
}

class VersionManager {
  private readonly VERSION_KEY = 'skyranch-version-info';
  private readonly BASE_VERSION = '2.3.0';

  constructor() {
    this.initializeVersion();
  }

  private initializeVersion(): void {
    const stored = this.getStoredVersionInfo();
    if (!stored) {
      const initialVersion: VersionInfo = {
        version: this.BASE_VERSION,
        buildNumber: 1,
        publishCount: 0,
        lastPublishTime: new Date().toISOString()
      };
      this.saveVersionInfo(initialVersion);
    }
  }

  private getStoredVersionInfo(): VersionInfo | null {
    try {
      const stored = localStorage.getItem(this.VERSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to parse stored version info:', error);
      return null;
    }
  }

  private saveVersionInfo(versionInfo: VersionInfo): void {
    localStorage.setItem(this.VERSION_KEY, JSON.stringify(versionInfo));
  }

  public getCurrentVersion(): VersionInfo {
    return this.getStoredVersionInfo() || {
      version: this.BASE_VERSION,
      buildNumber: 1,
      publishCount: 0,
      lastPublishTime: new Date().toISOString()
    };
  }

  public incrementVersion(): VersionInfo {
    const current = this.getCurrentVersion();
    const versionParts = current.version.split('.');
    const patch = parseInt(versionParts[2] || '0', 10) + 1;
    
    const newVersion: VersionInfo = {
      version: `${versionParts[0]}.${versionParts[1]}.${patch}`,
      buildNumber: current.buildNumber + 1,
      publishCount: current.publishCount + 1,
      lastPublishTime: new Date().toISOString()
    };

    this.saveVersionInfo(newVersion);
    console.log(`🚀 Version incremented to ${newVersion.version} (Build #${newVersion.buildNumber})`);
    
    return newVersion;
  }

  public getFormattedVersion(): string {
    const versionInfo = this.getCurrentVersion();
    return `v${versionInfo.version}`;
  }

  public triggerPublishUpdate(): void {
    const newVersion = this.incrementVersion();
    
    // Dispatch event to notify components of version change
    window.dispatchEvent(new CustomEvent('version-updated', { 
      detail: newVersion 
    }));
  }

  public getBuildNumber(): number {
    return this.getCurrentVersion().buildNumber;
  }

  public getPublishCount(): number {
    return this.getCurrentVersion().publishCount;
  }
}

// Create and export singleton instance
export const versionManager = new VersionManager();

// Auto-trigger version increment when the app starts in production
// This simulates a "Publish Update" event
if (import.meta.env.PROD && !sessionStorage.getItem('version-checked')) {
  sessionStorage.setItem('version-checked', 'true');
  versionManager.triggerPublishUpdate();
}
