
import { DeploymentVersion, DeploymentInfo, DeploymentDetectionResult } from './types';

export class DeploymentDetector {
  private lastCheckedUrl: string = '';
  private lastCheckedId: string = '';
  private lastCheckedTime: number = 0;
  private readonly MINIMUM_CHANGE_INTERVAL = 30000; // 30 seconds minimum between changes

  constructor() {
    const currentDeployment = this.getCurrentDeploymentInfo();
    this.lastCheckedUrl = currentDeployment.url;
    this.lastCheckedId = currentDeployment.id;
    this.lastCheckedTime = Date.now();
  }

  getCurrentDeploymentInfo(): DeploymentInfo {
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
    // Use a more stable ID generation that doesn't change on every check
    const baseHash = this.hashString(url);
    const hourlyStamp = Math.floor(Date.now() / (1000 * 60 * 60)); // Changes every hour
    const combinedHash = this.hashString(baseHash.toString() + hourlyStamp.toString());
    return combinedHash.toString(36).substring(0, 8);
  }

  checkForNewDeployment(stored: DeploymentVersion | null): DeploymentDetectionResult {
    const now = Date.now();
    const currentDeployment = this.getCurrentDeploymentInfo();
    
    console.log('🔍 Conservative deployment check:', {
      currentUrl: currentDeployment.url,
      storedUrl: stored?.deploymentUrl,
      timeSinceLastCheck: now - this.lastCheckedTime,
      minimumInterval: this.MINIMUM_CHANGE_INTERVAL
    });

    if (!stored) {
      console.log('⚠️ No stored version found, initializing...');
      this.updateTrackingInfo(currentDeployment);
      return {
        isNewDeployment: true,
        currentDeployment,
        reason: 'No stored version found'
      };
    }

    // Only check if enough time has passed since last change
    if (now - this.lastCheckedTime < this.MINIMUM_CHANGE_INTERVAL) {
      console.log('⏳ Too soon since last check, skipping...');
      return {
        isNewDeployment: false,
        currentDeployment
      };
    }

    // Check if we're on a completely different URL (major deployment change)
    if (stored.deploymentUrl !== currentDeployment.url) {
      console.log('🚀 Major deployment detected (URL change):', {
        old: stored.deploymentUrl,
        new: currentDeployment.url
      });
      this.updateTrackingInfo(currentDeployment);
      return {
        isNewDeployment: true,
        currentDeployment,
        reason: 'URL change detected'
      };
    }

    // For same URL, be much more conservative - only update if there's a significant time gap
    // indicating a real publish event rather than live editing
    const storedTime = new Date(stored.lastDeploymentTime).getTime();
    const timeDiff = now - storedTime;
    
    if (timeDiff > 300000) { // Only if more than 5 minutes since last update
      const currentId = this.generateDeploymentId(currentDeployment.url);
      if (stored.deploymentId !== currentId) {
        console.log('🚀 Stable deployment detected after time gap:', {
          oldId: stored.deploymentId,
          newId: currentId,
          timeDiff: timeDiff / 1000 + ' seconds'
        });
        this.updateTrackingInfo(currentDeployment);
        return {
          isNewDeployment: true,
          currentDeployment,
          reason: 'Stable deployment after time gap'
        };
      }
    }

    return {
      isNewDeployment: false,
      currentDeployment
    };
  }

  updateTrackingInfo(deploymentInfo: DeploymentInfo): void {
    this.lastCheckedUrl = deploymentInfo.url;
    this.lastCheckedId = deploymentInfo.id;
    this.lastCheckedTime = Date.now();
  }
}
