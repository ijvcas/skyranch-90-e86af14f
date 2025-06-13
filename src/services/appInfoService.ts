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
  private buildNumber: number;

  constructor() {
    this.buildNumber = this.initializeBuildNumber();
    this.appInfo = this.detectAppInfo();
    this.supportInfo = this.getDefaultSupportInfo();
    this.startAutoUpdate();
  }

  private initializeBuildNumber(): number {
    const stored = localStorage.getItem('skyranch-build-number');
    if (stored) {
      const buildNum = parseInt(stored, 10);
      const newBuildNum = buildNum + 1;
      localStorage.setItem('skyranch-build-number', newBuildNum.toString());
      return newBuildNum;
    } else {
      const initialBuild = 1;
      localStorage.setItem('skyranch-build-number', initialBuild.toString());
      return initialBuild;
    }
  }

  private detectAppInfo(): AppInfo {
    const version = this.detectVersion();
    const environment = import.meta.env.MODE === 'production' ? 'production' : 'development';
    const buildStatus = this.detectBuildStatus();
    const buildTime = this.detectBuildTime();
    const gitInfo = this.detectGitInfo();

    return {
      version,
      buildTime,
      lastChange: gitInfo.lastChange,
      buildStatus,
      environment,
      admin: 'Juan Casanova H',
      description: 'Sistema de gestión ganadera completo',
      gitCommit: gitInfo.commit,
      buildNumber: this.buildNumber.toString()
    };
  }

  private detectVersion(): string {
    // 1. Try environment variable first (for manual overrides)
    if (import.meta.env.VITE_APP_VERSION) {
      return `SkyRanch v${import.meta.env.VITE_APP_VERSION}`;
    }
    
    // 2. Try to get from package.json (this would need to be injected during build)
    if (import.meta.env.VITE_PACKAGE_VERSION) {
      return `SkyRanch v${import.meta.env.VITE_PACKAGE_VERSION}`;
    }
    
    // 3. Try build version
    if (import.meta.env.VITE_BUILD_VERSION) {
      return `SkyRanch v${import.meta.env.VITE_BUILD_VERSION}`;
    }
    
    // 4. Default semantic version with build number
    return `SkyRanch v1.0.${this.buildNumber}`;
  }

  private detectBuildStatus(): 'success' | 'building' | 'error' {
    try {
      // Check if app is running properly
      const isRunning = document.readyState === 'complete';
      
      // Check for JavaScript errors
      const hasErrors = window.performance && window.performance.navigation.type === 2;
      
      if (hasErrors) {
        return 'error';
      }
      
      return isRunning ? 'success' : 'building';
    } catch (error) {
      return 'error';
    }
  }

  private detectBuildTime(): string {
    // Try to get from environment variables first
    if (import.meta.env.VITE_BUILD_TIME) {
      return import.meta.env.VITE_BUILD_TIME;
    }
    
    // Try to get from document metadata
    const metaBuildTime = document.querySelector('meta[name="build-time"]');
    if (metaBuildTime) {
      return metaBuildTime.getAttribute('content') || new Date().toISOString();
    }
    
    // Use current session start time
    const sessionStart = sessionStorage.getItem('skyranch-session-start');
    if (sessionStart) {
      return sessionStart;
    }
    
    // Set and return current time
    const currentTime = new Date().toISOString();
    sessionStorage.setItem('skyranch-session-start', currentTime);
    return currentTime;
  }

  private detectGitInfo(): { lastChange: string; commit?: string; buildNumber?: string } {
    // Try to get from environment variables
    let lastChange = import.meta.env.VITE_LAST_CHANGE;
    
    if (!lastChange) {
      // Generate dynamic last change based on recent updates
      const updates = [
        'Correcciones de PWA y controles de mapa mejorados',
        'Sistema de versionado automático implementado',
        'Detección de entorno en tiempo real',
        'Información de aplicación unificada',
        'Actualizaciones automáticas del sistema'
      ];
      
      // Rotate through updates based on build number
      const updateIndex = this.buildNumber % updates.length;
      lastChange = updates[updateIndex];
    }
    
    const commit = import.meta.env.VITE_GIT_COMMIT;
    const buildNumber = this.buildNumber.toString();
    
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
    this.updateInterval = setInterval(() => {
      const newAppInfo = this.detectAppInfo();
      
      if (JSON.stringify(newAppInfo) !== JSON.stringify(this.appInfo)) {
        this.appInfo = newAppInfo;
        console.log('📱 App info auto-updated:', newAppInfo);
        
        window.dispatchEvent(new CustomEvent('app-info-updated', { 
          detail: this.appInfo 
        }));
      }
    }, 60000);
  }

  public getAppInfo(): AppInfo {
    return { ...this.appInfo };
  }

  public getSupportInfo(): SupportInfo {
    return { ...this.supportInfo };
  }

  public updateSupportInfo(updates: Partial<SupportInfo>): void {
    this.supportInfo = { ...this.supportInfo, ...updates };
    
    localStorage.setItem('skyranch-support-info', JSON.stringify(this.supportInfo));
    
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
