import { supabase } from '@/integrations/supabase/client';
import type { Animal } from '@/stores/animalStore';

// Helper function to validate if a string is a valid UUID
const isValidUUID = (str: string): boolean => {
  if (!str || str.trim() === '') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Helper function to find animal by name or tag
const findAnimalByNameOrTag = async (searchTerm: string): Promise<string | null> => {
  if (!searchTerm || searchTerm.trim() === '') return null;
  
  console.log(`Searching for animal with term: "${searchTerm}"`);
  
  const { data, error } = await supabase
    .from('animals')
    .select('id, name, tag')
    .or(`name.ilike.%${searchTerm}%,tag.ilike.%${searchTerm}%`)
    .limit(1);
    
  if (error) {
    console.error(`Error searching for animal: ${error.message}`);
    return null;
  }
  
  if (!data || data.length === 0) {
    console.log(`No animal found for search term: ${searchTerm}`);
    return null;
  }
  
  console.log(`Found animal:`, data[0]);
  return data[0].id;
};

// Helper function to transform database row to Animal interface
const transformAnimalData = (data: any): Animal => {
  console.log('Transforming animal data:', data);
  
  const animal = {
    id: data.id,
    name: data.name || '',
    tag: data.tag || '',
    species: data.species || 'bovino',
    breed: data.breed || '',
    birthDate: data.birth_date || '',
    gender: data.gender || '',
    weight: data.weight ? data.weight.toString() : '',
    color: data.color || '',
    motherId: data.mother_id || '',
    fatherId: data.father_id || '',
    healthStatus: data.health_status || 'healthy',
    notes: data.notes || '',
    image: data.image_url || null,
    maternalGrandmotherId: data.maternal_grandmother_id || '',
    maternalGrandfatherId: data.maternal_grandfather_id || '',
    paternalGrandmotherId: data.paternal_grandmother_id || '',
    paternalGrandfatherId: data.paternal_grandfather_id || '',
  };

  console.log('Transformed animal:', animal);
  return animal;
};

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

    // Transform Supabase data to match our Animal interface
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

    console.log('Raw animal data:', data);
    return transformAnimalData(data);
  } catch (error) {
    console.error('Failed to fetch animal:', error);
    return null;
  }
};

// Get animal by name or tag for parent display
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

    // Process parent IDs: try to find by UUID first, then by name/tag
    const processParentId = async (parentInput: string): Promise<string | null> => {
      if (!parentInput || parentInput.trim() === '') return null;
      
      console.log(`Processing parent input: "${parentInput}"`);
      
      // If it's a valid UUID, use it directly
      if (isValidUUID(parentInput)) {
        console.log(`Using UUID directly: ${parentInput}`);
        return parentInput;
      }
      
      // Otherwise, search by name or tag
      const foundId = await findAnimalByNameOrTag(parentInput);
      console.log(`Searched for "${parentInput}", found ID: ${foundId}`);
      return foundId;
    };

    const motherIdToSave = await processParentId(animal.motherId);
    const fatherIdToSave = await processParentId(animal.fatherId);
    const maternalGrandmotherIdToSave = await processParentId(animal.maternalGrandmotherId || '');
    const maternalGrandfatherIdToSave = await processParentId(animal.maternalGrandfatherId || '');
    const paternalGrandmotherIdToSave = await processParentId(animal.paternalGrandmotherId || '');
    const paternalGrandfatherIdToSave = await processParentId(animal.paternalGrandfatherId || '');

    console.log('Final IDs to save:', { 
      motherId: motherIdToSave, 
      fatherId: fatherIdToSave,
      maternalGrandmotherId: maternalGrandmotherIdToSave,
      maternalGrandfatherId: maternalGrandfatherIdToSave,
      paternalGrandmotherId: paternalGrandmotherIdToSave,
      paternalGrandfatherId: paternalGrandfatherIdToSave
    });

    const { data, error } = await supabase
      .from('animals')
      .insert({
        name: animal.name,
        tag: animal.tag,
        species: animal.species,
        breed: animal.breed,
        birth_date: animal.birthDate || null,
        gender: animal.gender,
        weight: animal.weight ? parseFloat(animal.weight) : null,
        color: animal.color,
        mother_id: motherIdToSave,
        father_id: fatherIdToSave,
        maternal_grandmother_id: maternalGrandmotherIdToSave,
        maternal_grandfather_id: maternalGrandfatherIdToSave,
        paternal_grandmother_id: paternalGrandmotherIdToSave,
        paternal_grandfather_id: paternalGrandfatherIdToSave,
        health_status: animal.healthStatus,
        notes: animal.notes,
        image_url: animal.image,
        user_id: user.id,
      })
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
    
    // Process parent IDs: try to find by UUID first, then by name/tag
    const processParentId = async (parentInput: string): Promise<string | null> => {
      if (!parentInput || parentInput.trim() === '') return null;
      
      console.log(`Processing parent input: "${parentInput}"`);
      
      // If it's a valid UUID, use it directly
      if (isValidUUID(parentInput)) {
        console.log(`Using UUID directly: ${parentInput}`);
        return parentInput;
      }
      
      // Otherwise, search by name or tag
      const foundId = await findAnimalByNameOrTag(parentInput);
      console.log(`Searched for "${parentInput}", found ID: ${foundId}`);
      return foundId;
    };

    const motherIdToSave = await processParentId(animal.motherId);
    const fatherIdToSave = await processParentId(animal.fatherId);
    const maternalGrandmotherIdToSave = await processParentId(animal.maternalGrandmotherId || '');
    const maternalGrandfatherIdToSave = await processParentId(animal.maternalGrandfatherId || '');
    const paternalGrandmotherIdToSave = await processParentId(animal.paternalGrandmotherId || '');
    const paternalGrandfatherIdToSave = await processParentId(animal.paternalGrandfatherId || '');

    console.log('Final IDs to save:', { 
      animalId: id,
      motherId: motherIdToSave, 
      fatherId: fatherIdToSave,
      maternalGrandmotherId: maternalGrandmotherIdToSave,
      maternalGrandfatherId: maternalGrandfatherIdToSave,
      paternalGrandmotherId: paternalGrandmotherIdToSave,
      paternalGrandfatherId: paternalGrandfatherIdToSave
    });

    const { error } = await supabase
      .from('animals')
      .update({
        name: animal.name,
        tag: animal.tag,
        species: animal.species,
        breed: animal.breed,
        birth_date: animal.birthDate || null,
        gender: animal.gender,
        weight: animal.weight ? parseFloat(animal.weight) : null,
        color: animal.color,
        mother_id: motherIdToSave,
        father_id: fatherIdToSave,
        maternal_grandmother_id: maternalGrandmotherIdToSave,
        maternal_grandfather_id: maternalGrandfatherIdToSave,
        paternal_grandmother_id: paternalGrandmotherIdToSave,
        paternal_grandfather_id: paternalGrandfatherIdToSave,
        health_status: animal.healthStatus,
        notes: animal.notes,
        image_url: animal.image,
      })
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

// Export Animal interface for use in other files
export type { Animal } from '@/stores/animalStore';
