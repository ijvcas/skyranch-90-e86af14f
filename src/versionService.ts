
class VersionService {
  public getVersion(): string {
    // Try to get version from environment variables first
    if (import.meta.env.VITE_PACKAGE_VERSION && import.meta.env.VITE_PACKAGE_VERSION !== '0.0.0') {
      return `v${import.meta.env.VITE_PACKAGE_VERSION}`;
    }
    
    // Fallback to a more realistic version for SkyRanch
    return 'v2.3.0';
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
}

// Create and export singleton instance
export const versionService = new VersionService();
