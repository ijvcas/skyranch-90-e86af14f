
import type { SupportInfo } from './types';
import { supportSettingsService } from '@/services/supportSettingsService';

export class SupportInfoManager {
  private supportInfo: SupportInfo;
  private isLoading: boolean = false;

  constructor() {
    this.supportInfo = this.getDefaultSupportInfo();
    this.loadSupportInfo();
  }

  private getDefaultSupportInfo(): SupportInfo {
    return {
      email: import.meta.env.VITE_SUPPORT_EMAIL || 'soporte@skyranch.com',
      phone: import.meta.env.VITE_SUPPORT_PHONE || '+1 (555) 123-4567',
      hours: 'Lunes a Viernes 8:00 AM - 6:00 PM'
    };
  }

  private async loadSupportInfo(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      // Try to load from database first
      const dbSettings = await supportSettingsService.getSupportSettings();
      
      if (dbSettings) {
        this.supportInfo = {
          email: dbSettings.email,
          phone: dbSettings.phone,
          hours: dbSettings.hours
        };
        
        // Also update localStorage as backup
        localStorage.setItem('skyranch-support-info', JSON.stringify(this.supportInfo));
        
        // Dispatch update event
        window.dispatchEvent(new CustomEvent('support-info-updated', { 
          detail: this.supportInfo 
        }));
      } else {
        // Fallback to localStorage if database fails
        this.loadStoredSupportInfo();
      }
    } catch (error) {
      console.error('Failed to load support info from database:', error);
      // Fallback to localStorage
      this.loadStoredSupportInfo();
    } finally {
      this.isLoading = false;
    }
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

  public async updateSupportInfo(updates: Partial<SupportInfo>): Promise<void> {
    try {
      // Update in database first
      const updatedSettings = await supportSettingsService.updateSupportSettings(updates);
      
      if (updatedSettings) {
        this.supportInfo = {
          email: updatedSettings.email,
          phone: updatedSettings.phone,
          hours: updatedSettings.hours
        };
      } else {
        // Fallback to local update if database fails
        this.supportInfo = { ...this.supportInfo, ...updates };
      }
      
      // Always update localStorage as backup
      localStorage.setItem('skyranch-support-info', JSON.stringify(this.supportInfo));
      
      // Dispatch update event
      window.dispatchEvent(new CustomEvent('support-info-updated', { 
        detail: this.supportInfo 
      }));
      
      console.log('Support info updated successfully:', this.supportInfo);
    } catch (error) {
      console.error('Failed to update support info:', error);
      
      // Fallback to localStorage-only update
      this.supportInfo = { ...this.supportInfo, ...updates };
      localStorage.setItem('skyranch-support-info', JSON.stringify(this.supportInfo));
      
      window.dispatchEvent(new CustomEvent('support-info-updated', { 
        detail: this.supportInfo 
      }));
    }
  }

  public async refreshFromDatabase(): Promise<void> {
    await this.loadSupportInfo();
  }
}
