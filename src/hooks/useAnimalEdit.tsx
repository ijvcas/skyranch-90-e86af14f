
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { getAnimal } from '@/services/animal';
import { useAnimalEditForm } from './animal-edit/useAnimalEditForm';
import { useAnimalEditSubmit } from './animal-edit/useAnimalEditSubmit';

export const useAnimalEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  // Fetch animal data
  const { data: animal, isLoading: isLoadingAnimal, error } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => getAnimal(id!),
    enabled: !!id
  });

  const { formData, handleInputChange, handleImageChange } = useAnimalEditForm(animal);
  const { updateMutation, handleSubmit } = useAnimalEditSubmit(id!, formData, navigate);

  useEffect(() => {
    if (error) {
      toast({
        title: "Animal no encontrado",
        description: "El animal que intentas editar no existe.",
        variant: "destructive"
      });
      navigate('/animals');
    }
  }, [error, navigate, toast]);

  return {
    id,
    animal,
    isLoadingAnimal,
    formData,
    updateMutation,
    handleSubmit,
    handleInputChange,
    handleImageChange,
    navigate
  };
};
