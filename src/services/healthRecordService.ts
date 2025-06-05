
import { supabase } from '@/integrations/supabase/client';

export interface HealthRecord {
  id: string;
  animalId: string;
  userId: string;
  recordType: 'vaccination' | 'treatment' | 'checkup' | 'illness' | 'injury' | 'medication' | 'surgery';
  title: string;
  description?: string;
  veterinarian?: string;
  medication?: string;
  dosage?: string;
  cost?: number;
  dateAdministered: string;
  nextDueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const getHealthRecords = async (animalId: string): Promise<HealthRecord[]> => {
  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('animal_id', animalId)
    .order('date_administered', { ascending: false });

  if (error) {
    console.error('Error fetching health records:', error);
    throw error;
  }

  return (data || []).map(record => ({
    id: record.id,
    animalId: record.animal_id,
    userId: record.user_id,
    recordType: record.record_type as HealthRecord['recordType'],
    title: record.title,
    description: record.description || undefined,
    veterinarian: record.veterinarian || undefined,
    medication: record.medication || undefined,
    dosage: record.dosage || undefined,
    cost: record.cost || undefined,
    dateAdministered: record.date_administered,
    nextDueDate: record.next_due_date || undefined,
    notes: record.notes || undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  }));
};

export const addHealthRecord = async (record: Omit<HealthRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user');
    return false;
  }

  const { error } = await supabase
    .from('health_records')
    .insert({
      animal_id: record.animalId,
      user_id: user.id,
      record_type: record.recordType,
      title: record.title,
      description: record.description || null,
      veterinarian: record.veterinarian || null,
      medication: record.medication || null,
      dosage: record.dosage || null,
      cost: record.cost || null,
      date_administered: record.dateAdministered,
      next_due_date: record.nextDueDate || null,
      notes: record.notes || null
    });

  if (error) {
    console.error('Error adding health record:', error);
    return false;
  }

  return true;
};

export const updateHealthRecord = async (id: string, updatedData: Partial<Omit<HealthRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<boolean> => {
  const { error } = await supabase
    .from('health_records')
    .update({
      ...(updatedData.recordType && { record_type: updatedData.recordType }),
      ...(updatedData.title && { title: updatedData.title }),
      ...(updatedData.description !== undefined && { description: updatedData.description || null }),
      ...(updatedData.veterinarian !== undefined && { veterinarian: updatedData.veterinarian || null }),
      ...(updatedData.medication !== undefined && { medication: updatedData.medication || null }),
      ...(updatedData.dosage !== undefined && { dosage: updatedData.dosage || null }),
      ...(updatedData.cost !== undefined && { cost: updatedData.cost || null }),
      ...(updatedData.dateAdministered && { date_administered: updatedData.dateAdministered }),
      ...(updatedData.nextDueDate !== undefined && { next_due_date: updatedData.nextDueDate || null }),
      ...(updatedData.notes !== undefined && { notes: updatedData.notes || null }),
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating health record:', error);
    return false;
  }

  return true;
};

export const deleteHealthRecord = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('health_records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting health record:', error);
    return false;
  }

  return true;
};
