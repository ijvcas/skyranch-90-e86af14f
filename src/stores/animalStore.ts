
// Simple animal data store
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

// Use localStorage to persist data
const STORAGE_KEY = 'skyranch_animals';

const loadAnimalsFromStorage = (): Record<string, Animal> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Loaded animals from storage:', Object.keys(parsed).length, 'animals');
      console.log('Animal IDs:', Object.keys(parsed));
      console.log('Full animal data:', parsed);
      return parsed;
    }
  } catch (error) {
    console.error('Error loading animals from storage:', error);
    // Try to recover from backup if available
    const backup = localStorage.getItem(STORAGE_KEY + '_backup');
    if (backup) {
      console.log('Attempting to restore from backup...');
      try {
        const backupData = JSON.parse(backup);
        localStorage.setItem(STORAGE_KEY, backup);
        return backupData;
      } catch (backupError) {
        console.error('Backup also corrupted:', backupError);
      }
    }
  }
  return {};
};

const saveAnimalsToStorage = (animals: Record<string, Animal>): void => {
  try {
    // Create backup before saving
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      localStorage.setItem(STORAGE_KEY + '_backup', current);
    }
    
    const dataToSave = JSON.stringify(animals);
    localStorage.setItem(STORAGE_KEY, dataToSave);
    console.log('Saved animals to storage:', Object.keys(animals).length, 'animals');
    console.log('Saved animal IDs:', Object.keys(animals));
    
    // Verify the save worked
    const verification = localStorage.getItem(STORAGE_KEY);
    if (!verification || verification !== dataToSave) {
      console.error('Storage verification failed! Data may not have been saved correctly.');
      throw new Error('Storage verification failed');
    }
  } catch (error) {
    console.error('Error saving animals to storage:', error);
    // Try to restore from backup
    const backup = localStorage.getItem(STORAGE_KEY + '_backup');
    if (backup) {
      console.log('Restoring from backup due to save error...');
      localStorage.setItem(STORAGE_KEY, backup);
    }
  }
};

// Load existing data from localStorage
let animals: Record<string, Animal> = loadAnimalsFromStorage();

export const getAnimal = (id: string): Animal | null => {
  console.log('Getting animal with ID:', id, 'Found:', !!animals[id]);
  return animals[id] || null;
};

export const getAllAnimals = (): Animal[] => {
  const allAnimals = Object.values(animals);
  console.log('Getting all animals, count:', allAnimals.length);
  console.log('Current animals in memory:', Object.keys(animals));
  return allAnimals;
};

export const updateAnimal = (id: string, updatedData: Omit<Animal, 'id'>): boolean => {
  if (animals[id]) {
    console.log('Updating animal:', id, 'Current animals before update:', Object.keys(animals));
    animals[id] = { id, ...updatedData };
    saveAnimalsToStorage(animals);
    console.log('Animal updated in store:', animals[id]);
    console.log('Animals after update:', Object.keys(animals));
    return true;
  }
  console.log('Failed to update animal - not found:', id);
  return false;
};

export const addAnimal = (animal: Animal): void => {
  console.log('Adding animal:', animal.id, 'Current animals before add:', Object.keys(animals));
  
  // Check if animal already exists
  if (animals[animal.id]) {
    console.warn('Animal with this ID already exists, overwriting:', animal.id);
  }
  
  animals[animal.id] = animal;
  saveAnimalsToStorage(animals);
  console.log('Animal added to store:', animal);
  console.log('Total animals in store after add:', Object.keys(animals).length);
  console.log('All animal IDs after add:', Object.keys(animals));
};

export const deleteAnimal = (id: string): boolean => {
  if (animals[id]) {
    console.log('Deleting animal:', id, 'Current animals before delete:', Object.keys(animals));
    delete animals[id];
    saveAnimalsToStorage(animals);
    console.log('Animal deleted from store:', id);
    console.log('Remaining animals in store:', Object.keys(animals).length);
    console.log('Remaining animal IDs:', Object.keys(animals));
    return true;
  }
  console.log('Failed to delete animal - not found:', id);
  return false;
};

export const getAnimalCountBySpecies = (): Record<string, number> => {
  const allAnimals = getAllAnimals();
  const counts: Record<string, number> = {};
  
  allAnimals.forEach(animal => {
    counts[animal.species] = (counts[animal.species] || 0) + 1;
  });
  
  console.log('Species counts:', counts);
  return counts;
};

export const getAnimalsBySpecies = (species: string): Animal[] => {
  const allAnimals = getAllAnimals();
  const filtered = allAnimals.filter(animal => animal.species === species);
  console.log(`Animals of species ${species}:`, filtered.length);
  return filtered;
};

export const getAnimalsByHealthStatus = (status: string): Animal[] => {
  const allAnimals = getAllAnimals();
  const filtered = allAnimals.filter(animal => animal.healthStatus === status);
  console.log(`Animals with health status ${status}:`, filtered.length);
  return filtered;
};

export const searchAnimals = (query: string): Animal[] => {
  const allAnimals = getAllAnimals();
  const lowercaseQuery = query.toLowerCase();
  const filtered = allAnimals.filter(animal => 
    animal.name.toLowerCase().includes(lowercaseQuery) ||
    animal.tag.toLowerCase().includes(lowercaseQuery) ||
    animal.species.toLowerCase().includes(lowercaseQuery) ||
    animal.breed.toLowerCase().includes(lowercaseQuery)
  );
  console.log(`Search results for "${query}":`, filtered.length, 'animals found');
  return filtered;
};

export const clearAllAnimals = (): void => {
  console.log('Clearing all animals. Current count:', Object.keys(animals).length);
  animals = {};
  saveAnimalsToStorage(animals);
  console.log('All animals cleared from store');
};

// Debug function to check store state
export const debugStore = () => {
  console.log('=== ANIMAL STORE DEBUG ===');
  console.log('Animals in memory count:', Object.keys(animals).length);
  console.log('Animals in memory:', animals);
  
  const storageData = localStorage.getItem(STORAGE_KEY);
  console.log('Raw localStorage data:', storageData);
  
  if (storageData) {
    try {
      const parsed = JSON.parse(storageData);
      console.log('Parsed storage data count:', Object.keys(parsed).length);
      console.log('Parsed storage data:', parsed);
    } catch (e) {
      console.error('Error parsing storage data:', e);
    }
  }
  
  const backup = localStorage.getItem(STORAGE_KEY + '_backup');
  if (backup) {
    console.log('Backup exists:', backup.length, 'characters');
    try {
      const parsedBackup = JSON.parse(backup);
      console.log('Backup data count:', Object.keys(parsedBackup).length);
    } catch (e) {
      console.error('Error parsing backup:', e);
    }
  }
  console.log('=== END DEBUG ===');
};

// Force reload from storage (useful for debugging)
export const reloadFromStorage = (): void => {
  console.log('Reloading animals from storage...');
  animals = loadAnimalsFromStorage();
  console.log('Reloaded', Object.keys(animals).length, 'animals');
};
