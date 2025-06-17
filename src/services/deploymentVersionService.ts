
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
  private lastCheckedUrl: string = '';
  private lastCheckedId: string = '';

  constructor() {
    this.initializeVersion();
    this.startPeriodicCheck();
  }

  private startPeriodicCheck(): void {
    // Clear any existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    // Check for deployment changes every 15 seconds (more frequent)
    this.checkInterval = window.setInterval(() => {
      console.log('🔍 Checking for new deployment...');
      this.checkForNewDeployment();
    }, 15000);
    
    // Also check when the page becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('🔍 Page became visible, checking for deployment...');
        setTimeout(() => this.checkForNewDeployment(), 1000);
      }
    });
  }

  private initializeVersion(): void {
    const currentDeployment = this.getCurrentDeploymentInfo();
    const stored = this.getStoredVersion();
    
    // Store initial values for comparison
    this.lastCheckedUrl = currentDeployment.url;
    this.lastCheckedId = currentDeployment.id;
    
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
    // Extract deployment number from Lovable URLs
    const lovableMatch = url.match(/([a-f0-9-]{36})\.lovableproject\.com/);
    if (lovableMatch) {
      return this.hashString(lovableMatch[1]) % 10000;
    }
    
    // Extract from legacy skyranch URLs
    const legacyMatch = url.match(/skyranch-(\d+)\.lovable\.app/);
    if (legacyMatch) {
      return parseInt(legacyMatch[1], 10);
    }
    
    // For localhost or other URLs
    const hash = this.hashUrl(url);
    return hash % 1000;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private hashUrl(url: string): number {
    return this.hashString(url);
  }

  private generateDeploymentId(url: string): string {
    const hash = this.hashString(url + Date.now().toString());
    return hash.toString(36).substring(0, 8);
  }

  private isNewDeployment(stored: DeploymentVersion, current: any): boolean {
    // Check if we're on a different URL than what we last checked
    if (this.lastCheckedUrl !== current.url) {
      console.log('🚀 New deployment detected (URL change from periodic check):', {
        oldUrl: this.lastCheckedUrl,
        newUrl: current.url
      });
      this.lastCheckedUrl = current.url;
      return true;
    }
    
    // Check if deployment URL changed from stored version
    if (stored.deploymentUrl !== current.url) {
      console.log('🚀 New deployment detected (URL change from stored):', {
        old: stored.deploymentUrl,
        new: current.url,
        oldNumber: stored.deploymentNumber,
        newNumber: current.number
      });
      return true;
    }
    
    // Check if deployment ID changed
    if (stored.deploymentId !== current.id && this.lastCheckedId !== current.id) {
      console.log('🚀 New deployment detected (ID change):', {
        oldId: stored.deploymentId,
        newId: current.id
      });
      this.lastCheckedId = current.id;
      return true;
    }
    
    // Check if deployment number changed significantly
    const numberDiff = Math.abs(stored.deploymentNumber - current.number);
    if (numberDiff > 10) {
      console.log('🚀 New deployment detected (significant number change):', {
        old: stored.deploymentNumber,
        new: current.number,
        difference: numberDiff
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
    
    let newVersion = this.BASE_VERSION;
    let newBuildNumber = 1;
    
    if (stored) {
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
      lastChange: 'Nueva versión detectada automáticamente'
    };

    this.saveVersion(deploymentVersion);
    console.log(`🚀 New deployment handled! Version: v${newVersion} (Build #${newBuildNumber})`);
    
    // Update our tracking variables
    this.lastCheckedUrl = deploymentInfo.url;
    this.lastCheckedId = deploymentInfo.id;
    
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
      lastChange: 'Incrementó manual por el usuario'
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
    
    console.log('🔍 Manual deployment check:', {
      currentUrl: currentDeployment.url,
      storedUrl: stored?.deploymentUrl,
      currentId: currentDeployment.id,
      storedId: stored?.deploymentId
    });
    
    if (!stored) {
      console.log('⚠️ No stored version found, initializing...');
      this.handleNewDeployment(currentDeployment);
      return true;
    }
    
    if (this.isNewDeployment(stored, currentDeployment)) {
      this.handleNewDeployment(currentDeployment);
      return true;
    }
    
    return false;
  }

  public forceRefresh(): void {
    console.log('🔄 Force refresh triggered');
    
    // Force check for new deployment with fresh data
    const foundNew = this.checkForNewDeployment();
    if (!foundNew) {
      // If no new deployment found, refresh the stored data
      const current = this.getCurrentVersion();
      console.log('🔄 No new deployment, refreshing current data');
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
