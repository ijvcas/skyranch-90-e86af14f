
import { supabase } from '@/integrations/supabase/client';

export interface SupportSettings {
  id: string;
  email: string;
  phone: string;
  hours: string;
  created_at: string;
  updated_at: string;
}

export class SupportSettingsService {
  async getSupportSettings(): Promise<SupportSettings | null> {
    try {
      const { data, error } = await supabase
        .from('support_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching support settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getSupportSettings:', error);
      return null;
    }
  }

  async updateSupportSettings(updates: Partial<Pick<SupportSettings, 'email' | 'phone' | 'hours'>>): Promise<SupportSettings | null> {
    try {
      // First, get the current settings
      const current = await this.getSupportSettings();
      
      if (current) {
        // Update existing record
        const { data, error } = await supabase
          .from('support_settings')
          .update(updates)
          .eq('id', current.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating support settings:', error);
          return null;
        }

        return data;
      } else {
        // Create new record if none exists
        const { data, error } = await supabase
          .from('support_settings')
          .insert({
            email: updates.email || 'soporte@skyranch.com',
            phone: updates.phone || '+1 (555) 123-4567',
            hours: updates.hours || 'Lunes a Viernes 8:00 AM - 6:00 PM'
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating support settings:', error);
          return null;
        }

        return data;
      }
    } catch (error) {
      console.error('Error in updateSupportSettings:', error);
      return null;
    }
  }
}

export const supportSettingsService = new SupportSettingsService();
