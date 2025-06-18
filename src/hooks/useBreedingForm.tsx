
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { createBreedingRecord } from '@/services/breedingService';
import { getAllAnimals } from '@/services/animalService';

export interface BreedingFormData {
  motherId: string;
  fatherId: string;
  breedingDate: string;
  breedingMethod: 'natural' | 'artificial_insemination' | 'embryo_transfer';
  actualBirthDate: string;
  pregnancyConfirmed: boolean;
  pregnancyConfirmationDate: string;
  pregnancyMethod: 'visual' | 'ultrasound' | 'blood_test' | 'palpation' | '';
  offspringCount: number;
  breedingNotes: string;
  veterinarian: string;
  cost: string;
  status: 'planned' | 'failed' | 'birth_completed' | 'completed' | 'confirmed_pregnant' | 'not_pregnant';
}

export const useBreedingForm = (onSuccess: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<BreedingFormData>({
    motherId: '',
    fatherId: '',
    breedingDate: '',
    breedingMethod: 'natural' as const,
    actualBirthDate: '',
    pregnancyConfirmed: false,
    pregnancyConfirmationDate: '',
    pregnancyMethod: '' as const,
    offspringCount: 0,
    breedingNotes: '',
    veterinarian: '',
    cost: '',
    status: 'planned' as const
  });

  const [motherSpecies, setMotherSpecies] = useState<string>('');

  const { data: animals = [] } = useQuery({
    queryKey: ['animals'],
    queryFn: getAllAnimals
  });

  const createMutation = useMutation({
    mutationFn: createBreedingRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeding-records'] });
      toast({
        title: "Registro Creado",
        description: "El registro de apareamiento ha sido creado exitosamente.",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error('Error creating breeding record:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el registro de apareamiento.",
        variant: "destructive"
      });
    }
  });

  // Update mother species when mother is selected
  useEffect(() => {
    if (formData.motherId) {
      const selectedMother = animals.find(animal => animal.id === formData.motherId);
      if (selectedMother?.species) {
        setMotherSpecies(selectedMother.species);
      }
    } else {
      setMotherSpecies('');
    }
  }, [formData.motherId, animals]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.motherId || !formData.fatherId || !formData.breedingDate) {
      toast({
        title: "Error",
        description: "Por favor complete los campos requeridos (Madre, Padre, Fecha de Apareamiento).",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const submitForm = () => {
    if (!validateForm()) return;

    const submitData = {
      motherId: formData.motherId,
      fatherId: formData.fatherId,
      breedingDate: formData.breedingDate,
      breedingMethod: formData.breedingMethod,
      actualBirthDate: formData.actualBirthDate || undefined,
      pregnancyConfirmed: formData.pregnancyConfirmed,
      pregnancyConfirmationDate: formData.pregnancyConfirmationDate || undefined,
      pregnancyMethod: formData.pregnancyMethod || undefined,
      offspringCount: formData.offspringCount,
      breedingNotes: formData.breedingNotes || undefined,
      veterinarian: formData.veterinarian || undefined,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      status: formData.status
    };

    createMutation.mutate(submitData);
  };

  return {
    formData,
    animals,
    motherSpecies,
    createMutation,
    handleInputChange,
    submitForm
  };
};
