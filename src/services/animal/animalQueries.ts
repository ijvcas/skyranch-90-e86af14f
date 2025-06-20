
import { supabase } from '@/integrations/supabase/client';
import type { Animal } from '@/stores/animalStore';

export const getAllAnimals = async (): Promise<Animal[]> => {
  try {
    console.log('🔍 Fetching all animals...');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ No authenticated user');
      return [];
    }

    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching animals:', error);
      return [];
    }

    console.log('✅ Successfully fetched animals:', data?.length || 0);
    
    return (data || []).map(animal => ({
      id: animal.id,
      name: animal.name,
      tag: animal.tag,
      species: animal.species,
      breed: animal.breed || '',
      birthDate: animal.birth_date || '',
      gender: animal.gender || '',
      weight: animal.weight?.toString() || '',
      color: animal.color || '',
      motherId: animal.mother_id || '',
      fatherId: animal.father_id || '',
      maternalGrandmotherId: animal.maternal_grandmother_id || '',
      maternalGrandfatherId: animal.maternal_grandfather_id || '',
      paternalGrandmotherId: animal.paternal_grandmother_id || '',
      paternalGrandfatherId: animal.paternal_grandfather_id || '',
      maternalGreatGrandmotherMaternalId: animal.maternal_great_grandmother_maternal_id || '',
      maternalGreatGrandfatherMaternalId: animal.maternal_great_grandfather_maternal_id || '',
      maternalGreatGrandmotherPaternalId: animal.maternal_great_grandmother_paternal_id || '',
      maternalGreatGrandfatherPaternalId: animal.maternal_great_grandfather_paternal_id || '',
      paternalGreatGrandmotherMaternalId: animal.paternal_great_grandmother_maternal_id || '',
      paternalGreatGrandfatherMaternalId: animal.paternal_great_grandfather_maternal_id || '',
      paternalGreatGrandmotherPaternalId: animal.paternal_great_grandmother_paternal_id || '',
      paternalGreatGrandfatherPaternalId: animal.paternal_great_grandfather_paternal_id || '',
      healthStatus: animal.health_status || 'healthy',
      notes: animal.notes || '',
      image: animal.image_url,
      current_lot_id: animal.current_lot_id
    }));
  } catch (error) {
    console.error('❌ Unexpected error in getAllAnimals:', error);
    return [];
  }
};

export const getAnimal = async (id: string): Promise<Animal | null> => {
  try {
    console.log('🔍 Fetching animal with ID:', id);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ No authenticated user for getAnimal');
      return null;
    }

    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('❌ Error fetching animal:', error);
      return null;
    }

    if (!data) {
      console.log('❌ No animal found with ID:', id);
      return null;
    }

    console.log('✅ Successfully fetched animal:', data.name);
    
    return {
      id: data.id,
      name: data.name,
      tag: data.tag,
      species: data.species,
      breed: data.breed || '',
      birthDate: data.birth_date || '',
      gender: data.gender || '',
      weight: data.weight?.toString() || '',
      color: data.color || '',
      motherId: data.mother_id || '',
      fatherId: data.father_id || '',
      maternalGrandmotherId: data.maternal_grandmother_id || '',
      maternalGrandfatherId: data.maternal_grandfather_id || '',
      paternalGrandmotherId: data.paternal_grandmother_id || '',
      paternalGrandfatherId: data.paternal_grandfather_id || '',
      maternalGreatGrandmotherMaternalId: data.maternal_great_grandmother_maternal_id || '',
      maternalGreatGrandfatherMaternalId: data.maternal_great_grandfather_maternal_id || '',
      maternalGreatGrandmotherPaternalId: data.maternal_great_grandmother_paternal_id || '',
      maternalGreatGrandfatherPaternalId: data.maternal_great_grandfather_paternal_id || '',
      paternalGreatGrandmotherMaternalId: data.paternal_great_grandmother_maternal_id || '',
      paternalGreatGrandfatherMaternalId: data.paternal_great_grandfather_maternal_id || '',
      paternalGreatGrandmotherPaternalId: data.paternal_great_grandmother_paternal_id || '',
      paternalGreatGrandfatherPaternalId: data.paternal_great_grandfather_paternal_id || '',
      healthStatus: data.health_status || 'healthy',
      notes: data.notes || '',
      image: data.image_url,
      current_lot_id: data.current_lot_id
    };
  } catch (error) {
    console.error('❌ Unexpected error in getAnimal:', error);
    return null;
  }
};
