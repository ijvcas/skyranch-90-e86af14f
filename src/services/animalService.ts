
import { supabase } from '@/integrations/supabase/client';
import type { Animal } from '@/stores/animalStore';
import { transformAnimalData } from './utils/animalDataTransform';
import { mapAnimalToDatabase, createUpdateObject } from './utils/animalDatabaseMapper';
import { processParentId, getAnimalNameById } from './utils/animalParentProcessor';

export const getAllAnimals = async (): Promise<Animal[]> => {
  console.log('🔍 Fetching all animals...');
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching animals:', error);
    throw error;
  }

  console.log(`✅ Fetched ${data?.length || 0} animals`);
  return (data || []).map(transformAnimalData);
};

export const getAnimal = async (id: string): Promise<Animal | null> => {
  console.log('🔍 Fetching animal by ID:', id);
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('❌ Error fetching animal:', error);
    throw error;
  }

  if (!data) {
    console.log('❌ Animal not found');
    return null;
  }

  console.log('✅ Animal fetched successfully');
  return transformAnimalData(data);
};

export const addAnimal = async (animal: Omit<Animal, 'id'>): Promise<boolean> => {
  console.log('🔄 Adding new animal:', animal);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('❌ No authenticated user');
    return false;
  }

  // Process parent and grandparent IDs
  console.log('🔄 Processing parent relationships...');
  const [motherId, fatherId, maternalGrandmotherId, maternalGrandfatherId, paternalGrandmotherId, paternalGrandfatherId] = await Promise.all([
    processParentId(animal.motherId),
    processParentId(animal.fatherId),
    processParentId(animal.maternalGrandmotherId),
    processParentId(animal.maternalGrandfatherId),
    processParentId(animal.paternalGrandmotherId),
    processParentId(animal.paternalGrandfatherId)
  ]);

  console.log('🔄 Processed parent IDs:', {
    motherId,
    fatherId,
    maternalGrandmotherId,
    maternalGrandfatherId,
    paternalGrandmotherId,
    paternalGrandfatherId
  });

  const databaseData = {
    ...mapAnimalToDatabase(animal, user.id),
    mother_id: motherId,
    father_id: fatherId,
    maternal_grandmother_id: maternalGrandmotherId,
    maternal_grandfather_id: maternalGrandfatherId,
    paternal_grandmother_id: paternalGrandmotherId,
    paternal_grandfather_id: paternalGrandfatherId,
  };

  console.log('🔄 Final database data:', databaseData);

  const { error } = await supabase
    .from('animals')
    .insert(databaseData);

  if (error) {
    console.error('❌ Error adding animal:', error);
    return false;
  }

  console.log('✅ Animal added successfully');
  return true;
};

export const updateAnimal = async (id: string, animal: Omit<Animal, 'id'>): Promise<boolean> => {
  console.log('🔄 Updating animal with ID:', id, 'Data:', animal);

  // Process parent and grandparent IDs
  console.log('🔄 Processing parent relationships for update...');
  const [motherId, fatherId, maternalGrandmotherId, maternalGrandfatherId, paternalGrandmotherId, paternalGrandfatherId] = await Promise.all([
    processParentId(animal.motherId),
    processParentId(animal.fatherId),
    processParentId(animal.maternalGrandmotherId),
    processParentId(animal.maternalGrandfatherId),
    processParentId(animal.paternalGrandmotherId),
    processParentId(animal.paternalGrandfatherId)
  ]);

  console.log('🔄 Processed parent IDs for update:', {
    motherId,
    fatherId,
    maternalGrandmotherId,
    maternalGrandfatherId,
    paternalGrandmotherId,
    paternalGrandfatherId
  });

  const updateData = {
    ...createUpdateObject(animal),
    mother_id: motherId,
    father_id: fatherId,
    maternal_grandmother_id: maternalGrandmotherId,
    maternal_grandfather_id: maternalGrandfatherId,
    paternal_grandmother_id: paternalGrandmotherId,
    paternal_grandfather_id: paternalGrandfatherId,
  };

  console.log('🔄 Final update data:', updateData);

  const { error } = await supabase
    .from('animals')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('❌ Error updating animal:', error);
    return false;
  }

  console.log('✅ Animal updated successfully');
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
