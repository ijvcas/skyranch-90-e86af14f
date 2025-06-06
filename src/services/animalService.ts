import { supabase } from '@/integrations/supabase/client';
import type { Animal } from '@/stores/animalStore';
import { transformAnimalData } from './utils/animalDataTransform';
import { processParentId, getAnimalNameById } from './utils/animalParentProcessor';

export const getAllAnimals = async (): Promise<Animal[]> => {
  try {
    console.log('🔍 Fetching all animals with optimized query...');
    
    // Set a custom timeout and optimize the query
    const { data, error } = await supabase
      .from('animals')
      .select(`
        id,
        name,
        tag,
        species,
        breed,
        birth_date,
        gender,
        weight,
        color,
        health_status,
        notes,
        image_url,
        mother_id,
        father_id,
        maternal_grandmother_id,
        maternal_grandfather_id,
        paternal_grandmother_id,
        paternal_grandfather_id,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(1000); // Add reasonable limit

    if (error) {
      console.error('❌ Error fetching animals:', error);
      throw error;
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} animals`);
    const animals = (data || []).map(transformAnimalData);
    console.log('✅ Transformed animals successfully');
    return animals;
  } catch (error) {
    console.error('❌ Failed to fetch animals:', error);
    // Return empty array instead of throwing to prevent app crashes
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
    console.log('🐄 === ADDING NEW ANIMAL ===');
    console.log('Animal name:', animal.name);
    console.log('Raw form data received:', animal);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ No authenticated user');
      return { success: false };
    }

    // Process all parent IDs with detailed logging
    console.log('🔄 Starting parent ID processing...');
    
    const motherId = await processParentId(animal.motherId);
    console.log('✅ Mother processed:', { input: animal.motherId, result: motherId });
    
    const fatherId = await processParentId(animal.fatherId);
    console.log('✅ Father processed:', { input: animal.fatherId, result: fatherId });
    
    const maternalGrandmotherId = await processParentId(animal.maternalGrandmotherId);
    console.log('✅ Maternal grandmother processed:', { input: animal.maternalGrandmotherId, result: maternalGrandmotherId });
    
    const maternalGrandfatherId = await processParentId(animal.maternalGrandfatherId);
    console.log('✅ Maternal grandfather processed:', { input: animal.maternalGrandfatherId, result: maternalGrandfatherId });
    
    const paternalGrandmotherId = await processParentId(animal.paternalGrandmotherId);
    console.log('✅ Paternal grandmother processed:', { input: animal.paternalGrandmotherId, result: paternalGrandmotherId });
    
    const paternalGrandfatherId = await processParentId(animal.paternalGrandfatherId);
    console.log('✅ Paternal grandfather processed:', { input: animal.paternalGrandfatherId, result: paternalGrandfatherId });

    // Create the database object with ALL fields including parent IDs
    const animalData = {
      // Basic animal data
      name: animal.name,
      tag: animal.tag,
      species: animal.species,
      breed: animal.breed,
      birth_date: animal.birthDate || null,
      gender: animal.gender,
      weight: animal.weight ? parseFloat(animal.weight) : null,
      color: animal.color,
      health_status: animal.healthStatus,
      notes: animal.notes,
      image_url: animal.image,
      user_id: user.id,
      // Parent IDs - CRITICAL: These must be included!
      mother_id: motherId,
      father_id: fatherId,
      maternal_grandmother_id: maternalGrandmotherId,
      maternal_grandfather_id: maternalGrandfatherId,
      paternal_grandmother_id: paternalGrandmotherId,
      paternal_grandfather_id: paternalGrandfatherId,
    };

    console.log('💾 Final data being saved to database:', animalData);

    const { data, error } = await supabase
      .from('animals')
      .insert(animalData)
      .select()
      .single();

    if (error) {
      console.error('❌ Database insert error:', error);
      return { success: false };
    }

    console.log('✅ Animal saved successfully with data:', data);
    
    // Verify the saved data includes parent IDs
    if (data) {
      console.log('🔍 Verification - Saved parent IDs:', {
        mother_id: data.mother_id,
        father_id: data.father_id,
        maternal_grandmother_id: data.maternal_grandmother_id,
        maternal_grandfather_id: data.maternal_grandfather_id,
        paternal_grandmother_id: data.paternal_grandmother_id,
        paternal_grandfather_id: data.paternal_grandfather_id
      });
    }
    
    return { success: true, id: data.id };
  } catch (error) {
    console.error('❌ Failed to add animal:', error);
    return { success: false };
  }
};

export const updateAnimal = async (id: string, animal: Omit<Animal, 'id'>): Promise<boolean> => {
  try {
    console.log('🔄 === UPDATING ANIMAL ===');
    console.log('Animal ID:', id, 'Name:', animal.name);
    console.log('Raw form data received for update:', animal);

    // Process all parent IDs with detailed logging
    console.log('🔄 Starting parent ID processing for update...');
    
    const motherId = await processParentId(animal.motherId);
    console.log('✅ Mother processed for update:', { input: animal.motherId, result: motherId });
    
    const fatherId = await processParentId(animal.fatherId);
    console.log('✅ Father processed for update:', { input: animal.fatherId, result: fatherId });
    
    const maternalGrandmotherId = await processParentId(animal.maternalGrandmotherId);
    console.log('✅ Maternal grandmother processed for update:', { input: animal.maternalGrandmotherId, result: maternalGrandmotherId });
    
    const maternalGrandfatherId = await processParentId(animal.maternalGrandfatherId);
    console.log('✅ Maternal grandfather processed for update:', { input: animal.maternalGrandfatherId, result: maternalGrandfatherId });
    
    const paternalGrandmotherId = await processParentId(animal.paternalGrandmotherId);
    console.log('✅ Paternal grandmother processed for update:', { input: animal.paternalGrandmotherId, result: paternalGrandmotherId });
    
    const paternalGrandfatherId = await processParentId(animal.paternalGrandfatherId);
    console.log('✅ Paternal grandfather processed for update:', { input: animal.paternalGrandfatherId, result: paternalGrandfatherId });

    // Create the update object with ALL fields including parent IDs
    const updateData = {
      // Basic animal data
      name: animal.name,
      tag: animal.tag,
      species: animal.species,
      breed: animal.breed,
      birth_date: animal.birthDate || null,
      gender: animal.gender,
      weight: animal.weight ? parseFloat(animal.weight) : null,
      color: animal.color,
      health_status: animal.healthStatus,
      notes: animal.notes,
      image_url: animal.image,
      // Parent IDs - CRITICAL: These must be included!
      mother_id: motherId,
      father_id: fatherId,
      maternal_grandmother_id: maternalGrandmotherId,
      maternal_grandfather_id: maternalGrandfatherId,
      paternal_grandmother_id: paternalGrandmotherId,
      paternal_grandfather_id: paternalGrandfatherId,
    };

    console.log('💾 Final update data being saved to database:', updateData);

    const { data, error } = await supabase
      .from('animals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Update error:', error);
      return false;
    }

    console.log('✅ Animal updated successfully with data:', data);
    
    // Verify the updated data includes parent IDs
    if (data) {
      console.log('🔍 Verification - Updated parent IDs:', {
        mother_id: data.mother_id,
        father_id: data.father_id,
        maternal_grandmother_id: data.maternal_grandmother_id,
        maternal_grandfather_id: data.maternal_grandfather_id,
        paternal_grandmother_id: data.paternal_grandmother_id,
        paternal_grandfather_id: data.paternal_grandfather_id
      });
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to update animal:', error);
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
