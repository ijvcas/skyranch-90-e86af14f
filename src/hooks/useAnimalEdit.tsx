
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
    // New great-grandparent fields
    maternalGreatGrandmotherMaternalId: '',
    maternalGreatGrandfatherMaternalId: '',
    maternalGreatGrandmotherPaternalId: '',
    maternalGreatGrandfatherPaternalId: '',
    paternalGreatGrandmotherMaternalId: '',
    paternalGreatGrandfatherMaternalId: '',
    paternalGreatGrandmotherPaternalId: '',
    paternalGreatGrandfatherPaternalId: '',
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
        
        // Helper function to safely load display names
        const loadDisplayName = async (parentId: string | null | undefined): Promise<string> => {
          if (!parentId || parentId.trim() === '') {
            return '';
          }
          try {
            const displayName = await getAnimalDisplayName(parentId);
            return displayName || '';
          } catch (error) {
            console.error('Error loading display name for', parentId, error);
            return '';
          }
        };

        // Load all parent and great-grandparent display names
        let motherDisplayName = '';
        let fatherDisplayName = '';
        let maternalGrandmotherDisplayName = '';
        let maternalGrandfatherDisplayName = '';
        let paternalGrandmotherDisplayName = '';
        let paternalGrandfatherDisplayName = '';
        let maternalGreatGrandmotherMaternalDisplayName = '';
        let maternalGreatGrandfatherMaternalDisplayName = '';
        let maternalGreatGrandmotherPaternalDisplayName = '';
        let maternalGreatGrandfatherPaternalDisplayName = '';
        let paternalGreatGrandmotherMaternalDisplayName = '';
        let paternalGreatGrandfatherMaternalDisplayName = '';
        let paternalGreatGrandmotherPaternalDisplayName = '';
        let paternalGreatGrandfatherPaternalDisplayName = '';

        try {
          [
            motherDisplayName,
            fatherDisplayName,
            maternalGrandmotherDisplayName,
            maternalGrandfatherDisplayName,
            paternalGrandmotherDisplayName,
            paternalGrandfatherDisplayName,
            maternalGreatGrandmotherMaternalDisplayName,
            maternalGreatGrandfatherMaternalDisplayName,
            maternalGreatGrandmotherPaternalDisplayName,
            maternalGreatGrandfatherPaternalDisplayName,
            paternalGreatGrandmotherMaternalDisplayName,
            paternalGreatGrandfatherMaternalDisplayName,
            paternalGreatGrandmotherPaternalDisplayName,
            paternalGreatGrandfatherPaternalDisplayName
          ] = await Promise.all([
            loadDisplayName(animal.motherId),
            loadDisplayName(animal.fatherId),
            loadDisplayName(animal.maternalGrandmotherId),
            loadDisplayName(animal.maternalGrandfatherId),
            loadDisplayName(animal.paternalGrandmotherId),
            loadDisplayName(animal.paternalGrandfatherId),
            loadDisplayName(animal.maternalGreatGrandmotherMaternalId),
            loadDisplayName(animal.maternalGreatGrandfatherMaternalId),
            loadDisplayName(animal.maternalGreatGrandmotherPaternalId),
            loadDisplayName(animal.maternalGreatGrandfatherPaternalId),
            loadDisplayName(animal.paternalGreatGrandmotherMaternalId),
            loadDisplayName(animal.paternalGreatGrandfatherMaternalId),
            loadDisplayName(animal.paternalGreatGrandmotherPaternalId),
            loadDisplayName(animal.paternalGreatGrandfatherPaternalId)
          ]);
        } catch (error) {
          console.error('Error loading ancestor display names:', error);
        }

        console.log('🔍 Loaded all ancestor display names:', {
          mother: motherDisplayName,
          father: fatherDisplayName,
          maternalGrandmother: maternalGrandmotherDisplayName,
          maternalGrandfather: maternalGrandfatherDisplayName,
          paternalGrandmother: paternalGrandmotherDisplayName,
          paternalGrandfather: paternalGrandfatherDisplayName,
          maternalGreatGrandmotherMaternal: maternalGreatGrandmotherMaternalDisplayName,
          maternalGreatGrandfatherMaternal: maternalGreatGrandfatherMaternalDisplayName,
          maternalGreatGrandmotherPaternal: maternalGreatGrandmotherPaternalDisplayName,
          maternalGreatGrandfatherPaternal: maternalGreatGrandfatherPaternalDisplayName,
          paternalGreatGrandmotherMaternal: paternalGreatGrandmotherMaternalDisplayName,
          paternalGreatGrandfatherMaternal: paternalGreatGrandfatherMaternalDisplayName,
          paternalGreatGrandmotherPaternal: paternalGreatGrandmotherPaternalDisplayName,
          paternalGreatGrandfatherPaternal: paternalGreatGrandfatherPaternalDisplayName
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
          motherId: motherDisplayName,
          fatherId: fatherDisplayName,
          maternalGrandmotherId: maternalGrandmotherDisplayName,
          maternalGrandfatherId: maternalGrandfatherDisplayName,
          paternalGrandmotherId: paternalGrandmotherDisplayName,
          paternalGrandfatherId: paternalGrandfatherDisplayName,
          maternalGreatGrandmotherMaternalId: maternalGreatGrandmotherMaternalDisplayName,
          maternalGreatGrandfatherMaternalId: maternalGreatGrandfatherMaternalDisplayName,
          maternalGreatGrandmotherPaternalId: maternalGreatGrandmotherPaternalDisplayName,
          maternalGreatGrandfatherPaternalId: maternalGreatGrandfatherPaternalDisplayName,
          paternalGreatGrandmotherMaternalId: paternalGreatGrandmotherMaternalDisplayName,
          paternalGreatGrandfatherMaternalId: paternalGreatGrandfatherMaternalDisplayName,
          paternalGreatGrandmotherPaternalId: paternalGreatGrandmotherPaternalDisplayName,
          paternalGreatGrandfatherPaternalId: paternalGreatGrandfatherPaternalDisplayName,
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
    
    // Ensure we're sending all parent data correctly including great-grandparents
    const submitData = {
      ...formData,
      motherId: formData.motherId || '',
      fatherId: formData.fatherId || '',
      maternalGrandmotherId: formData.maternalGrandmotherId || '',
      maternalGrandfatherId: formData.maternalGrandfatherId || '',
      paternalGrandmotherId: formData.paternalGrandmotherId || '',
      paternalGrandfatherId: formData.paternalGrandfatherId || '',
      maternalGreatGrandmotherMaternalId: formData.maternalGreatGrandmotherMaternalId || '',
      maternalGreatGrandfatherMaternalId: formData.maternalGreatGrandfatherMaternalId || '',
      maternalGreatGrandmotherPaternalId: formData.maternalGreatGrandmotherPaternalId || '',
      maternalGreatGrandfatherPaternalId: formData.maternalGreatGrandfatherPaternalId || '',
      paternalGreatGrandmotherMaternalId: formData.paternalGreatGrandmotherMaternalId || '',
      paternalGreatGrandfatherMaternalId: formData.paternalGreatGrandfatherMaternalId || '',
      paternalGreatGrandmotherPaternalId: formData.paternalGreatGrandmotherPaternalId || '',
      paternalGreatGrandfatherPaternalId: formData.paternalGreatGrandfatherPaternalId || ''
    };
    
    console.log('🔄 Final submit data:', submitData);
    
    updateMutation.mutate({ 
      id, 
      data: submitData 
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
