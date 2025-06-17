
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
  private readonly BASE_VERSION = '2.4.0';
  private checkInterval: number | null = null;

  constructor() {
    this.initializeVersion();
    this.startPeriodicCheck();
  }

  private startPeriodicCheck(): void {
    // Check for deployment changes every 30 seconds
    this.checkInterval = window.setInterval(() => {
      this.checkForNewDeployment();
    }, 30000);
  }

  private initializeVersion(): void {
    // Always check for new deployment on initialization
    const currentDeployment = this.getCurrentDeploymentInfo();
    const stored = this.getStoredVersion();
    
    if (!stored || this.isNewDeployment(stored, currentDeployment)) {
      this.handleNewDeployment(currentDeployment);
    }
  }

  private getCurrentDeploymentInfo() {
    const currentUrl = window.location.origin;
    const deploymentNumber = this.extractDeploymentNumber(currentUrl);
    const deploymentId = this.generateDeploymentId(currentUrl);
    
    return {
      url: currentUrl,
      number: deploymentNumber,
      timestamp: new Date().toISOString(),
      id: deploymentId
    };
  }

  private extractDeploymentNumber(url: string): number {
    // Extract deployment number from Lovable URLs like d956216c-86a1-4ff3-9df4-bdfbbabf459a.lovableproject.com
    const lovableMatch = url.match(/([a-f0-9-]{36})\.lovableproject\.com/);
    if (lovableMatch) {
      // Use a hash of the full UUID for the deployment number
      return this.hashString(lovableMatch[1]) % 10000;
    }
    
    // Extract from legacy skyranch URLs like skyranch-90.lovable.app
    const legacyMatch = url.match(/skyranch-(\d+)\.lovable\.app/);
    if (legacyMatch) {
      return parseInt(legacyMatch[1], 10);
    }
    
    // For localhost or other URLs, use a hash-based approach
    const hash = this.hashUrl(url);
    return hash % 1000;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private hashUrl(url: string): number {
    return this.hashString(url);
  }

  private generateDeploymentId(url: string): string {
    // Create a shorter, more readable deployment ID
    const hash = this.hashString(url);
    return hash.toString(36).substring(0, 8);
  }

  private isNewDeployment(stored: DeploymentVersion, current: any): boolean {
    // Check if deployment URL changed (most reliable for Lovable)
    if (stored.deploymentUrl !== current.url) {
      console.log('🚀 New deployment detected (URL change):', {
        old: stored.deploymentUrl,
        new: current.url,
        oldNumber: stored.deploymentNumber,
        newNumber: current.number
      });
      return true;
    }
    
    // Check if deployment ID changed
    if (stored.deploymentId !== current.id) {
      console.log('🚀 New deployment detected (ID change):', {
        oldId: stored.deploymentId,
        newId: current.id
      });
      return true;
    }
    
    // Check if deployment number changed
    if (stored.deploymentNumber !== current.number) {
      console.log('🚀 New deployment detected (number change):', {
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
      lastChange: 'Nueva versión publicada desde Lovable'
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

  public forceRefresh(): void {
    // Force check for new deployment
    const foundNew = this.checkForNewDeployment();
    if (!foundNew) {
      // If no new deployment found, just refresh the stored data
      const current = this.getCurrentVersion();
      window.dispatchEvent(new CustomEvent('deployment-version-updated', { 
        detail: current 
      }));
    }
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

  public destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const deploymentVersionService = new DeploymentVersionService();
