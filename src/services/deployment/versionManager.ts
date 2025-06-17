
import { DeploymentVersion, DeploymentInfo } from './types';

export class VersionManager {
  private readonly VERSION_KEY = 'skyranch-deployment-version';
  private readonly BASE_VERSION = '2.4.0';

  getStoredVersion(): DeploymentVersion | null {
    try {
      const stored = localStorage.getItem(this.VERSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to parse stored deployment version:', error);
      return null;
    }
  }

  saveVersion(version: DeploymentVersion): void {
    localStorage.setItem(this.VERSION_KEY, JSON.stringify(version));
  }

  createNewVersion(deploymentInfo: DeploymentInfo, stored: DeploymentVersion | null, changeReason: string): DeploymentVersion {
    let newVersion = this.BASE_VERSION;
    let newBuildNumber = 1;
    
    if (stored) {
      const versionParts = stored.version.split('.');
      const patch = parseInt(versionParts[2] || '0', 10) + 1;
      newVersion = `${versionParts[0]}.${versionParts[1]}.${patch}`;
      newBuildNumber = stored.buildNumber + 1;
    }

    return {
      version: newVersion,
      buildNumber: newBuildNumber,
      deploymentUrl: deploymentInfo.url,
      deploymentNumber: deploymentInfo.number,
      lastDeploymentTime: deploymentInfo.timestamp,
      deploymentId: deploymentInfo.id,
      lastChange: changeReason
    };
  }

  getCurrentVersion(): DeploymentVersion {
    const stored = this.getStoredVersion();
    if (stored) {
      return stored;
    }

    // Create default version if none exists
    const currentUrl = window.location.origin;
    return {
      version: this.BASE_VERSION,
      buildNumber: 1,
      deploymentUrl: currentUrl,
      deploymentNumber: 1,
      lastDeploymentTime: new Date().toISOString(),
      deploymentId: 'initial',
      lastChange: 'Versión inicial'
    };
  }

  incrementVersion(): DeploymentVersion {
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
    return newVersion;
  }

  getFormattedVersion(): string {
    return `v${this.getCurrentVersion().version}`;
  }

  getBuildNumber(): number {
    return this.getCurrentVersion().buildNumber;
  }

  getDeploymentInfo() {
    const version = this.getCurrentVersion();
    return {
      url: version.deploymentUrl,
      number: version.deploymentNumber,
      id: version.deploymentId,
      lastDeployment: version.lastDeploymentTime
    };
  }
}
