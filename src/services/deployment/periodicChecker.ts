
import { DeploymentDetector } from './deploymentDetector';
import { VersionManager } from './versionManager';

export class PeriodicChecker {
  private checkInterval: number | null = null;
  private deploymentDetector: DeploymentDetector;
  private versionManager: VersionManager;
  private onNewDeploymentCallback: (deploymentInfo: any) => void;
  private lastStableCheck: number = 0;
  private readonly STABLE_DELAY = 60000; // 60 seconds between checks
  private readonly MIN_CHECK_INTERVAL = 30000; // Minimum 30 seconds between actual checks

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
    
    // Check for deployment changes every 60 seconds (much less frequent)
    this.checkInterval = window.setInterval(() => {
      const now = Date.now();
      if (now - this.lastStableCheck >= this.MIN_CHECK_INTERVAL) {
        console.log('🔍 Stable deployment check...');
        this.checkForDeployment();
        this.lastStableCheck = now;
      }
    }, this.STABLE_DELAY);
    
    // Check when the page becomes visible again (but with throttling)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const now = Date.now();
        if (now - this.lastStableCheck >= this.MIN_CHECK_INTERVAL) {
          console.log('🔍 Page became visible, checking for deployment...');
          setTimeout(() => {
            this.checkForDeployment();
            this.lastStableCheck = Date.now();
          }, 2000); // Wait 2 seconds after page becomes visible
        }
      }
    });
  }

  private checkForDeployment(): void {
    const stored = this.versionManager.getStoredVersion();
    const result = this.deploymentDetector.checkForNewDeployment(stored);
    
    if (result.isNewDeployment) {
      console.log('🚀 Confirmed new deployment, updating version...');
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
