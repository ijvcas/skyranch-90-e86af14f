
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type DashboardBanner = Tables<'dashboard_banners'>;

export class DashboardBannerService {
  async getBanner(): Promise<DashboardBanner | null> {
    try {
      const { data, error } = await supabase
        .from('dashboard_banners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching dashboard banner:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getBanner:', error);
      return null;
    }
  }

  async updateBanner(updates: Partial<Pick<DashboardBanner, 'image_url' | 'alt_text'>>): Promise<DashboardBanner | null> {
    try {
      // First, get the current banner
      const current = await this.getBanner();
      
      if (current) {
        // Update existing record
        const { data, error } = await supabase
          .from('dashboard_banners')
          .update(updates)
          .eq('id', current.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating dashboard banner:', error);
          return null;
        }

        return data;
      } else {
        // Create new record if none exists
        const { data, error } = await supabase
          .from('dashboard_banners')
          .insert({
            image_url: updates.image_url || '/lovable-uploads/d3c33c19-f7cd-441e-884f-371ed6481179.png',
            alt_text: updates.alt_text || 'Dashboard Banner',
            is_active: true
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating dashboard banner:', error);
          return null;
        }

        return data;
      }
    } catch (error) {
      console.error('Error in updateBanner:', error);
      return null;
    }
  }
}

export const dashboardBannerService = new DashboardBannerService();
