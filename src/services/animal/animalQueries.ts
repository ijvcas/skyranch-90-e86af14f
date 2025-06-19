
import { supabase } from '@/integrations/supabase/client';
import type { Animal } from '@/stores/animalStore';
import { transformAnimalData } from '../utils/animalDataTransform';

export const getAllAnimals = async (): Promise<Animal[]> => {
  try {
    console.log('🔍 Fetching all animals...');
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching animals:', error);
      return [];
    }

    console.log('✅ Successfully fetched animals:', data?.length || 0);
    return (data || []).map(transformAnimalData);
  } catch (error) {
    console.error('❌ Unexpected error in getAllAnimals:', error);
    return [];
  }
};

export const getAnimal = async (id: string): Promise<Animal | null> => {
  try {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching animal:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return transformAnimalData(data);
  } catch (error) {
    console.error('Unexpected error in getAnimal:', error);
    return null;
  }
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
