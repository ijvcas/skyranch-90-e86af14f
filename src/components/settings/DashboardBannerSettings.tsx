
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { dashboardBannerService, DashboardBanner } from '@/services/dashboardBannerService';
import EnhancedImageViewer from '@/components/image-editor/EnhancedImageViewer';
import { Save, Upload } from 'lucide-react';

const DashboardBannerSettings = () => {
  const [banner, setBanner] = useState<DashboardBanner | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
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
        setAltText(bannerData.alt_text);
      } else {
        // Set default values
        setImageUrl('/lovable-uploads/d3c33c19-f7cd-441e-884f-371ed6481179.png');
        setAltText('Dashboard Banner');
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
    setIsSaving(true);
    try {
      const result = await dashboardBannerService.updateBanner({
        image_url: imageUrl,
        alt_text: altText
      });

      if (result) {
        setBanner(result);
        toast({
          title: "Guardado",
          description: "Configuración del banner actualizada correctamente.",
        });
      } else {
        throw new Error('Failed to update banner');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración del banner.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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
          <Label htmlFor="imageUrl">URL de la Imagen</Label>
          <Input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL de la imagen del banner"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="altText">Texto Alternativo</Label>
          <Input
            id="altText"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Descripción de la imagen"
          />
        </div>

        {imageUrl && (
          <div className="space-y-2">
            <Label>Vista Previa</Label>
            <div className="border rounded-lg overflow-hidden">
              <EnhancedImageViewer
                src={imageUrl}
                alt={altText}
                className="w-full h-32"
                editMode={false}
              />
            </div>
          </div>
        )}

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardBannerSettings;
