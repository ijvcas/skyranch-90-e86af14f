
import { supabase } from '@/integrations/supabase/client';

export interface Animal {
  id: string;
  name: string;
  tag: string;
  species: string;
  breed: string;
  birthDate: string;
  gender: string;
  weight: string;
  color: string;
  motherId: string;
  fatherId: string;
  notes: string;
  healthStatus: string;
  image: string | null;
  userId: string;
}

export const getAllAnimals = async (): Promise<Animal[]> => {
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching animals:', error);
    throw error;
  }

  // Map Supabase data to our Animal interface
  return (data || []).map(animal => ({
    id: animal.id,
    name: animal.name,
    tag: animal.tag,
    species: animal.species,
    breed: animal.breed || '',
    birthDate: animal.birth_date || '',
    gender: animal.gender || '',
    weight: animal.weight ? animal.weight.toString() : '',
    color: animal.color || '',
    motherId: animal.mother_id || '',
    fatherId: animal.father_id || '',
    notes: animal.notes || '',
    healthStatus: animal.health_status || 'healthy',
    image: animal.image_url,
    userId: animal.user_id
  }));
};

export const getAnimal = async (id: string): Promise<Animal | null> => {
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching animal:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    tag: data.tag,
    species: data.species,
    breed: data.breed || '',
    birthDate: data.birth_date || '',
    gender: data.gender || '',
    weight: data.weight ? data.weight.toString() : '',
    color: data.color || '',
    motherId: data.mother_id || '',
    fatherId: data.father_id || '',
    notes: data.notes || '',
    healthStatus: data.health_status || 'healthy',
    image: data.image_url,
    userId: data.user_id
  };
};

export const addAnimal = async (animal: Omit<Animal, 'id' | 'userId'>): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user');
    return false;
  }

  const { error } = await supabase
    .from('animals')
    .insert({
      name: animal.name,
      tag: animal.tag,
      species: animal.species,
      breed: animal.breed || null,
      birth_date: animal.birthDate || null,
      gender: animal.gender || null,
      weight: animal.weight ? parseFloat(animal.weight) : null,
      color: animal.color || null,
      mother_id: animal.motherId || null,
      father_id: animal.fatherId || null,
      notes: animal.notes || null,
      health_status: animal.healthStatus || 'healthy',
      image_url: animal.image,
      user_id: user.id
    });

  if (error) {
    console.error('Error adding animal:', error);
    return false;
  }

  return true;
};

export const updateAnimal = async (id: string, updatedData: Omit<Animal, 'id' | 'userId'>): Promise<boolean> => {
  const { error } = await supabase
    .from('animals')
    .update({
      name: updatedData.name,
      tag: updatedData.tag,
      species: updatedData.species,
      breed: updatedData.breed || null,
      birth_date: updatedData.birthDate || null,
      gender: updatedData.gender || null,
      weight: updatedData.weight ? parseFloat(updatedData.weight) : null,
      color: updatedData.color || null,
      mother_id: updatedData.motherId || null,
      father_id: updatedData.fatherId || null,
      notes: updatedData.notes || null,
      health_status: updatedData.healthStatus || 'healthy',
      image_url: updatedData.image,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating animal:', error);
    return false;
  }

  return true;
};

export const deleteAnimal = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('animals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting animal:', error);
    return false;
  }

  return true;
};

export const getAnimalCountBySpecies = async (): Promise<Record<string, number>> => {
  const animals = await getAllAnimals();
  const counts: Record<string, number> = {};
  animals.forEach(animal => {
    counts[animal.species] = (counts[animal.species] || 0) + 1;
  });
  return counts;
};
