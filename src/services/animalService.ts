
import { supabase } from '@/integrations/supabase/client';
import type { Animal } from '@/stores/animalStore';

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
        mother_id: animal.motherId || null,
        father_id: animal.fatherId || null,
        health_status: animal.healthStatus,
        notes: animal.notes,
        image_url: animal.image,
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
        mother_id: animal.motherId || null,
        father_id: animal.fatherId || null,
        health_status: animal.healthStatus,
        notes: animal.notes,
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
