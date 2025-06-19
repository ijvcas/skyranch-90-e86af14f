
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { placeholderImages } from './placeholderImages';
import { PlaceholderImage } from './types';

interface ImageGalleryProps {
  animalType?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onImageSelect: (imageUrl: string) => void;
  disabled?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  animalType,
  searchQuery,
  onSearchChange,
  onImageSelect,
  disabled = false
}) => {
  const getFilteredImages = (): PlaceholderImage[] => {
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
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-64 overflow-y-auto">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="cursor-pointer rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                onClick={() => onImageSelect(image.url)}
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
  );
};

export default ImageGallery;
