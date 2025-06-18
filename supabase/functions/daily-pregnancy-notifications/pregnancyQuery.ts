
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { BreedingRecord, Animal } from './types.ts';

export class PregnancyQueryService {
  constructor(private supabase: any) {}

  async getPregnanciesRequiringNotifications(todayString: string, sevenDaysString: string): Promise<{
    breedingRecords: BreedingRecord[] | null;
    error: any;
  }> {
    const { data: breedingRecords, error } = await this.supabase
      .from('breeding_records')
      .select('id, expected_due_date, mother_id, pregnancy_confirmed, status, actual_birth_date')
      .eq('pregnancy_confirmed', true)
      .gte('expected_due_date', todayString) // Due today or in the future
      .lte('expected_due_date', sevenDaysString) // Due within 7 days
      .is('actual_birth_date', null) // No birth recorded yet
      .neq('status', 'birth_completed'); // Status is not birth completed

    return { breedingRecords, error };
  }

  async getMotherAnimals(motherIds: string[]): Promise<{
    mothers: Animal[] | null;
    error: any;
  }> {
    const { data: mothers, error } = await this.supabase
      .from('animals')
      .select('id, name')
      .in('id', motherIds);

    return { mothers, error };
  }

  async getAllConfirmedPregnancies(): Promise<{
    allPregnancies: any[] | null;
    error: any;
  }> {
    const { data: allPregnancies, error } = await this.supabase
      .from('breeding_records')
      .select('id, expected_due_date, pregnancy_confirmed, status, actual_birth_date')
      .eq('pregnancy_confirmed', true);

    return { allPregnancies, error };
  }
}
