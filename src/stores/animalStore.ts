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

// Use localStorage to persist data with multiple backup strategies
const STORAGE_KEY = 'skyranch_animals';
const BACKUP_KEY = 'skyranch_animals_backup';
const EMERGENCY_KEY = 'skyranch_animals_emergency';

// Enhanced loading with multiple fallback strategies
const loadAnimalsFromStorage = (): Record<string, Animal> => {
  console.log('=== LOADING ANIMALS FROM STORAGE ===');
  
  // Try primary storage first
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('Primary storage raw data:', stored);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Primary storage parsed successfully:', Object.keys(parsed).length, 'animals');
      console.log('Primary storage animal IDs:', Object.keys(parsed));
      
      // Validate the data structure
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading from primary storage:', error);
  }
  
  // Try backup storage
  try {
    const backup = localStorage.getItem(BACKUP_KEY);
    console.log('Backup storage raw data:', backup);
    
    if (backup) {
      const parsed = JSON.parse(backup);
      console.log('Backup storage parsed successfully:', Object.keys(parsed).length, 'animals');
      
      if (typeof parsed === 'object' && parsed !== null) {
        // Restore to primary
        localStorage.setItem(STORAGE_KEY, backup);
        console.log('Restored from backup to primary storage');
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading from backup storage:', error);
  }
  
  // Try emergency storage
  try {
    const emergency = localStorage.getItem(EMERGENCY_KEY);
    console.log('Emergency storage raw data:', emergency);
    
    if (emergency) {
      const parsed = JSON.parse(emergency);
      console.log('Emergency storage parsed successfully:', Object.keys(parsed).length, 'animals');
      
      if (typeof parsed === 'object' && parsed !== null) {
        // Restore to primary and backup
        localStorage.setItem(STORAGE_KEY, emergency);
        localStorage.setItem(BACKUP_KEY, emergency);
        console.log('Restored from emergency storage');
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading from emergency storage:', error);
  }
  
  console.log('No valid data found in any storage, starting with empty store');
  return {};
};

// Enhanced saving with triple redundancy
const saveAnimalsToStorage = (animals: Record<string, Animal>): void => {
  console.log('=== SAVING ANIMALS TO STORAGE ===');
  console.log('Attempting to save:', Object.keys(animals).length, 'animals');
  console.log('Animal IDs being saved:', Object.keys(animals));
  
  const dataToSave = JSON.stringify(animals);
  console.log('Serialized data length:', dataToSave.length, 'characters');
  
  try {
    // Save to emergency backup first (before any changes)
    const currentData = localStorage.getItem(STORAGE_KEY);
    if (currentData) {
      localStorage.setItem(EMERGENCY_KEY, currentData);
      console.log('Created emergency backup');
    }
    
    // Save to backup
    localStorage.setItem(BACKUP_KEY, dataToSave);
    console.log('Saved to backup storage');
    
    // Save to primary
    localStorage.setItem(STORAGE_KEY, dataToSave);
    console.log('Saved to primary storage');
    
    // Verify all saves
    const primaryVerify = localStorage.getItem(STORAGE_KEY);
    const backupVerify = localStorage.getItem(BACKUP_KEY);
    
    if (primaryVerify === dataToSave && backupVerify === dataToSave) {
      console.log('✅ All storage saves verified successfully');
    } else {
      console.error('❌ Storage verification failed!');
      console.log('Primary matches:', primaryVerify === dataToSave);
      console.log('Backup matches:', backupVerify === dataToSave);
    }
    
  } catch (error) {
    console.error('❌ Critical error saving to storage:', error);
    
    // Try to recover from emergency backup
    try {
      const emergency = localStorage.getItem(EMERGENCY_KEY);
      if (emergency) {
        localStorage.setItem(STORAGE_KEY, emergency);
        console.log('Recovered from emergency backup due to save error');
      }
    } catch (recoveryError) {
      console.error('Failed to recover from emergency backup:', recoveryError);
    }
  }
};

// Load existing data from localStorage with enhanced recovery
let animals: Record<string, Animal> = loadAnimalsFromStorage();

// Export all existing functions with enhanced logging
export const getAnimal = (id: string): Animal | null => {
  console.log('Getting animal with ID:', id, 'Found:', !!animals[id]);
  return animals[id] || null;
};

export const getAllAnimals = (): Animal[] => {
  const allAnimals = Object.values(animals);
  console.log('Getting all animals, count:', allAnimals.length);
  console.log('Current animals in memory:', Object.keys(animals));
  
  // Double-check storage consistency
  const storageCheck = localStorage.getItem(STORAGE_KEY);
  if (storageCheck) {
    try {
      const storageParsed = JSON.parse(storageCheck);
      const storageCount = Object.keys(storageParsed).length;
      if (storageCount !== allAnimals.length) {
        console.warn('⚠️ MEMORY/STORAGE MISMATCH!');
        console.log('Memory has:', allAnimals.length, 'animals');
        console.log('Storage has:', storageCount, 'animals');
        
        // Reload from storage if it has more data
        if (storageCount > allAnimals.length) {
          console.log('Reloading from storage as it has more data');
          animals = storageParsed;
          return Object.values(animals);
        }
      }
    } catch (e) {
      console.error('Error checking storage consistency:', e);
    }
  }
  
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
  console.log('=== ADDING ANIMAL ===');
  console.log('Adding animal:', animal.id, animal.name);
  console.log('Current animals before add:', Object.keys(animals));
  console.log('Current animal count before add:', Object.keys(animals).length);
  
  // Check if animal already exists
  if (animals[animal.id]) {
    console.warn('Animal with this ID already exists, overwriting:', animal.id);
  }
  
  animals[animal.id] = { ...animal };
  console.log('Animal added to memory store');
  console.log('Memory store now has:', Object.keys(animals).length, 'animals');
  console.log('All animal IDs in memory:', Object.keys(animals));
  
  // Save immediately and verify
  saveAnimalsToStorage(animals);
  
  // Verify the save worked by reloading
  const verification = loadAnimalsFromStorage();
  const verificationCount = Object.keys(verification).length;
  console.log('Post-save verification: storage has', verificationCount, 'animals');
  
  if (verificationCount !== Object.keys(animals).length) {
    console.error('❌ CRITICAL: Animal count mismatch after save!');
    console.log('Memory:', Object.keys(animals).length, 'Storage:', verificationCount);
  } else {
    console.log('✅ Animal successfully added and verified');
  }
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

// Enhanced debug function
export const debugStore = () => {
  console.log('=== ENHANCED ANIMAL STORE DEBUG ===');
  console.log('Animals in memory count:', Object.keys(animals).length);
  console.log('Animals in memory IDs:', Object.keys(animals));
  console.log('Full memory data:', animals);
  
  // Check all storage locations
  const storageKeys = [STORAGE_KEY, BACKUP_KEY, EMERGENCY_KEY];
  storageKeys.forEach(key => {
    const data = localStorage.getItem(key);
    console.log(`\n--- ${key} ---`);
    console.log('Raw data:', data ? data.substring(0, 100) + '...' : 'null');
    
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log('Parsed count:', Object.keys(parsed).length);
        console.log('Parsed IDs:', Object.keys(parsed));
      } catch (e) {
        console.error('Parse error:', e);
      }
    }
  });
  
  // Check total localStorage usage
  let totalUsage = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalUsage += localStorage[key].length;
    }
  }
  console.log('\nTotal localStorage usage:', totalUsage, 'characters');
  console.log('=== END ENHANCED DEBUG ===');
};

// Force reload from storage with better recovery
export const reloadFromStorage = (): void => {
  console.log('=== FORCE RELOADING FROM STORAGE ===');
  const oldCount = Object.keys(animals).length;
  animals = loadAnimalsFromStorage();
  const newCount = Object.keys(animals).length;
  console.log(`Reloaded: ${oldCount} → ${newCount} animals`);
  
  if (newCount === 0 && oldCount > 0) {
    console.warn('⚠️ Data loss detected during reload! Attempting recovery...');
    
    // Try all backup locations
    const backupSources = [BACKUP_KEY, EMERGENCY_KEY];
    for (const source of backupSources) {
      try {
        const backup = localStorage.getItem(source);
        if (backup) {
          const parsed = JSON.parse(backup);
          if (Object.keys(parsed).length > 0) {
            console.log(`Recovering ${Object.keys(parsed).length} animals from ${source}`);
            animals = parsed;
            saveAnimalsToStorage(animals);
            break;
          }
        }
      } catch (e) {
        console.error(`Failed to recover from ${source}:`, e);
      }
    }
  }
};

// Auto-recovery on page load
console.log('🔍 Animal store initialized with enhanced persistence');
debugStore();
