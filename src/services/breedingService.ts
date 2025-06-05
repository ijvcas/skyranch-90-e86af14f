
import { supabase } from '@/integrations/supabase/client';

export interface BreedingRecord {
  id: string;
  userId: string;
  motherId: string;
  fatherId: string;
  breedingDate: string;
  breedingMethod: 'natural' | 'artificial_insemination' | 'embryo_transfer';
  expectedDueDate?: string;
  actualBirthDate?: string;
  pregnancyConfirmed: boolean;
  pregnancyConfirmationDate?: string;
  pregnancyMethod?: 'visual' | 'ultrasound' | 'blood_test' | 'palpation';
  gestationLength?: number;
  offspringCount: number;
  breedingNotes?: string;
  veterinarian?: string;
  cost?: number;
  status: 'planned' | 'completed' | 'confirmed_pregnant' | 'not_pregnant' | 'birth_completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Offspring {
  id: string;
  breedingRecordId: string;
  animalId?: string;
  birthWeight?: number;
  birthStatus?: 'alive' | 'stillborn' | 'died_after_birth';
  gender?: 'macho' | 'hembra';
  notes?: string;
  createdAt: string;
}

export const getBreedingRecords = async (): Promise<BreedingRecord[]> => {
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
    breedingMethod: record.breeding_method as BreedingRecord['breedingMethod'],
    expectedDueDate: record.expected_due_date || undefined,
    actualBirthDate: record.actual_birth_date || undefined,
    pregnancyConfirmed: record.pregnancy_confirmed || false,
    pregnancyConfirmationDate: record.pregnancy_confirmation_date || undefined,
    pregnancyMethod: record.pregnancy_method as BreedingRecord['pregnancyMethod'] || undefined,
    gestationLength: record.gestation_length || undefined,
    offspringCount: record.offspring_count || 0,
    breedingNotes: record.breeding_notes || undefined,
    veterinarian: record.veterinarian || undefined,
    cost: record.cost || undefined,
    status: record.status as BreedingRecord['status'],
    createdAt: record.created_at,
    updatedAt: record.updated_at
  }));
};

export const addBreedingRecord = async (record: Omit<BreedingRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user');
    return false;
  }

  const { error } = await supabase
    .from('breeding_records')
    .insert({
      user_id: user.id,
      mother_id: record.motherId,
      father_id: record.fatherId,
      breeding_date: record.breedingDate,
      breeding_method: record.breedingMethod,
      expected_due_date: record.expectedDueDate || null,
      actual_birth_date: record.actualBirthDate || null,
      pregnancy_confirmed: record.pregnancyConfirmed,
      pregnancy_confirmation_date: record.pregnancyConfirmationDate || null,
      pregnancy_method: record.pregnancyMethod || null,
      gestation_length: record.gestationLength || null,
      offspring_count: record.offspringCount,
      breeding_notes: record.breedingNotes || null,
      veterinarian: record.veterinarian || null,
      cost: record.cost || null,
      status: record.status
    });

  if (error) {
    console.error('Error adding breeding record:', error);
    return false;
  }

  return true;
};

export const updateBreedingRecord = async (id: string, updatedData: Partial<Omit<BreedingRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<boolean> => {
  const { error } = await supabase
    .from('breeding_records')
    .update({
      ...(updatedData.motherId && { mother_id: updatedData.motherId }),
      ...(updatedData.fatherId && { father_id: updatedData.fatherId }),
      ...(updatedData.breedingDate && { breeding_date: updatedData.breedingDate }),
      ...(updatedData.breedingMethod && { breeding_method: updatedData.breedingMethod }),
      ...(updatedData.expectedDueDate !== undefined && { expected_due_date: updatedData.expectedDueDate || null }),
      ...(updatedData.actualBirthDate !== undefined && { actual_birth_date: updatedData.actualBirthDate || null }),
      ...(updatedData.pregnancyConfirmed !== undefined && { pregnancy_confirmed: updatedData.pregnancyConfirmed }),
      ...(updatedData.pregnancyConfirmationDate !== undefined && { pregnancy_confirmation_date: updatedData.pregnancyConfirmationDate || null }),
      ...(updatedData.pregnancyMethod !== undefined && { pregnancy_method: updatedData.pregnancyMethod || null }),
      ...(updatedData.gestationLength !== undefined && { gestation_length: updatedData.gestationLength || null }),
      ...(updatedData.offspringCount !== undefined && { offspring_count: updatedData.offspringCount }),
      ...(updatedData.breedingNotes !== undefined && { breeding_notes: updatedData.breedingNotes || null }),
      ...(updatedData.veterinarian !== undefined && { veterinarian: updatedData.veterinarian || null }),
      ...(updatedData.cost !== undefined && { cost: updatedData.cost || null }),
      ...(updatedData.status && { status: updatedData.status }),
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating breeding record:', error);
    return false;
  }

  return true;
};

export const deleteBreedingRecord = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('breeding_records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting breeding record:', error);
    return false;
  }

  return true;
};

export const getOffspring = async (breedingRecordId: string): Promise<Offspring[]> => {
  const { data, error } = await supabase
    .from('offspring')
    .select('*')
    .eq('breeding_record_id', breedingRecordId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching offspring:', error);
    throw error;
  }

  return (data || []).map(offspring => ({
    id: offspring.id,
    breedingRecordId: offspring.breeding_record_id,
    animalId: offspring.animal_id || undefined,
    birthWeight: offspring.birth_weight || undefined,
    birthStatus: offspring.birth_status as Offspring['birthStatus'] || undefined,
    gender: offspring.gender as Offspring['gender'] || undefined,
    notes: offspring.notes || undefined,
    createdAt: offspring.created_at
  }));
};

export const addOffspring = async (offspring: Omit<Offspring, 'id' | 'createdAt'>): Promise<boolean> => {
  const { error } = await supabase
    .from('offspring')
    .insert({
      breeding_record_id: offspring.breedingRecordId,
      animal_id: offspring.animalId || null,
      birth_weight: offspring.birthWeight || null,
      birth_status: offspring.birthStatus || null,
      gender: offspring.gender || null,
      notes: offspring.notes || null
    });

  if (error) {
    console.error('Error adding offspring:', error);
    return false;
  }

  return true;
};
