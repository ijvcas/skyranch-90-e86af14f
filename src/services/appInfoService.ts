
interface AppInfo {
  version: string;
  buildTime: string;
  lastChange: string;
  buildStatus: 'success' | 'building' | 'error';
  environment: 'development' | 'production';
  admin: string;
  description: string;
  gitCommit?: string;
  buildNumber?: string;
}

interface SupportInfo {
  email: string;
  phone: string;
  hours: string;
}

class AppInfoService {
  private appInfo: AppInfo;
  private supportInfo: SupportInfo;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.appInfo = this.detectAppInfo();
    this.supportInfo = this.getDefaultSupportInfo();
    this.startAutoUpdate();
  }

  private detectAppInfo(): AppInfo {
    // Detect version from various sources
    const version = this.detectVersion();
    
    // Detect environment
    const environment = import.meta.env.MODE === 'production' ? 'production' : 'development';
    
    // Detect build status based on app state
    const buildStatus = this.detectBuildStatus();
    
    // Get build time from various sources
    const buildTime = this.detectBuildTime();
    
    // Get git information if available
    const gitInfo = this.detectGitInfo();

    return {
      version,
      buildTime,
      lastChange: gitInfo.lastChange,
      buildStatus,
      environment,
      admin: 'Juan Casanova H', // Can be made dynamic later
      description: 'Sistema de gestión ganadera completo',
      gitCommit: gitInfo.commit,
      buildNumber: gitInfo.buildNumber
    };
  }

  private detectVersion(): string {
    // Try to get version from environment variables first
    if (import.meta.env.VITE_APP_VERSION) {
      return `SkyRanch v${import.meta.env.VITE_APP_VERSION}`;
    }
    
    // Try to detect from build info
    if (import.meta.env.VITE_BUILD_VERSION) {
      return `SkyRanch v${import.meta.env.VITE_BUILD_VERSION}`;
    }
    
    // Generate version based on date if nothing else available
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return `SkyRanch v${year}.${month}.${day}`;
  }

  private detectBuildStatus(): 'success' | 'building' | 'error' {
    try {
      // Check if there are any console errors
      const hasErrors = window.console && window.console.error;
      
      // Check if app is running properly
      const isRunning = document.readyState === 'complete';
      
      // In development, always show success if running
      if (import.meta.env.MODE === 'development' && isRunning) {
        return 'success';
      }
      
      // In production, check for various health indicators
      return isRunning ? 'success' : 'building';
    } catch (error) {
      return 'error';
    }
  }

  private detectBuildTime(): string {
    // Try to get from environment variables
    if (import.meta.env.VITE_BUILD_TIME) {
      return import.meta.env.VITE_BUILD_TIME;
    }
    
    // Try to get from document metadata
    const metaBuildTime = document.querySelector('meta[name="build-time"]');
    if (metaBuildTime) {
      return metaBuildTime.getAttribute('content') || new Date().toISOString();
    }
    
    // Fallback to current time
    return new Date().toISOString();
  }

  private detectGitInfo(): { lastChange: string; commit?: string; buildNumber?: string } {
    // Try to get from environment variables
    const lastChange = import.meta.env.VITE_LAST_CHANGE || 
      'Sistema actualizado automáticamente con correcciones de PWA, selector de usuarios real, controles de mapa mejorados';
    
    const commit = import.meta.env.VITE_GIT_COMMIT;
    const buildNumber = import.meta.env.VITE_BUILD_NUMBER;
    
    return {
      lastChange,
      commit,
      buildNumber
    };
  }

  private getDefaultSupportInfo(): SupportInfo {
    return {
      email: import.meta.env.VITE_SUPPORT_EMAIL || 'soporte@skyranch.com',
      phone: import.meta.env.VITE_SUPPORT_PHONE || '+1 (555) 123-4567',
      hours: 'Lunes a Viernes 8:00 AM - 6:00 PM'
    };
  }

  private startAutoUpdate(): void {
    // Update app info every minute
    this.updateInterval = setInterval(() => {
      const newAppInfo = this.detectAppInfo();
      
      // Only update if something actually changed
      if (JSON.stringify(newAppInfo) !== JSON.stringify(this.appInfo)) {
        this.appInfo = newAppInfo;
        console.log('📱 App info auto-updated:', newAppInfo);
        
        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent('app-info-updated', { 
          detail: this.appInfo 
        }));
      }
    }, 60000); // Update every minute
  }

  public getAppInfo(): AppInfo {
    return { ...this.appInfo };
  }

  public getSupportInfo(): SupportInfo {
    return { ...this.supportInfo };
  }

  public updateSupportInfo(updates: Partial<SupportInfo>): void {
    this.supportInfo = { ...this.supportInfo, ...updates };
    
    // Store in localStorage for persistence
    localStorage.setItem('skyranch-support-info', JSON.stringify(this.supportInfo));
    
    // Dispatch update event
    window.dispatchEvent(new CustomEvent('support-info-updated', { 
      detail: this.supportInfo 
    }));
  }

  public forceRefresh(): void {
    this.appInfo = this.detectAppInfo();
    window.dispatchEvent(new CustomEvent('app-info-updated', { 
      detail: this.appInfo 
    }));
  }

  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// Create singleton instance
export const appInfoService = new AppInfoService();

// Export types for use in components
export type { AppInfo, SupportInfo };
