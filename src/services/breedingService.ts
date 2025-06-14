import { supabase } from '@/integrations/supabase/client';
import { pregnancyNotificationService } from '@/services/pregnancyNotificationService';

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
  offspringCount: number;
  breedingNotes?: string;
  veterinarian?: string;
  cost?: number;
  status: 'planned' | 'in_progress' | 'success' | 'failed' | 'birth_completed';
  createdAt: string;
  updatedAt: string;
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

export const getBreedingRecordById = async (id: string): Promise<BreedingRecord | null> => {
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

export const updateBreedingRecord = async (
  id: string, 
  updatedData: Partial<Omit<BreedingRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<boolean> => {
  const { error } = await supabase
    .from('breeding_records')
    .update({
      ...(updatedData.motherId !== undefined && { mother_id: updatedData.motherId }),
      ...(updatedData.fatherId !== undefined && { father_id: updatedData.fatherId }),
      ...(updatedData.breedingDate && { breeding_date: updatedData.breedingDate }),
      ...(updatedData.breedingMethod && { breeding_method: updatedData.breedingMethod }),
      ...(updatedData.expectedDueDate !== undefined && { expected_due_date: updatedData.expectedDueDate || null }),
      ...(updatedData.actualBirthDate !== undefined && { actual_birth_date: updatedData.actualBirthDate || null }),
      ...(updatedData.pregnancyConfirmed !== undefined && { pregnancy_confirmed: updatedData.pregnancyConfirmed }),
      ...(updatedData.pregnancyConfirmationDate !== undefined && { pregnancy_confirmation_date: updatedData.pregnancyConfirmationDate || null }),
      ...(updatedData.pregnancyMethod !== undefined && { pregnancy_method: updatedData.pregnancyMethod || null }),
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

  // Check if pregnancy was just confirmed or birth was completed
  if (updatedData.pregnancyConfirmed === true) {
    console.log('🤰 Pregnancy confirmed, setting up notifications');
    await pregnancyNotificationService.checkAndSetupNotifications(id);
  } else if (updatedData.status === 'birth_completed' || updatedData.actualBirthDate) {
    console.log('👶 Birth completed, notifications will stop automatically');
  }

  return true;
};

export const createBreedingRecord = async (
  recordData: Omit<BreedingRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user');
    return null;
  }

  const { data, error } = await supabase
    .from('breeding_records')
    .insert({
      user_id: user.id,
      mother_id: recordData.motherId,
      father_id: recordData.fatherId,
      breeding_date: recordData.breedingDate,
      breeding_method: recordData.breedingMethod,
      expected_due_date: recordData.expectedDueDate || null,
      actual_birth_date: recordData.actualBirthDate || null,
      pregnancy_confirmed: recordData.pregnancyConfirmed || false,
      pregnancy_confirmation_date: recordData.pregnancyConfirmationDate || null,
      pregnancy_method: recordData.pregnancyMethod || null,
      offspring_count: recordData.offspringCount || 0,
      breeding_notes: recordData.breedingNotes || null,
      veterinarian: recordData.veterinarian || null,
      cost: recordData.cost || null,
      status: recordData.status || 'planned'
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating breeding record:', error);
    return null;
  }

  const recordId = data.id;

  // Check if pregnancy is confirmed on creation
  if (recordData.pregnancyConfirmed) {
    console.log('🤰 New pregnancy confirmed, setting up notifications');
    await pregnancyNotificationService.checkAndSetupNotifications(recordId);
  }

  return recordId;
};
