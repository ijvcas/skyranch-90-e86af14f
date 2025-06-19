import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAnimal } from '@/services/animal';
import { useToast } from '@/hooks/use-toast';
import { useAnimalStore } from '@/stores/animalStore';
import type { Animal } from '@/stores/animalStore';
import type { Transform } from '@/components/image-editor';

export interface ImageTransform extends Transform {}

export const useImageTransform = (animal: Animal) => {
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
      
      let updatedNotes = animal.notes || '';
      updatedNotes = updatedNotes.replace(/\[Image Transform Data: .*?\]\n?/g, '');
      
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
        
        updateAnimalStore(animal.id, updatedAnimalData);
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
    if (savedTransform) {
      setCurrentTransform(savedTransform);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setCurrentTransform(null);
  };

  const displayTransform = isEditMode ? currentTransform : savedTransform;

  return {
    isEditMode,
    currentTransform,
    savedTransform,
    displayTransform,
    updateMutation,
    handleImageTransform,
    handleSaveImage,
    handleEditClick,
    handleCancelEdit
  };
};
