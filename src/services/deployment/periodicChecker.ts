
import { DeploymentDetector } from './deploymentDetector';
import { VersionManager } from './versionManager';

export class PeriodicChecker {
  private checkInterval: number | null = null;
  private deploymentDetector: DeploymentDetector;
  private versionManager: VersionManager;
  private onNewDeploymentCallback: (deploymentInfo: any) => void;

  constructor(
    deploymentDetector: DeploymentDetector,
    versionManager: VersionManager,
    onNewDeploymentCallback: (deploymentInfo: any) => void
  ) {
    this.deploymentDetector = deploymentDetector;
    this.versionManager = versionManager;
    this.onNewDeploymentCallback = onNewDeploymentCallback;
  }

  start(): void {
    // Clear any existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    // Check for deployment changes every 15 seconds
    this.checkInterval = window.setInterval(() => {
      console.log('🔍 Checking for new deployment...');
      this.checkForDeployment();
    }, 15000);
    
    // Also check when the page becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('🔍 Page became visible, checking for deployment...');
        setTimeout(() => this.checkForDeployment(), 1000);
      }
    });
  }

  private checkForDeployment(): void {
    const stored = this.versionManager.getStoredVersion();
    const result = this.deploymentDetector.checkForNewDeployment(stored);
    
    if (result.isNewDeployment) {
      this.onNewDeploymentCallback(result.currentDeployment);
    }
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}
