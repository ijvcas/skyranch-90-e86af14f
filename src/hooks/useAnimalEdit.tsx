
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAnimal, updateAnimal, getAnimalDisplayName } from '@/services/animalService';

export const useAnimalEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    species: '',
    breed: '',
    birthDate: '',
    gender: '',
    weight: '',
    color: '',
    motherId: '',
    fatherId: '',
    maternalGrandmotherId: '',
    maternalGrandfatherId: '',
    paternalGrandmotherId: '',
    paternalGrandfatherId: '',
    notes: '',
    healthStatus: 'healthy',
    image: null as string | null
  });

  // Fetch animal data
  const { data: animal, isLoading: isLoadingAnimal, error } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => getAnimal(id!),
    enabled: !!id
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateAnimal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['animal', id] });
      toast({
        title: "Animal Actualizado",
        description: `${formData.name} ha sido actualizado exitosamente.`,
      });
      navigate('/animals');
    },
    onError: (error) => {
      console.error('Error updating animal:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el animal.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    const loadAnimalData = async () => {
      if (animal) {
        console.log('🔍 Loading animal data for editing:', animal);
        
        // Load display names for all parent fields that have IDs - handle null values properly
        const parentIds = {
          motherId: animal.motherId,
          fatherId: animal.fatherId,
          maternalGrandmotherId: animal.maternalGrandmotherId,
          maternalGrandfatherId: animal.maternalGrandfatherId,
          paternalGrandmotherId: animal.paternalGrandmotherId,
          paternalGrandfatherId: animal.paternalGrandfatherId
        };

        console.log('🔍 Parent IDs from database:', parentIds);

        const [
          motherDisplayName,
          fatherDisplayName,
          maternalGrandmotherDisplayName,
          maternalGrandfatherDisplayName,
          paternalGrandmotherDisplayName,
          paternalGrandfatherDisplayName
        ] = await Promise.all([
          parentIds.motherId ? getAnimalDisplayName(parentIds.motherId) : Promise.resolve(''),
          parentIds.fatherId ? getAnimalDisplayName(parentIds.fatherId) : Promise.resolve(''),
          parentIds.maternalGrandmotherId ? getAnimalDisplayName(parentIds.maternalGrandmotherId) : Promise.resolve(''),
          parentIds.maternalGrandfatherId ? getAnimalDisplayName(parentIds.maternalGrandfatherId) : Promise.resolve(''),
          parentIds.paternalGrandmotherId ? getAnimalDisplayName(parentIds.paternalGrandmotherId) : Promise.resolve(''),
          parentIds.paternalGrandfatherId ? getAnimalDisplayName(parentIds.paternalGrandfatherId) : Promise.resolve('')
        ]);

        console.log('🔍 Loaded display names:', {
          mother: motherDisplayName,
          father: fatherDisplayName,
          maternalGrandmother: maternalGrandmotherDisplayName,
          maternalGrandfather: maternalGrandfatherDisplayName,
          paternalGrandmother: paternalGrandmotherDisplayName,
          paternalGrandfather: paternalGrandfatherDisplayName
        });
        
        const newFormData = {
          name: animal.name || '',
          tag: animal.tag || '',
          species: animal.species || '',
          breed: animal.breed || '',
          birthDate: animal.birthDate || '',
          gender: animal.gender || '',
          weight: animal.weight?.toString() || '',
          color: animal.color || '',
          motherId: motherDisplayName || '',
          fatherId: fatherDisplayName || '',
          maternalGrandmotherId: maternalGrandmotherDisplayName || '',
          maternalGrandfatherId: maternalGrandfatherDisplayName || '',
          paternalGrandmotherId: paternalGrandmotherDisplayName || '',
          paternalGrandfatherId: paternalGrandfatherDisplayName || '',
          notes: animal.notes || '',
          healthStatus: animal.healthStatus || 'healthy',
          image: animal.image
        };

        console.log('🔍 Setting form data:', newFormData);
        setFormData(newFormData);
      }
    };

    loadAnimalData();
  }, [animal]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    console.log('🔄 Form data being submitted:', formData);
    
    updateMutation.mutate({ 
      id, 
      data: formData 
    });
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`🔄 Updating field ${field} with value:`, value);
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      console.log('🔄 Updated form data:', updated);
      return updated;
    });
  };

  const handleImageChange = (imageUrl: string | null) => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
  };

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
