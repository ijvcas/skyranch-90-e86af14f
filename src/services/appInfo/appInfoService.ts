
import { BuildInfoDetector } from './buildInfoDetector';
import { SupportInfoManager } from './supportInfoManager';
import { AutoUpdater } from './autoUpdater';
import type { AppInfo, SupportInfo } from './types';

class AppInfoService {
  private buildInfoDetector: BuildInfoDetector;
  private supportInfoManager: SupportInfoManager;
  private autoUpdater: AutoUpdater;

  constructor() {
    this.buildInfoDetector = new BuildInfoDetector();
    this.supportInfoManager = new SupportInfoManager();
    this.autoUpdater = new AutoUpdater();
    this.startAutoUpdate();
  }

  private startAutoUpdate(): void {
    this.autoUpdater.start(() => this.buildInfoDetector.detectAppInfo());
  }

  public getAppInfo(): AppInfo {
    return this.buildInfoDetector.detectAppInfo();
  }

  public getSupportInfo(): SupportInfo {
    return this.supportInfoManager.getSupportInfo();
  }

  public updateSupportInfo(updates: Partial<SupportInfo>): void {
    this.supportInfoManager.updateSupportInfo(updates);
  }

  public forceRefresh(): void {
    const appInfo = this.buildInfoDetector.detectAppInfo();
    this.autoUpdater.forceUpdate(appInfo);
  }

  public destroy(): void {
    this.autoUpdater.stop();
  }
}

// Create singleton instance
export const appInfoService = new AppInfoService();
