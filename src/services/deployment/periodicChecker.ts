
import { DeploymentDetector } from './deploymentDetector';
import { VersionManager } from './versionManager';

export class PeriodicChecker {
  private checkInterval: number | null = null;
  private deploymentDetector: DeploymentDetector;
  private versionManager: VersionManager;
  private onNewDeploymentCallback: (deploymentInfo: any) => void;
  private lastStableCheck: number = 0;
  private readonly STABLE_DELAY = 30000; // 30 seconds between checks (reduced from 60)
  private readonly MIN_CHECK_INTERVAL = 15000; // Minimum 15 seconds between actual checks (reduced from 30)

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
    
    // Check for deployment changes every 30 seconds (more responsive)
    this.checkInterval = window.setInterval(() => {
      const now = Date.now();
      if (now - this.lastStableCheck >= this.MIN_CHECK_INTERVAL) {
        console.log('🔍 Automatic deployment check...');
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
