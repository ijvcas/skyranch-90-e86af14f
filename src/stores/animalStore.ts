
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

// Create a backup before any operation that could lose data
const createBackup = (): void => {
  try {
    const currentData = localStorage.getItem(STORAGE_KEY);
    if (currentData) {
      localStorage.setItem(BACKUP_KEY, currentData);
      console.log('🔄 Backup created successfully');
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
        console.log('🔄 Restored from backup:', animals.length, 'animals');
        return true;
      }
    }
  } catch (error) {
    console.error('❌ Error restoring from backup:', error);
  }
  return false;
};

// Load from localStorage on initialization
const loadAnimals = (): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        animals = parsed;
        console.log('✅ Loaded animals:', animals.length);
      } else {
        console.warn('⚠️ Invalid data format, attempting restore from backup');
        if (!restoreFromBackup()) {
          animals = [];
          console.log('📝 Starting fresh - no valid data found');
        }
      }
    } else {
      animals = [];
      console.log('📝 No stored animals found, starting fresh');
    }
  } catch (error) {
    console.error('❌ Error loading animals:', error);
    console.log('🔄 Attempting to restore from backup');
    if (!restoreFromBackup()) {
      animals = [];
      console.log('📝 Starting fresh after failed restore');
    }
  }
};

// Save to localStorage with backup
const saveAnimals = (): void => {
  try {
    // Create backup before saving
    createBackup();
    
    // Save new data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(animals));
    console.log('💾 Saved animals:', animals.length);
    
    // Verify the save was successful
    const verification = localStorage.getItem(STORAGE_KEY);
    if (verification) {
      const verified = JSON.parse(verification);
      if (!Array.isArray(verified) || verified.length !== animals.length) {
        console.error('❌ Save verification failed, restoring from backup');
        restoreFromBackup();
      } else {
        console.log('✅ Save verified successfully');
      }
    }
  } catch (error) {
    console.error('❌ Error saving animals:', error);
    // Try to restore from backup if save failed
    restoreFromBackup();
  }
};

// Initialize on module load
loadAnimals();

export const getAllAnimals = (): Animal[] => {
  // Always return a fresh copy to prevent external mutations
  return [...animals];
};

export const getAnimal = (id: string): Animal | null => {
  return animals.find(animal => animal.id === id) || null;
};

export const addAnimal = (animal: Animal): void => {
  console.log('➕ Adding animal:', animal.name, 'ID:', animal.id);
  
  // Remove any existing animal with same ID
  animals = animals.filter(a => a.id !== animal.id);
  
  // Add the new animal
  animals.push(animal);
  
  console.log('📊 Total animals after add:', animals.length);
  saveAnimals();
};

export const updateAnimal = (id: string, updatedData: Omit<Animal, 'id'>): boolean => {
  const index = animals.findIndex(animal => animal.id === id);
  if (index !== -1) {
    animals[index] = { id, ...updatedData };
    saveAnimals();
    return true;
  }
  return false;
};

export const deleteAnimal = (id: string): boolean => {
  const initialLength = animals.length;
  animals = animals.filter(animal => animal.id !== id);
  const deleted = animals.length < initialLength;
  if (deleted) {
    saveAnimals();
  }
  return deleted;
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

export const clearAllAnimals = (): void => {
  createBackup();
  animals = [];
  saveAnimals();
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
