
import React, { useState, useEffect } from 'react';
import { dashboardBannerService, type DashboardBanner } from '@/services/dashboardBannerService';
import EnhancedImageViewer from '@/components/image-editor/EnhancedImageViewer';

const DashboardBanner = () => {
  const [banner, setBanner] = useState<DashboardBanner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBanner();
  }, []);

  const loadBanner = async () => {
    try {
      const bannerData = await dashboardBannerService.getBanner();
      if (bannerData) {
        setBanner(bannerData);
      } else {
        // Set default banner
        setBanner({
          id: 'default',
          image_url: '/lovable-uploads/d3c33c19-f7cd-441e-884f-371ed6481179.png',
          alt_text: 'Dashboard Banner',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading banner:', error);
      // Show default banner on error
      setBanner({
        id: 'default',
        image_url: '/lovable-uploads/d3c33c19-f7cd-441e-884f-371ed6481179.png',
        alt_text: 'Dashboard Banner',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !banner) {
    return (
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-8 animate-pulse"></div>
    );
  }

  return (
    <div className="w-full h-48 rounded-lg overflow-hidden mb-8 shadow-lg -mx-4 sm:mx-0">
      <EnhancedImageViewer
        src={banner.image_url}
        alt={banner.alt_text}
        className="w-full h-full object-cover"
        editMode={false}
      />
    </div>
  );
};

export default DashboardBanner;
