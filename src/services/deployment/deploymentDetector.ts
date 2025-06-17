
import { DeploymentVersion, DeploymentInfo, DeploymentDetectionResult } from './types';

export class DeploymentDetector {
  private lastCheckedUrl: string = '';
  private lastCheckedId: string = '';

  constructor() {
    const currentDeployment = this.getCurrentDeploymentInfo();
    this.lastCheckedUrl = currentDeployment.url;
    this.lastCheckedId = currentDeployment.id;
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
    const hash = this.hashString(url + Date.now().toString());
    return hash.toString(36).substring(0, 8);
  }

  checkForNewDeployment(stored: DeploymentVersion | null): DeploymentDetectionResult {
    const currentDeployment = this.getCurrentDeploymentInfo();
    
    console.log('🔍 Manual deployment check:', {
      currentUrl: currentDeployment.url,
      storedUrl: stored?.deploymentUrl,
      currentId: currentDeployment.id,
      storedId: stored?.deploymentId
    });

    if (!stored) {
      console.log('⚠️ No stored version found, initializing...');
      return {
        isNewDeployment: true,
        currentDeployment,
        reason: 'No stored version found'
      };
    }

    // Check if we're on a different URL than what we last checked
    if (this.lastCheckedUrl !== currentDeployment.url) {
      console.log('🚀 New deployment detected (URL change from periodic check):', {
        oldUrl: this.lastCheckedUrl,
        newUrl: currentDeployment.url
      });
      this.lastCheckedUrl = currentDeployment.url;
      return {
        isNewDeployment: true,
        currentDeployment,
        reason: 'URL change from periodic check'
      };
    }
    
    // Check if deployment URL changed from stored version
    if (stored.deploymentUrl !== currentDeployment.url) {
      console.log('🚀 New deployment detected (URL change from stored):', {
        old: stored.deploymentUrl,
        new: currentDeployment.url,
        oldNumber: stored.deploymentNumber,
        newNumber: currentDeployment.number
      });
      return {
        isNewDeployment: true,
        currentDeployment,
        reason: 'URL change from stored'
      };
    }
    
    // Check if deployment ID changed
    if (stored.deploymentId !== currentDeployment.id && this.lastCheckedId !== currentDeployment.id) {
      console.log('🚀 New deployment detected (ID change):', {
        oldId: stored.deploymentId,
        newId: currentDeployment.id
      });
      this.lastCheckedId = currentDeployment.id;
      return {
        isNewDeployment: true,
        currentDeployment,
        reason: 'ID change'
      };
    }
    
    // Check if deployment number changed significantly
    const numberDiff = Math.abs(stored.deploymentNumber - currentDeployment.number);
    if (numberDiff > 10) {
      console.log('🚀 New deployment detected (significant number change):', {
        old: stored.deploymentNumber,
        new: currentDeployment.number,
        difference: numberDiff
      });
      return {
        isNewDeployment: true,
        currentDeployment,
        reason: 'Significant number change'
      };
    }

    return {
      isNewDeployment: false,
      currentDeployment
    };
  }

  updateTrackingInfo(deploymentInfo: DeploymentInfo): void {
    this.lastCheckedUrl = deploymentInfo.url;
    this.lastCheckedId = deploymentInfo.id;
  }
}
