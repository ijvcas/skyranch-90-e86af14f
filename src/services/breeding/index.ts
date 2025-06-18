
export * from './types';
export * from './breedingQueries';
export * from './breedingMutations';

// Re-export with the original function names for backward compatibility
export {
  fetchBreedingRecords as getBreedingRecords,
  fetchBreedingRecordById as getBreedingRecordById
} from './breedingQueries';

export {
  deleteBreedingRecord,
  updateBreedingRecord,
  createBreedingRecord
} from './breedingMutations';
