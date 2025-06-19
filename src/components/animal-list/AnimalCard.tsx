import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2, Save, X } from 'lucide-react';
import { getStatusColor, getStatusText } from '@/utils/animalStatus';
import EnhancedImageViewer from '@/components/image-editor/EnhancedImageViewer';
import { useAnimalStore } from '@/stores/animalStore';
import { updateAnimal } from '@/services/animal';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Animal } from '@/stores/animalStore';

interface AnimalCardProps {
  animal: Animal;
  onDelete: (animalId: string, animalName: string) => void;
}

interface ImageTransform {
  scale: number;
  translateX: number;
  translateY: number;
  rotation: number;
}

const AnimalCard = ({ animal, onDelete }: AnimalCardProps) => {
  const navigate = useNavigate();
  const { updateAnimal: updateAnimalStore } = useAnimalStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTransform, setCurrentTransform] = useState<ImageTransform | null>(null);
  const [savedTransform, setSavedTransform] = useState<ImageTransform | null>(null);

  // Load saved transform data when component mounts
  useEffect(() => {
    if (animal.notes) {
      try {
        // Look for saved transform data in notes
        const transformMatch = animal.notes.match(/\[Image Transform Data: (.*?)\]/);
        if (transformMatch) {
          const transformData = JSON.parse(transformMatch[1]);
          setSavedTransform(transformData);
          console.log('Loaded saved transform:', transformData);
        }
      } catch (error) {
        console.error('Error parsing saved transform data:', error);
      }
    }
  }, [animal.notes]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateAnimal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['animal', animal.id] });
      toast({
        title: "Imagen actualizada",
        description: `La imagen de ${animal.name} ha sido actualizada exitosamente.`,
      });
    },
    onError: (error) => {
      console.error('Error updating animal image:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la imagen del animal.",
        variant: "destructive"
      });
    }
  });

  const handleImageTransform = (transform: ImageTransform) => {
    setCurrentTransform(transform);
    console.log('Image transform applied:', transform);
  };

  const handleSaveImage = async () => {
    if (currentTransform) {
      console.log('Saving image with transform:', currentTransform);
      
      // Save the transform data properly in the notes field
      let updatedNotes = animal.notes || '';
      
      // Remove any existing transform data
      updatedNotes = updatedNotes.replace(/\[Image Transform Data: .*?\]\n?/g, '');
      
      // Add new transform data
      const transformDataString = JSON.stringify(currentTransform);
      const transformNote = `[Image Transform Data: ${transformDataString}]`;
      updatedNotes = updatedNotes ? `${updatedNotes}\n${transformNote}` : transformNote;
      
      const updatedAnimalData = {
        ...animal,
        notes: updatedNotes
      };
      
      try {
        await updateMutation.mutateAsync({ 
          id: animal.id, 
          data: updatedAnimalData 
        });
        
        // Update local store with the new data
        updateAnimalStore(animal.id, updatedAnimalData);
        
        // Update saved transform state
        setSavedTransform(currentTransform);
        
        console.log('Image transform saved successfully');
        
      } catch (error) {
        console.error('Error saving image transform:', error);
      }
    } else {
      console.log('No transform to save');
      toast({
        title: "Sin cambios",
        description: "No hay transformaciones de imagen para guardar.",
        variant: "default"
      });
    }
    
    setIsEditMode(false);
    setCurrentTransform(null);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    // Start with saved transform if available
    if (savedTransform) {
      setCurrentTransform(savedTransform);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setCurrentTransform(null);
  };

  // Determine which transform to use for display
  const displayTransform = isEditMode ? currentTransform : savedTransform;

  return (
    <Card className="shadow hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-gray-900">{animal.name}</CardTitle>
            <p className="text-sm text-gray-600">#{animal.tag}</p>
          </div>
          <Badge className={`${getStatusColor(animal.healthStatus)}`}>
            {getStatusText(animal.healthStatus)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {animal.image && (
          <div className="mb-4 relative">
            <EnhancedImageViewer
              src={animal.image}
              alt={animal.name}
              className="w-full h-32 rounded-lg"
              editMode={isEditMode}
              onTransformChange={handleImageTransform}
              initialTransform={displayTransform}
            />
            {!isEditMode && (
              <div className="absolute top-2 right-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-black/50 text-white hover:bg-black/70 h-8 w-8 p-0"
                  onClick={handleEditClick}
                  title="Edit Image"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            )}
            {isEditMode && (
              <div className="absolute top-2 left-2 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-green-600/80 text-white hover:bg-green-700/80 h-8 w-8 p-0"
                  onClick={handleSaveImage}
                  title="Save Changes"
                  disabled={updateMutation.isPending}
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-red-600/80 text-white hover:bg-red-700/80 h-8 w-8 p-0"
                  onClick={handleCancelEdit}
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Show transform status if any */}
        {currentTransform && isEditMode && (
          <div className="mb-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
            Transformaciones pendientes: Zoom {Math.round(currentTransform.scale * 100)}%, 
            Rotación {currentTransform.rotation}°
          </div>
        )}

        {/* Show saved transform info */}
        {savedTransform && !isEditMode && (
          <div className="mb-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
            Imagen personalizada: Zoom {Math.round(savedTransform.scale * 100)}%, 
            Rotación {savedTransform.rotation}°
          </div>
        )}

        <div className="space-y-2">
          {animal.breed && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Raza:</span>
              <span className="font-medium">{animal.breed}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sexo:</span>
            <span className="font-medium">
              {animal.gender === 'macho' ? 'Macho' : animal.gender === 'hembra' ? 'Hembra' : 'No especificado'}
            </span>
          </div>
          {animal.weight && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Peso:</span>
              <span className="font-medium">{animal.weight} kg</span>
            </div>
          )}
        </div>
        <div className="flex space-x-1 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/animals/${animal.id}`)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/animals/${animal.id}/edit`)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(animal.id, animal.name)}
            className="flex-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnimalCard;
