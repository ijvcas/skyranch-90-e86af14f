
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
  status: 'planned' | 'failed' | 'birth_completed' | 'completed' | 'confirmed_pregnant' | 'not_pregnant';
  createdAt: string;
  updatedAt: string;
}

export type BreedingRecordInput = Omit<BreedingRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
export type BreedingRecordUpdate = Partial<Omit<BreedingRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
