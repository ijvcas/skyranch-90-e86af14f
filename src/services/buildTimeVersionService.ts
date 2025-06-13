
interface BuildTimeVersion {
  version: string;
  buildNumber: number;
  buildTime: string;
  buildId: string;
  lastChange: string;
  gitCommit?: string;
}

class BuildTimeVersionService {
  private readonly VERSION_KEY = 'skyranch-build-version';
  private readonly BASE_VERSION = '2.3.0';

  constructor() {
    this.initializeVersion();
  }

  private initializeVersion(): void {
    // Check if this is a new build/publish by comparing build times
    const injectedBuildTime = import.meta.env.VITE_BUILD_TIME;
    const stored = this.getStoredVersion();
    
    if (!stored || (injectedBuildTime && stored.buildTime !== injectedBuildTime)) {
      // This is a new build/publish - increment version
      this.handleNewBuild();
    }
  }

  private getStoredVersion(): BuildTimeVersion | null {
    try {
      const stored = localStorage.getItem(this.VERSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to parse stored build version:', error);
      return null;
    }
  }

  private saveVersion(version: BuildTimeVersion): void {
    localStorage.setItem(this.VERSION_KEY, JSON.stringify(version));
  }

  private handleNewBuild(): void {
    const stored = this.getStoredVersion();
    const currentBuildTime = import.meta.env.VITE_BUILD_TIME || new Date().toISOString();
    
    // Increment version if we have a previous version, otherwise start fresh
    let newVersion = this.BASE_VERSION;
    let newBuildNumber = 1;
    
    if (stored) {
      // Parse current version and increment patch number
      const versionParts = stored.version.split('.');
      const patch = parseInt(versionParts[2] || '0', 10) + 1;
      newVersion = `${versionParts[0]}.${versionParts[1]}.${patch}`;
      newBuildNumber = stored.buildNumber + 1;
    }

    const buildVersion: BuildTimeVersion = {
      version: newVersion,
      buildNumber: newBuildNumber,
      buildTime: currentBuildTime,
      buildId: import.meta.env.VITE_BUILD_ID || Math.random().toString(36).substring(2, 8),
      lastChange: import.meta.env.VITE_LAST_CHANGE || 'Nueva versión publicada',
      gitCommit: import.meta.env.VITE_GIT_COMMIT
    };

    this.saveVersion(buildVersion);
    console.log(`🚀 New build detected! Version incremented to v${newVersion} (Build #${newBuildNumber})`);
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('build-version-updated', { 
      detail: buildVersion 
    }));
  }

  public getCurrentVersion(): BuildTimeVersion {
    const stored = this.getStoredVersion();
    if (stored) {
      return stored;
    }

    // Fallback for first time
    return {
      version: this.BASE_VERSION,
      buildNumber: 1,
      buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
      buildId: import.meta.env.VITE_BUILD_ID || 'initial',
      lastChange: import.meta.env.VITE_LAST_CHANGE || 'Versión inicial',
      gitCommit: import.meta.env.VITE_GIT_COMMIT
    };
  }

  public getFormattedVersion(): string {
    return `v${this.getCurrentVersion().version}`;
  }

  public getBuildNumber(): number {
    return this.getCurrentVersion().buildNumber;
  }

  public forceIncrement(): BuildTimeVersion {
    // Force increment for testing
    const stored = this.getStoredVersion() || this.getCurrentVersion();
    const versionParts = stored.version.split('.');
    const patch = parseInt(versionParts[2] || '0', 10) + 1;
    
    const newVersion: BuildTimeVersion = {
      version: `${versionParts[0]}.${versionParts[1]}.${patch}`,
      buildNumber: stored.buildNumber + 1,
      buildTime: new Date().toISOString(),
      buildId: Math.random().toString(36).substring(2, 8),
      lastChange: 'Incremento manual para pruebas',
      gitCommit: stored.gitCommit
    };

    this.saveVersion(newVersion);
    console.log(`🔧 Version manually incremented to v${newVersion.version}`);
    
    window.dispatchEvent(new CustomEvent('build-version-updated', { 
      detail: newVersion 
    }));

    return newVersion;
  }
}

export const buildTimeVersionService = new BuildTimeVersionService();
