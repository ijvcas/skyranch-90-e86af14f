
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, Search, X } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string | null) => void;
  disabled?: boolean;
  animalType?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  currentImage, 
  onImageChange, 
  disabled = false,
  animalType = ''
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // More varied placeholder images categorized by animal type
  const placeholderImages = [
    // Bovinos
    { id: 'cow1', url: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a', description: 'Vaca Holstein', type: 'bovino' },
    { id: 'cow2', url: 'https://images.unsplash.com/photo-1465379944081-7f47de8d74ac', description: 'Ganado en pastizal', type: 'bovino' },
    { id: 'bull1', url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a', description: 'Toro negro', type: 'bovino' },
    
    // Ovinos
    { id: 'sheep1', url: 'https://images.unsplash.com/photo-1452960962994-acf4fd70b632', description: 'Rebaño de ovejas', type: 'ovino' },
    { id: 'sheep2', url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7', description: 'Oveja blanca', type: 'ovino' },
    { id: 'lamb1', url: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9', description: 'Cordero joven', type: 'ovino' },
    
    // Equinos
    { id: 'horse1', url: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2', description: 'Caballos marrones', type: 'equino' },
    { id: 'horse2', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000', description: 'Caballo negro', type: 'equino' },
    { id: 'donkey1', url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee', description: 'Burro gris', type: 'equino' },
    
    // Caprinos
    { id: 'goat1', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b', description: 'Cabra blanca', type: 'caprino' },
    { id: 'goat2', url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a', description: 'Cabrito joven', type: 'caprino' },
    
    // Porcinos
    { id: 'pig1', url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a', description: 'Cerdo rosa', type: 'porcino' },
    { id: 'pig2', url: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7', description: 'Lechones', type: 'porcino' },
    
    // Aves
    { id: 'chicken1', url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b', description: 'Gallinas ponedoras', type: 'aviar' },
    { id: 'rooster1', url: 'https://images.unsplash.com/photo-1612170153139-6f881ff067cd', description: 'Gallo colorido', type: 'aviar' },
    
    // Generales
    { id: 'farm1', url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30', description: 'Animales de granja', type: 'general' },
    { id: 'pasture1', url: 'https://images.unsplash.com/photo-1439886183900-e79ec0057170', description: 'Animales en pastizal', type: 'general' }
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

  // Filter images based on animal type or search query
  const getFilteredImages = () => {
    let filtered = placeholderImages;
    
    // Filter by animal type if specified
    if (animalType && animalType !== '') {
      filtered = filtered.filter(img => 
        img.type === animalType || img.type === 'general'
      );
    }
    
    // Further filter by search query
    if (searchQuery) {
      filtered = filtered.filter(img =>
        img.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredImages = getFilteredImages();

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
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center border-2 border-dashed border-gray-300">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Añadir foto del animal
              {animalType && ` (${animalType})`}
            </p>
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
                <Label htmlFor="search">
                  Buscar imágenes 
                  {animalType && ` de ${animalType}s`}
                </Label>
                <Input
                  id="search"
                  type="text"
                  placeholder={`Ej: ${animalType || 'vaca, oveja, caballo'}...`}
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
              {filteredImages.length === 0 && !searchQuery && animalType && (
                <p className="text-gray-500 text-center py-4">
                  No hay imágenes disponibles para {animalType}s
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
