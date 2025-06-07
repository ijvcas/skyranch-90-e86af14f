import { supabase } from '@/integrations/supabase/client';
import type { Animal } from '@/stores/animalStore';
import { transformAnimalData } from './utils/animalDataTransform';
import { mapAnimalToDatabase, createUpdateObject } from './utils/animalDatabaseMapper';
import { processParentId, getAnimalNameById } from './utils/animalParentProcessor';

export const getAllAnimals = async (): Promise<Animal[]> => {
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching animals:', error);
    throw error;
  }

  return (data || []).map(transformAnimalData);
};

export const getAnimal = async (id: string): Promise<Animal | null> => {
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching animal:', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  return transformAnimalData(data);
};

export const addAnimal = async (animal: Omit<Animal, 'id'>): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user');
    return false;
  }

  // Process parent and grandparent IDs concurrently for better performance
  const [motherId, fatherId, maternalGrandmotherId, maternalGrandfatherId, paternalGrandmotherId, paternalGrandfatherId] = await Promise.all([
    processParentId(animal.motherId),
    processParentId(animal.fatherId),
    processParentId(animal.maternalGrandmotherId),
    processParentId(animal.maternalGrandfatherId),
    processParentId(animal.paternalGrandmotherId),
    processParentId(animal.paternalGrandfatherId)
  ]);

  const databaseData = {
    ...mapAnimalToDatabase(animal, user.id),
    mother_id: motherId,
    father_id: fatherId,
    maternal_grandmother_id: maternalGrandmotherId,
    maternal_grandfather_id: maternalGrandfatherId,
    paternal_grandmother_id: paternalGrandmotherId,
    paternal_grandfather_id: paternalGrandfatherId,
  };

  const { error } = await supabase
    .from('animals')
    .insert(databaseData);

  if (error) {
    console.error('Error adding animal:', error);
    return false;
  }

  return true;
};

export const updateAnimal = async (id: string, animal: Omit<Animal, 'id'>): Promise<boolean> => {
  // Process parent and grandparent IDs concurrently for better performance
  const [motherId, fatherId, maternalGrandmotherId, maternalGrandfatherId, paternalGrandmotherId, paternalGrandfatherId] = await Promise.all([
    processParentId(animal.motherId),
    processParentId(animal.fatherId),
    processParentId(animal.maternalGrandmotherId),
    processParentId(animal.maternalGrandfatherId),
    processParentId(animal.paternalGrandmotherId),
    processParentId(animal.paternalGrandfatherId)
  ]);

  const updateData = {
    ...createUpdateObject(animal),
    mother_id: motherId,
    father_id: fatherId,
    maternal_grandmother_id: maternalGrandmotherId,
    maternal_grandfather_id: maternalGrandfatherId,
    paternal_grandmother_id: paternalGrandmotherId,
    paternal_grandfather_id: paternalGrandfatherId,
  };

  const { error } = await supabase
    .from('animals')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating animal:', error);
    return false;
  }

  return true;
};

export const deleteAnimal = async (id: string): Promise<boolean> => {
  console.log('🔄 Deleting animal with ID:', id);
  
  const { error } = await supabase
    .from('animals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('❌ Error deleting animal:', error);
    return false;
  }

  console.log('✅ Animal deleted successfully');
  return true;
};

export const getAnimalCounts = async () => {
  console.log('🔍 Fetching animal counts...');
  const { data, error } = await supabase
    .from('animals')
    .select('species, gender, health_status');

  if (error) {
    console.error('❌ Error fetching animal counts:', error);
    throw error;
  }

  console.log('✅ Animal counts fetched successfully');
  return data || [];
};

// Helper function to get animal display name (for edit forms)
export const getAnimalDisplayName = async (animalId: string): Promise<string> => {
  console.log('🔍 Getting display name for animal ID:', animalId);
  return await getAnimalNameById(animalId);
};
