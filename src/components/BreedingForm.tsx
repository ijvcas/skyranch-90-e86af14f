
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createBreedingRecord } from '@/services/breedingService';
import { getAllAnimals } from '@/services/animalService';
import BreedingBasicInfo from '@/components/breeding/BreedingBasicInfo';
import BreedingPregnancyInfo from '@/components/breeding/BreedingPregnancyInfo';
import BreedingAdditionalInfo from '@/components/breeding/BreedingAdditionalInfo';

interface BreedingFormProps {
  onSuccess: () => void;
}

const BreedingForm: React.FC<BreedingFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    motherId: '',
    fatherId: '',
    breedingDate: '',
    breedingMethod: 'natural' as const,
    actualBirthDate: '',
    pregnancyConfirmed: false,
    pregnancyConfirmationDate: '',
    pregnancyMethod: '' as 'visual' | 'ultrasound' | 'blood_test' | 'palpation' | '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.motherId || !formData.fatherId || !formData.breedingDate) {
      toast({
        title: "Error",
        description: "Por favor complete los campos requeridos (Madre, Padre, Fecha de Apareamiento).",
        variant: "destructive"
      });
      return;
    }

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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BreedingBasicInfo
        formData={formData}
        animals={animals}
        onInputChange={handleInputChange}
      />

      <BreedingPregnancyInfo
        formData={formData}
        motherSpecies={motherSpecies}
        onInputChange={handleInputChange}
      />

      <BreedingAdditionalInfo
        formData={formData}
        onInputChange={handleInputChange}
      />

      <div className="flex space-x-4">
        <Button
          type="submit"
          className="flex-1"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Guardando...' : 'Crear Registro'}
        </Button>
      </div>
    </form>
  );
};

export default BreedingForm;
