// Simple animal data store with reliable localStorage persistence
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
}

const STORAGE_KEY = 'skyranch_animals';
const BACKUP_KEY = 'skyranch_animals_backup';

// Simple in-memory store
let animals: Animal[] = [];

// Enhanced logging for debugging
const debugLog = (message: string, data?: any) => {
  console.log(`🔍 [AnimalStore] ${message}`, data || '');
  
  // Also log storage state for debugging
  try {
    const currentStorage = localStorage.getItem(STORAGE_KEY);
    console.log('📦 Current localStorage:', currentStorage ? JSON.parse(currentStorage).length + ' animals' : 'empty');
  } catch (e) {
    console.log('📦 Current localStorage: invalid data');
  }
};

// Create a backup before any operation that could lose data
const createBackup = (): void => {
  try {
    const currentData = localStorage.getItem(STORAGE_KEY);
    if (currentData) {
      localStorage.setItem(BACKUP_KEY, currentData);
      debugLog('Backup created successfully');
    }
  } catch (error) {
    console.error('❌ Error creating backup:', error);
  }
};

// Restore from backup if main data is corrupted
const restoreFromBackup = (): boolean => {
  try {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (backup) {
      const parsed = JSON.parse(backup);
      if (Array.isArray(parsed)) {
        localStorage.setItem(STORAGE_KEY, backup);
        animals = parsed;
        debugLog('Restored from backup', animals.length + ' animals');
        return true;
      }
    }
  } catch (error) {
    console.error('❌ Error restoring from backup:', error);
  }
  return false;
};

// Enhanced save with immediate verification
const saveAnimals = (): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // Create backup before saving
      createBackup();
      
      const dataToSave = JSON.stringify(animals);
      debugLog('Attempting to save', animals.length + ' animals');
      
      // Save new data
      localStorage.setItem(STORAGE_KEY, dataToSave);
      debugLog('Data written to localStorage');
      
      // Immediate verification
      setTimeout(() => {
        try {
          const verification = localStorage.getItem(STORAGE_KEY);
          if (verification) {
            const verified = JSON.parse(verification);
            if (Array.isArray(verified) && verified.length === animals.length) {
              debugLog('Save verified successfully', verified.length + ' animals');
              resolve(true);
            } else {
              console.error('❌ Verification failed: count mismatch');
              resolve(false);
            }
          } else {
            console.error('❌ Verification failed: no data found');
            resolve(false);
          }
        } catch (verifyError) {
          console.error('❌ Verification failed:', verifyError);
          resolve(false);
        }
      }, 50); // Reduced timeout for faster verification
      
    } catch (error) {
      console.error('❌ Error saving animals:', error);
      // Try to restore from backup if save failed
      if (restoreFromBackup()) {
        debugLog('Restored from backup after save failure');
      }
      resolve(false);
    }
  });
};

// Enhanced load with better error handling
const loadAnimals = (): void => {
  try {
    debugLog('Starting to load animals from localStorage');
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      debugLog('Found stored data, parsing...');
      const parsed = JSON.parse(stored);
      
      if (Array.isArray(parsed)) {
        animals = parsed;
        debugLog('Successfully loaded animals', animals.length + ' animals');
        
        // Log first few animals for verification
        if (animals.length > 0) {
          console.log('🐄 Sample animals:', animals.slice(0, 3).map(a => ({ id: a.id, name: a.name })));
        }
      } else {
        console.warn('⚠️ Invalid data format, attempting restore from backup');
        if (!restoreFromBackup()) {
          animals = [];
          debugLog('Starting fresh - no valid data found');
        }
      }
    } else {
      animals = [];
      debugLog('No stored animals found, starting fresh');
    }
  } catch (error) {
    console.error('❌ Error loading animals:', error);
    debugLog('Attempting to restore from backup');
    if (!restoreFromBackup()) {
      animals = [];
      debugLog('Starting fresh after failed restore');
    }
  }
};

// Initialize on module load
debugLog('Initializing animal store...');
loadAnimals();

export const getAllAnimals = (): Animal[] => {
  debugLog('Getting all animals', animals.length + ' animals');
  // Always return a fresh copy to prevent external mutations
  return [...animals];
};

export const getAnimal = (id: string): Animal | null => {
  const animal = animals.find(animal => animal.id === id) || null;
  debugLog('Getting animal by ID', id + ': ' + (animal ? 'found' : 'not found'));
  return animal;
};

export const addAnimal = async (animal: Animal): Promise<boolean> => {
  debugLog('Adding animal', animal.name + ' (ID: ' + animal.id + ')');
  
  // Remove any existing animal with same ID
  const initialLength = animals.length;
  animals = animals.filter(a => a.id !== animal.id);
  
  // Add the new animal
  animals.push(animal);
  
  debugLog('Total animals after add', animals.length + ' (was ' + initialLength + ')');
  
  const saved = await saveAnimals();
  if (saved) {
    debugLog('Animal successfully added and saved');
  } else {
    console.error('❌ Failed to save animal after adding');
  }
  
  return saved;
};

export const updateAnimal = async (id: string, updatedData: Omit<Animal, 'id'>): Promise<boolean> => {
  debugLog('Updating animal ID', id);
  const index = animals.findIndex(animal => animal.id === id);
  
  if (index !== -1) {
    animals[index] = { id, ...updatedData };
    debugLog('Animal updated in memory', animals[index].name);
    
    const saved = await saveAnimals();
    if (saved) {
      debugLog('Animal successfully updated and saved');
    } else {
      console.error('❌ Failed to save animal after updating');
    }
    
    return saved;
  }
  
  console.error('❌ Animal not found for update:', id);
  return false;
};

export const deleteAnimal = async (id: string): Promise<boolean> => {
  const initialLength = animals.length;
  animals = animals.filter(animal => animal.id !== id);
  const deleted = animals.length < initialLength;
  
  if (deleted) {
    debugLog('Animal deleted from memory', id);
    const saved = await saveAnimals();
    if (saved) {
      debugLog('Animal successfully deleted and saved');
    } else {
      console.error('❌ Failed to save after deleting animal');
    }
    return saved;
  }
  
  return false;
};

export const getAnimalCountBySpecies = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  animals.forEach(animal => {
    counts[animal.species] = (counts[animal.species] || 0) + 1;
  });
  return counts;
};

export const getAnimalsBySpecies = (species: string): Animal[] => {
  return animals.filter(animal => animal.species === species);
};

export const getAnimalsByHealthStatus = (status: string): Animal[] => {
  return animals.filter(animal => animal.healthStatus === status);
};

export const searchAnimals = (query: string): Animal[] => {
  const lowercaseQuery = query.toLowerCase();
  return animals.filter(animal => 
    animal.name.toLowerCase().includes(lowercaseQuery) ||
    animal.tag.toLowerCase().includes(lowercaseQuery) ||
    animal.species.toLowerCase().includes(lowercaseQuery) ||
    animal.breed.toLowerCase().includes(lowercaseQuery)
  );
};

export const clearAllAnimals = async (): Promise<boolean> => {
  createBackup();
  animals = [];
  debugLog('Clearing all animals');
  return await saveAnimals();
};

// New function to manually restore from backup
export const restoreAnimalsFromBackup = (): boolean => {
  return restoreFromBackup();
};

// New function to get backup info
export const getBackupInfo = (): { hasBackup: boolean; backupCount: number } => {
  try {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (backup) {
      const parsed = JSON.parse(backup);
      return {
        hasBackup: true,
        backupCount: Array.isArray(parsed) ? parsed.length : 0
      };
    }
  } catch (error) {
    console.error('Error checking backup:', error);
  }
  return { hasBackup: false, backupCount: 0 };
};

// New function to force a storage check
export const debugStorage = (): void => {
  debugLog('=== STORAGE DEBUG ===');
  console.log('🔍 In-memory animals:', animals.length);
  console.log('🔍 LocalStorage keys:', Object.keys(localStorage));
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('🔍 Stored animals:', Array.isArray(parsed) ? parsed.length : 'invalid format');
      console.log('🔍 Stored data sample:', stored.substring(0, 200) + '...');
    } else {
      console.log('🔍 No data in localStorage');
    }
  } catch (e) {
    console.log('🔍 Error reading localStorage:', e);
  }
  
  console.log('🔍 Storage quota:', navigator.storage ? 'Available' : 'Not available');
  debugLog('=== END STORAGE DEBUG ===');
};
