
import { DeploymentVersion } from './deployment/types';
import { DeploymentDetector } from './deployment/deploymentDetector';
import { VersionManager } from './deployment/versionManager';
import { PeriodicChecker } from './deployment/periodicChecker';

class DeploymentVersionService {
  private deploymentDetector: DeploymentDetector;
  private versionManager: VersionManager;
  private periodicChecker: PeriodicChecker;
  private isInitialized: boolean = false;

  constructor() {
    this.deploymentDetector = new DeploymentDetector();
    this.versionManager = new VersionManager();
    this.periodicChecker = new PeriodicChecker(
      this.deploymentDetector,
      this.versionManager,
      (deploymentInfo) => this.handleNewDeployment(deploymentInfo)
    );
  }

  private initializeVersion(): void {
    if (this.isInitialized) return;
    
    const stored = this.versionManager.getStoredVersion();
    console.log('🔄 Initializing deployment version service...');
    
    // Check for new deployment on initialization
    const result = this.deploymentDetector.checkForNewDeployment(stored);
    
    if (result.isNewDeployment) {
      console.log('🚀 Initial deployment detected:', result.reason);
      this.handleNewDeployment(result.currentDeployment);
    }
    
    this.periodicChecker.start();
    this.isInitialized = true;
  }

  private handleNewDeployment(deploymentInfo: any): void {
    const stored = this.versionManager.getStoredVersion();
    const changeReason = 'Nueva versión detectada automáticamente';
    
    const deploymentVersion = this.versionManager.createNewVersion(
      deploymentInfo, 
      stored, 
      changeReason
    );

    this.versionManager.saveVersion(deploymentVersion);
    console.log(`🚀 New deployment handled! Version: v${deploymentVersion.version} (Build #${deploymentVersion.buildNumber})`);
    
    // Update tracking variables
    this.deploymentDetector.updateTrackingInfo(deploymentInfo);
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('deployment-version-updated', { 
      detail: deploymentVersion 
    }));
  }

  public getCurrentVersion(): DeploymentVersion {
    if (!this.isInitialized) {
      this.initializeVersion();
    }
    return this.versionManager.getCurrentVersion();
  }

  public getFormattedVersion(): string {
    return this.versionManager.getFormattedVersion();
  }

  public getBuildNumber(): number {
    return this.versionManager.getBuildNumber();
  }

  public manualIncrement(): DeploymentVersion {
    const newVersion = this.versionManager.incrementVersion();
    console.log(`🔧 Version manually incremented to v${newVersion.version}`);
    
    window.dispatchEvent(new CustomEvent('deployment-version-updated', { 
      detail: newVersion 
    }));

    return newVersion;
  }

  public checkForNewDeployment(): boolean {
    console.log('🔍 Manual deployment check triggered');
    const stored = this.versionManager.getStoredVersion();
    const result = this.deploymentDetector.checkForNewDeployment(stored);
    
    if (result.isNewDeployment) {
      console.log('🚀 Manual check found new deployment');
      this.handleNewDeployment(result.currentDeployment);
      return true;
    } else {
      console.log('ℹ️ Manual check found no new deployment');
    }
    
    return false;
  }

  public forceRefresh(): void {
    console.log('🔄 Force refresh triggered');
    
    // Reset the last check time to allow immediate check
    this.deploymentDetector.updateTrackingInfo(this.deploymentDetector.getCurrentDeploymentInfo());
    
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
    return this.versionManager.getDeploymentInfo();
  }

  public destroy(): void {
    this.periodicChecker.stop();
  }
}

export const deploymentVersionService = new DeploymentVersionService();
