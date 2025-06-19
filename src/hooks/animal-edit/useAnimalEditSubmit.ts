
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { updateAnimal } from '@/services/animal';

export const useAnimalEditSubmit = (id: string, formData: any, navigate: any) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return {
    updateMutation,
    handleSubmit
  };
};
