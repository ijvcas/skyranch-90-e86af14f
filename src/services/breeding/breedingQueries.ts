
import { supabase } from '@/integrations/supabase/client';
import { BreedingRecord } from './types';

export const fetchBreedingRecords = async (): Promise<BreedingRecord[]> => {
  const { data, error } = await supabase
    .from('breeding_records')
    .select('*')
    .order('breeding_date', { ascending: false });

  if (error) {
    console.error('Error fetching breeding records:', error);
    throw error;
  }

  return (data || []).map(record => ({
    id: record.id,
    userId: record.user_id,
    motherId: record.mother_id,
    fatherId: record.father_id,
    breedingDate: record.breeding_date,
    breedingMethod: record.breeding_method,
    expectedDueDate: record.expected_due_date || undefined,
    actualBirthDate: record.actual_birth_date || undefined,
    pregnancyConfirmed: record.pregnancy_confirmed,
    pregnancyConfirmationDate: record.pregnancy_confirmation_date || undefined,
    pregnancyMethod: record.pregnancy_method || undefined,
    offspringCount: record.offspring_count,
    breedingNotes: record.breeding_notes || undefined,
    veterinarian: record.veterinarian || undefined,
    cost: record.cost || undefined,
    status: record.status,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  })) as BreedingRecord[];
};

export const fetchBreedingRecordById = async (id: string): Promise<BreedingRecord | null> => {
  const { data, error } = await supabase
    .from('breeding_records')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching breeding record:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    motherId: data.mother_id,
    fatherId: data.father_id,
    breedingDate: data.breeding_date,
    breedingMethod: data.breeding_method,
    expectedDueDate: data.expected_due_date || undefined,
    actualBirthDate: data.actual_birth_date || undefined,
    pregnancyConfirmed: data.pregnancy_confirmed,
    pregnancyConfirmationDate: data.pregnancy_confirmation_date || undefined,
    pregnancyMethod: data.pregnancy_method || undefined,
    offspringCount: data.offspring_count,
    breedingNotes: data.breeding_notes || undefined,
    veterinarian: data.veterinarian || undefined,
    cost: data.cost || undefined,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  } as BreedingRecord;
};
