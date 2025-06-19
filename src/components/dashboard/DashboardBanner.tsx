
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
      setBanner(bannerData);
    } catch (error) {
      console.error('Error loading banner:', error);
      // Set fallback banner on error
      setBanner({
        id: 'fallback',
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

  if (isLoading) {
    return (
      <div className="w-screen h-48 bg-gray-200 animate-pulse"></div>
    );
  }

  // If no banner is configured, use the default fallback
  const bannerToShow = banner || {
    id: 'default',
    image_url: '/lovable-uploads/d3c33c19-f7cd-441e-884f-371ed6481179.png',
    alt_text: 'Dashboard Banner',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return (
    <div className="w-screen h-48 overflow-hidden shadow-lg">
      <EnhancedImageViewer
        src={bannerToShow.image_url}
        alt={bannerToShow.alt_text}
        className="w-full h-full object-cover"
        editMode={false}
      />
    </div>
  );
};

export default DashboardBanner;
