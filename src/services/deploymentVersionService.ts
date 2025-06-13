
interface DeploymentVersion {
  version: string;
  buildNumber: number;
  deploymentUrl: string;
  deploymentNumber: number;
  lastDeploymentTime: string;
  deploymentId: string;
  lastChange: string;
}

class DeploymentVersionService {
  private readonly VERSION_KEY = 'skyranch-deployment-version';
  private readonly BASE_VERSION = '2.3.0';

  constructor() {
    this.initializeVersion();
  }

  private initializeVersion(): void {
    // Check if this is a new deployment by analyzing the current URL
    const currentDeployment = this.getCurrentDeploymentInfo();
    const stored = this.getStoredVersion();
    
    if (!stored || this.isNewDeployment(stored, currentDeployment)) {
      this.handleNewDeployment(currentDeployment);
    }
  }

  private getCurrentDeploymentInfo() {
    const currentUrl = window.location.origin;
    const deploymentNumber = this.extractDeploymentNumber(currentUrl);
    
    return {
      url: currentUrl,
      number: deploymentNumber,
      timestamp: new Date().toISOString(),
      id: this.generateDeploymentId(currentUrl)
    };
  }

  private extractDeploymentNumber(url: string): number {
    // Extract deployment number from Lovable URLs like skyranch-90.lovable.app
    const match = url.match(/skyranch-(\d+)\.lovable\.app/);
    if (match) {
      return parseInt(match[1], 10);
    }
    
    // For localhost or other URLs, use a hash-based approach
    const hash = this.hashUrl(url);
    return hash % 1000; // Keep it reasonable
  }

  private hashUrl(url: string): number {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private generateDeploymentId(url: string): string {
    return btoa(url).substring(0, 8);
  }

  private isNewDeployment(stored: DeploymentVersion, current: any): boolean {
    // Check if deployment URL changed
    if (stored.deploymentUrl !== current.url) {
      console.log('🚀 New deployment detected:', {
        old: stored.deploymentUrl,
        new: current.url,
        oldNumber: stored.deploymentNumber,
        newNumber: current.number
      });
      return true;
    }
    
    // Check if deployment number changed (for Lovable URLs)
    if (stored.deploymentNumber !== current.number) {
      console.log('🚀 Deployment number changed:', {
        old: stored.deploymentNumber,
        new: current.number
      });
      return true;
    }
    
    return false;
  }

  private getStoredVersion(): DeploymentVersion | null {
    try {
      const stored = localStorage.getItem(this.VERSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to parse stored deployment version:', error);
      return null;
    }
  }

  private saveVersion(version: DeploymentVersion): void {
    localStorage.setItem(this.VERSION_KEY, JSON.stringify(version));
  }

  private handleNewDeployment(deploymentInfo: any): void {
    const stored = this.getStoredVersion();
    
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

    const deploymentVersion: DeploymentVersion = {
      version: newVersion,
      buildNumber: newBuildNumber,
      deploymentUrl: deploymentInfo.url,
      deploymentNumber: deploymentInfo.number,
      lastDeploymentTime: deploymentInfo.timestamp,
      deploymentId: deploymentInfo.id,
      lastChange: 'Nueva versión publicada automáticamente'
    };

    this.saveVersion(deploymentVersion);
    console.log(`🚀 New deployment detected! Version incremented to v${newVersion} (Build #${newBuildNumber})`);
    console.log('Deployment info:', deploymentInfo);
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('deployment-version-updated', { 
      detail: deploymentVersion 
    }));
  }

  public getCurrentVersion(): DeploymentVersion {
    const stored = this.getStoredVersion();
    if (stored) {
      return stored;
    }

    // Fallback for first time
    const currentDeployment = this.getCurrentDeploymentInfo();
    return {
      version: this.BASE_VERSION,
      buildNumber: 1,
      deploymentUrl: currentDeployment.url,
      deploymentNumber: currentDeployment.number,
      lastDeploymentTime: currentDeployment.timestamp,
      deploymentId: currentDeployment.id,
      lastChange: 'Versión inicial'
    };
  }

  public getFormattedVersion(): string {
    return `v${this.getCurrentVersion().version}`;
  }

  public getBuildNumber(): number {
    return this.getCurrentVersion().buildNumber;
  }

  public manualIncrement(): DeploymentVersion {
    const stored = this.getStoredVersion() || this.getCurrentVersion();
    const versionParts = stored.version.split('.');
    const patch = parseInt(versionParts[2] || '0', 10) + 1;
    
    const newVersion: DeploymentVersion = {
      version: `${versionParts[0]}.${versionParts[1]}.${patch}`,
      buildNumber: stored.buildNumber + 1,
      deploymentUrl: stored.deploymentUrl,
      deploymentNumber: stored.deploymentNumber,
      lastDeploymentTime: new Date().toISOString(),
      deploymentId: stored.deploymentId,
      lastChange: 'Incremento manual por el usuario'
    };

    this.saveVersion(newVersion);
    console.log(`🔧 Version manually incremented to v${newVersion.version}`);
    
    window.dispatchEvent(new CustomEvent('deployment-version-updated', { 
      detail: newVersion 
    }));

    return newVersion;
  }

  public checkForNewDeployment(): boolean {
    const currentDeployment = this.getCurrentDeploymentInfo();
    const stored = this.getStoredVersion();
    
    if (!stored) {
      return false;
    }
    
    if (this.isNewDeployment(stored, currentDeployment)) {
      this.handleNewDeployment(currentDeployment);
      return true;
    }
    
    return false;
  }

  public getDeploymentInfo() {
    const version = this.getCurrentVersion();
    return {
      url: version.deploymentUrl,
      number: version.deploymentNumber,
      id: version.deploymentId,
      lastDeployment: version.lastDeploymentTime
    };
  }
}

export const deploymentVersionService = new DeploymentVersionService();
