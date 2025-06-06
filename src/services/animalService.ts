
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
    .maybeSingle();
    
  if (error) {
    console.error(`Error searching for animal: ${error.message}`);
    return null;
  }
  
  if (!data) {
    console.log(`No animal found for search term: ${searchTerm}`);
    return null;
  }
  
  console.log(`Found animal:`, data);
  return data.id;
};

export const getAllAnimals = async (): Promise<Animal[]> => {
  try {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching animals:', error);
      throw error;
    }

    // Transform Supabase data to match our Animal interface
    return (data || []).map(animal => ({
      id: animal.id,
      name: animal.name || '',
      tag: animal.tag || '',
      species: animal.species || 'bovino',
      breed: animal.breed || '',
      birthDate: animal.birth_date || '',
      gender: animal.gender || '',
      weight: animal.weight ? animal.weight.toString() : '',
      color: animal.color || '',
      motherId: animal.mother_id || '',
      fatherId: animal.father_id || '',
      healthStatus: animal.health_status || 'healthy',
      notes: animal.notes || '',
      image: animal.image_url || null,
    }));
  } catch (error) {
    console.error('Failed to fetch animals:', error);
    return [];
  }
};

export const getAnimal = async (id: string): Promise<Animal | null> => {
  try {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching animal:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
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
    };
  } catch (error) {
    console.error('Failed to fetch animal:', error);
    return null;
  }
};

export const addAnimal = async (animal: Omit<Animal, 'id'>): Promise<{ success: boolean; id?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user');
      return { success: false };
    }

    // Process parent IDs: try to find by UUID first, then by name/tag
    let motherIdToSave = null;
    let fatherIdToSave = null;

    if (animal.motherId && animal.motherId.trim() !== '') {
      if (isValidUUID(animal.motherId)) {
        motherIdToSave = animal.motherId;
      } else {
        // Try to find by name or tag
        motherIdToSave = await findAnimalByNameOrTag(animal.motherId);
      }
    }

    if (animal.fatherId && animal.fatherId.trim() !== '') {
      if (isValidUUID(animal.fatherId)) {
        fatherIdToSave = animal.fatherId;
      } else {
        // Try to find by name or tag
        fatherIdToSave = await findAnimalByNameOrTag(animal.fatherId);
      }
    }

    console.log('Adding animal with processed parent IDs:', { 
      motherId: motherIdToSave, 
      fatherId: fatherIdToSave,
      originalMotherId: animal.motherId,
      originalFatherId: animal.fatherId
    });

    // Remove parent info from notes if it was accidentally included
    let cleanNotes = animal.notes || '';
    if (cleanNotes.includes('[Madre:') || cleanNotes.includes('[Padre:')) {
      cleanNotes = cleanNotes
        .replace(/\[Madre:.*?\]/g, '')
        .replace(/\[Padre:.*?\]/g, '')
        .trim();
    }

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
        health_status: animal.healthStatus,
        notes: cleanNotes,
        image_url: animal.image,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding animal:', error);
      return { success: false };
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Failed to add animal:', error);
    return { success: false };
  }
};

export const updateAnimal = async (id: string, animal: Omit<Animal, 'id'>): Promise<boolean> => {
  try {
    // Process parent IDs: try to find by UUID first, then by name/tag
    let motherIdToSave = null;
    let fatherIdToSave = null;

    if (animal.motherId && animal.motherId.trim() !== '') {
      if (isValidUUID(animal.motherId)) {
        motherIdToSave = animal.motherId;
      } else {
        // Try to find by name or tag
        motherIdToSave = await findAnimalByNameOrTag(animal.motherId);
      }
    }

    if (animal.fatherId && animal.fatherId.trim() !== '') {
      if (isValidUUID(animal.fatherId)) {
        fatherIdToSave = animal.fatherId;
      } else {
        // Try to find by name or tag
        fatherIdToSave = await findAnimalByNameOrTag(animal.fatherId);
      }
    }

    console.log('Updating animal with processed parent IDs:', { 
      animalId: id,
      motherId: motherIdToSave, 
      fatherId: fatherIdToSave,
      originalMotherId: animal.motherId,
      originalFatherId: animal.fatherId
    });

    // Remove parent info from notes if it was accidentally included
    let cleanNotes = animal.notes || '';
    if (cleanNotes.includes('[Madre:') || cleanNotes.includes('[Padre:')) {
      cleanNotes = cleanNotes
        .replace(/\[Madre:.*?\]/g, '')
        .replace(/\[Padre:.*?\]/g, '')
        .trim();
    }

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
        health_status: animal.healthStatus,
        notes: cleanNotes,
        image_url: animal.image,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating animal:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update animal:', error);
    return false;
  }
};

export const deleteAnimal = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting animal:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete animal:', error);
    return false;
  }
};

// Export Animal interface for use in other files
export type { Animal } from '@/stores/animalStore';
