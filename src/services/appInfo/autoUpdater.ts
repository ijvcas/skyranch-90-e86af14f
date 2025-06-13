
import type { AppInfo } from './types';

export class AutoUpdater {
  private updateInterval: NodeJS.Timeout | null = null;
  private currentAppInfo: AppInfo | null = null;

  public start(getAppInfoCallback: () => AppInfo): void {
    this.updateInterval = setInterval(() => {
      const newAppInfo = getAppInfoCallback();
      
      if (JSON.stringify(newAppInfo) !== JSON.stringify(this.currentAppInfo)) {
        this.currentAppInfo = newAppInfo;
        console.log('📱 App info auto-updated:', newAppInfo);
        
        window.dispatchEvent(new CustomEvent('app-info-updated', { 
          detail: this.currentAppInfo 
        }));
      }
    }, 60000);
  }

  public stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  public forceUpdate(appInfo: AppInfo): void {
    this.currentAppInfo = appInfo;
    window.dispatchEvent(new CustomEvent('app-info-updated', { 
      detail: this.currentAppInfo 
    }));
  }
}
