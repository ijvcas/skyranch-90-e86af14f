
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { dashboardBannerService, type DashboardBanner } from '@/services/dashboardBannerService';
import ImageUpload from '@/components/ImageUpload';
import { Save } from 'lucide-react';

const DashboardBannerSettings = () => {
  const [banner, setBanner] = useState<DashboardBanner | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBanner();
  }, []);

  const loadBanner = async () => {
    try {
      const bannerData = await dashboardBannerService.getBanner();
      if (bannerData) {
        setBanner(bannerData);
        setImageUrl(bannerData.image_url);
      } else {
        // Set default values
        setImageUrl('/lovable-uploads/d3c33c19-f7cd-441e-884f-371ed6481179.png');
      }
    } catch (error) {
      console.error('Error loading banner:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración del banner.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!imageUrl) {
      toast({
        title: "Error",
        description: "Por favor selecciona una imagen para el banner.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await dashboardBannerService.updateBanner({
        image_url: imageUrl,
        alt_text: 'Dashboard Banner'
      });

      if (result) {
        setBanner(result);
        toast({
          title: "Guardado",
          description: "Banner actualizado correctamente.",
        });
      } else {
        throw new Error('Failed to update banner');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el banner.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (newImageUrl: string | null) => {
    setImageUrl(newImageUrl || '');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Banner del Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Cargando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banner del Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <ImageUpload
            currentImage={imageUrl}
            onImageChange={handleImageChange}
            disabled={isSaving}
          />
        </div>

        <Button onClick={handleSave} disabled={isSaving || !imageUrl} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Banner'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardBannerSettings;
