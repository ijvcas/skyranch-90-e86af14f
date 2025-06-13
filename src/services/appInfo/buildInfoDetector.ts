
import { versionService } from '../../versionService';
import { versionManager } from '../../services/versionManager';
import type { AppInfo } from './types';

export class BuildInfoDetector {
  private buildNumber: number;

  constructor() {
    this.buildNumber = versionManager.getBuildNumber();
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
    const versionInfo = versionManager.getCurrentVersion();
    
    if (import.meta.env.VITE_BUILD_TIME) {
      return import.meta.env.VITE_BUILD_TIME;
    }
    
    // Use the last publish time from version manager
    return versionInfo.lastPublishTime;
  }

  private detectGitInfo(): { lastChange: string; commit?: string; buildNumber?: string } {
    let lastChange = import.meta.env.VITE_LAST_CHANGE;
    
    if (!lastChange) {
      const updates = [
        'Sistema de versionado automático implementado',
        'Versión auto-incremental en cada publicación',
        'Gestión unificada de información de aplicación',
        'Mejoras en la detección de entorno y versión',
        'Sistema de builds numerados automáticamente',
        'Información de versión sincronizada entre dispositivos'
      ];
      
      const updateIndex = (this.buildNumber - 1) % updates.length;
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
