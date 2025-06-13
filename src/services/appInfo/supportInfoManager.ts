
import type { SupportInfo } from './types';

export class SupportInfoManager {
  private supportInfo: SupportInfo;

  constructor() {
    this.supportInfo = this.getDefaultSupportInfo();
    this.loadStoredSupportInfo();
  }

  private getDefaultSupportInfo(): SupportInfo {
    return {
      email: import.meta.env.VITE_SUPPORT_EMAIL || 'soporte@skyranch.com',
      phone: import.meta.env.VITE_SUPPORT_PHONE || '+1 (555) 123-4567',
      hours: 'Lunes a Viernes 8:00 AM - 6:00 PM'
    };
  }

  private loadStoredSupportInfo(): void {
    const stored = localStorage.getItem('skyranch-support-info');
    if (stored) {
      try {
        const parsedInfo = JSON.parse(stored);
        this.supportInfo = { ...this.supportInfo, ...parsedInfo };
      } catch (error) {
        console.warn('Failed to parse stored support info:', error);
      }
    }
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
}
