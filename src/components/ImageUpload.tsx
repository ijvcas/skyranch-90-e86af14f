
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, Search, X } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string | null) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  currentImage, 
  onImageChange, 
  disabled = false 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Placeholder images for animals
  const placeholderImages = [
    { id: 'cat', url: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901', description: 'Orange and white tabby cat' },
    { id: 'antelope', url: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d', description: 'Brown antelope and zebra' },
    { id: 'ox', url: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a', description: 'Brown ox on mountain' },
    { id: 'kitten', url: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1', description: 'Grey tabby kitten' },
    { id: 'sheep', url: 'https://images.unsplash.com/photo-1452960962994-acf4fd70b632', description: 'Herd of sheep' },
    { id: 'deer', url: 'https://images.unsplash.com/photo-1439886183900-e79ec0057170', description: 'Two brown deers in woods' },
    { id: 'cattle', url: 'https://images.unsplash.com/photo-1465379944081-7f47de8d74ac', description: 'Brown cattle in forest' },
    { id: 'horse', url: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2', description: 'Four brown horses behind fence' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        onImageChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setPreviewUrl(imageUrl);
    onImageChange(imageUrl);
    setIsSearching(false);
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredImages = placeholderImages.filter(img =>
    img.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Animal preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center border-2 border-dashed border-gray-300">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Añadir foto del animal</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Archivo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSearching(!isSearching)}
                disabled={disabled}
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar Imagen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {isSearching && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="search">Buscar imágenes de animales</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Ej: gato, vaca, oveja..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-64 overflow-y-auto">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className="cursor-pointer rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                    onClick={() => handleImageSelect(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={image.description}
                      className="w-full h-24 object-cover"
                    />
                    <p className="text-xs text-gray-600 p-1 truncate">
                      {image.description}
                    </p>
                  </div>
                ))}
              </div>
              {filteredImages.length === 0 && searchQuery && (
                <p className="text-gray-500 text-center py-4">
                  No se encontraron imágenes para "{searchQuery}"
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUpload;
