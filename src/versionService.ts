
import { versionManager } from './services/versionManager';

class VersionService {
  public getVersion(): string {
    // Use the version manager for consistent versioning
    return versionManager.getFormattedVersion();
  }

  public getEnvironment(): 'development' | 'production' {
    // Check if we're in development mode
    if (import.meta.env.DEV) {
      return 'development';
    }
    
    // Check NODE_ENV if available
    if (import.meta.env.NODE_ENV === 'development') {
      return 'development';
    }
    
    // Default to production
    return 'production';
  }

  public getBuildNumber(): number {
    return versionManager.getBuildNumber();
  }

  public getPublishCount(): number {
    return versionManager.getPublishCount();
  }
}

// Create and export singleton instance
export const versionService = new VersionService();
