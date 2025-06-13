
import { versionService } from '../versionService';
import type { AppInfo } from './types';

export class BuildInfoDetector {
  private buildNumber: number;

  constructor() {
    this.buildNumber = this.initializeBuildNumber();
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

  public detectAppInfo(): AppInfo {
    const version = this.detectVersion();
    const environment = versionService.getEnvironment();
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
    return versionService.getVersion();
  }

  private detectBuildStatus(): 'success' | 'building' | 'error' {
    try {
      const isRunning = document.readyState === 'complete';
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
    if (import.meta.env.VITE_BUILD_TIME) {
      return import.meta.env.VITE_BUILD_TIME;
    }
    
    const metaBuildTime = document.querySelector('meta[name="build-time"]');
    if (metaBuildTime) {
      return metaBuildTime.getAttribute('content') || new Date().toISOString();
    }
    
    const sessionStart = sessionStorage.getItem('skyranch-session-start');
    if (sessionStart) {
      return sessionStart;
    }
    
    const currentTime = new Date().toISOString();
    sessionStorage.setItem('skyranch-session-start', currentTime);
    return currentTime;
  }

  private detectGitInfo(): { lastChange: string; commit?: string; buildNumber?: string } {
    let lastChange = import.meta.env.VITE_LAST_CHANGE;
    
    if (!lastChange) {
      const updates = [
        'Correcciones de PWA y controles de mapa mejorados',
        'Sistema de versionado automático implementado',
        'Detección de entorno en tiempo real',
        'Información de aplicación unificada',
        'Actualizaciones automáticas del sistema'
      ];
      
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

  public getBuildNumber(): number {
    return this.buildNumber;
  }
}
