import { supabase } from '@/integrations/supabase/client';
import type { Animal } from '@/stores/animalStore';
import { transformAnimalData } from './utils/animalDataTransform';
import { processParentId, getAnimalNameById } from './utils/animalParentProcessor';
import { mapAnimalToDatabase, createUpdateObject } from './utils/animalDatabaseMapper';

export const getAllAnimals = async (): Promise<Animal[]> => {
  try {
    console.log('Fetching all animals...');
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching animals:', error);
      throw error;
    }

    console.log('Raw animals data:', data);
    const animals = (data || []).map(transformAnimalData);
    console.log('Transformed animals:', animals);
    return animals;
  } catch (error) {
    console.error('Failed to fetch animals:', error);
    return [];
  }
};

export const getAnimal = async (id: string): Promise<Animal | null> => {
  try {
    console.log(`Fetching animal with ID: ${id}`);
    
    if (!id) {
      console.error('No ID provided to getAnimal');
      return null;
    }

    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching animal:', error);
      if (error.code === 'PGRST116') {
        console.log('Animal not found');
        return null;
      }
      throw error;
    }

    if (!data) {
      console.log('No data returned for animal');
      return null;
    }

    console.log('Raw animal data from database:', data);
    const transformedAnimal = transformAnimalData(data);
    console.log('Transformed animal data:', transformedAnimal);
    return transformedAnimal;
  } catch (error) {
    console.error('Failed to fetch animal:', error);
    return null;
  }
};

export const getAnimalByNameOrTag = async (searchTerm: string): Promise<Animal | null> => {
  if (!searchTerm || searchTerm.trim() === '') return null;
  
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,tag.ilike.%${searchTerm}%`)
    .limit(1);
    
  if (error || !data || data.length === 0) {
    return null;
  }
  
  return transformAnimalData(data[0]);
};

export const addAnimal = async (animal: Omit<Animal, 'id'>): Promise<{ success: boolean; id?: string }> => {
  try {
    console.log('Adding animal:', animal);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user');
      return { success: false };
    }

    // Process all parent IDs - convert names/tags to UUIDs
    console.log('Processing parent IDs for new animal...');
    console.log('Raw parent inputs:', {
      motherId: animal.motherId,
      fatherId: animal.fatherId,
      maternalGrandmotherId: animal.maternalGrandmotherId,
      maternalGrandfatherId: animal.maternalGrandfatherId,
      paternalGrandmotherId: animal.paternalGrandmotherId,
      paternalGrandfatherId: animal.paternalGrandfatherId
    });

    const [
      motherIdToSave,
      fatherIdToSave,
      maternalGrandmotherIdToSave,
      maternalGrandfatherIdToSave,
      paternalGrandmotherIdToSave,
      paternalGrandfatherIdToSave
    ] = await Promise.all([
      processParentId(animal.motherId),
      processParentId(animal.fatherId),
      processParentId(animal.maternalGrandmotherId),
      processParentId(animal.maternalGrandfatherId),
      processParentId(animal.paternalGrandmotherId),
      processParentId(animal.paternalGrandfatherId)
    ]);

    console.log('Processed parent IDs for saving:', { 
      motherId: motherIdToSave, 
      fatherId: fatherIdToSave,
      maternalGrandmotherId: maternalGrandmotherIdToSave,
      maternalGrandfatherId: maternalGrandfatherIdToSave,
      paternalGrandmotherId: paternalGrandmotherIdToSave,
      paternalGrandfatherId: paternalGrandfatherIdToSave
    });

    const animalData = {
      ...mapAnimalToDatabase(animal, user.id),
      mother_id: motherIdToSave,
      father_id: fatherIdToSave,
      maternal_grandmother_id: maternalGrandmotherIdToSave,
      maternal_grandfather_id: maternalGrandfatherIdToSave,
      paternal_grandmother_id: paternalGrandmotherIdToSave,
      paternal_grandfather_id: paternalGrandfatherIdToSave,
    };

    console.log('Final animal data to save:', animalData);

    const { data, error } = await supabase
      .from('animals')
      .insert(animalData)
      .select()
      .single();

    if (error) {
      console.error('Error adding animal:', error);
      return { success: false };
    }

    console.log('Animal added successfully:', data);
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Failed to add animal:', error);
    return { success: false };
  }
};

export const updateAnimal = async (id: string, animal: Omit<Animal, 'id'>): Promise<boolean> => {
  try {
    console.log('Updating animal:', { id, animal });
    
    // Process all parent IDs - convert names/tags to UUIDs
    console.log('Processing parent IDs for update...');
    console.log('Raw parent inputs for update:', {
      motherId: animal.motherId,
      fatherId: animal.fatherId,
      maternalGrandmotherId: animal.maternalGrandmotherId,
      maternalGrandfatherId: animal.maternalGrandfatherId,
      paternalGrandmotherId: animal.paternalGrandmotherId,
      paternalGrandfatherId: animal.paternalGrandfatherId
    });

    const [
      motherIdToSave,
      fatherIdToSave,
      maternalGrandmotherIdToSave,
      maternalGrandfatherIdToSave,
      paternalGrandmotherIdToSave,
      paternalGrandfatherIdToSave
    ] = await Promise.all([
      processParentId(animal.motherId),
      processParentId(animal.fatherId),
      processParentId(animal.maternalGrandmotherId),
      processParentId(animal.maternalGrandfatherId),
      processParentId(animal.paternalGrandmotherId),
      processParentId(animal.paternalGrandfatherId)
    ]);

    console.log('Processed parent IDs for update:', { 
      animalId: id,
      motherId: motherIdToSave, 
      fatherId: fatherIdToSave,
      maternalGrandmotherId: maternalGrandmotherIdToSave,
      maternalGrandfatherId: maternalGrandfatherIdToSave,
      paternalGrandmotherId: paternalGrandmotherIdToSave,
      paternalGrandfatherId: paternalGrandfatherIdToSave
    });

    const updateData = {
      ...createUpdateObject(animal),
      mother_id: motherIdToSave,
      father_id: fatherIdToSave,
      maternal_grandmother_id: maternalGrandmotherIdToSave,
      maternal_grandfather_id: maternalGrandfatherIdToSave,
      paternal_grandmother_id: paternalGrandmotherIdToSave,
      paternal_grandfather_id: paternalGrandfatherIdToSave,
    };

    console.log('Final update data to save:', updateData);

    const { error } = await supabase
      .from('animals')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating animal:', error);
      return false;
    }

    console.log('Animal updated successfully');
    return true;
  } catch (error) {
    console.error('Failed to update animal:', error);
    return false;
  }
};

export const deleteAnimal = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting animal:', id);
    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting animal:', error);
      return false;
    }

    console.log('Animal deleted successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete animal:', error);
    return false;
  }
};

// Helper function to get animal names for form display
export const getAnimalDisplayName = async (animalId: string): Promise<string> => {
  return await getAnimalNameById(animalId);
};

// Export Animal interface for use in other files
export type { Animal } from '@/stores/animalStore';
