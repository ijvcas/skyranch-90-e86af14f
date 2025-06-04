
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
  console.log('🔍 === LOADING ANIMALS FROM STORAGE ===');
  console.log('🔍 Storage keys being checked:', [STORAGE_KEY, BACKUP_KEY, EMERGENCY_KEY]);
  
  // Try primary storage first
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('🔍 Primary storage raw length:', stored?.length || 0);
    console.log('🔍 Primary storage first 200 chars:', stored?.substring(0, 200) || 'null');
    
    if (stored) {
      const parsed = JSON.parse(stored);
      const animalCount = Object.keys(parsed).length;
      console.log('✅ Primary storage parsed successfully:', animalCount, 'animals');
      console.log('✅ Primary storage animal details:', Object.entries(parsed).map(([id, animal]: [string, any]) => ({ id, name: animal.name, tag: animal.tag })));
      
      // Validate the data structure
      if (typeof parsed === 'object' && parsed !== null && animalCount > 0) {
        console.log('✅ Using primary storage data');
        return parsed;
      }
    }
  } catch (error) {
    console.error('❌ Error loading from primary storage:', error);
  }
  
  // Try backup storage
  try {
    const backup = localStorage.getItem(BACKUP_KEY);
    console.log('🔍 Backup storage raw length:', backup?.length || 0);
    
    if (backup) {
      const parsed = JSON.parse(backup);
      const animalCount = Object.keys(parsed).length;
      console.log('✅ Backup storage parsed successfully:', animalCount, 'animals');
      
      if (typeof parsed === 'object' && parsed !== null && animalCount > 0) {
        // Restore to primary
        localStorage.setItem(STORAGE_KEY, backup);
        console.log('🔄 Restored from backup to primary storage');
        return parsed;
      }
    }
  } catch (error) {
    console.error('❌ Error loading from backup storage:', error);
  }
  
  // Try emergency storage
  try {
    const emergency = localStorage.getItem(EMERGENCY_KEY);
    console.log('🔍 Emergency storage raw length:', emergency?.length || 0);
    
    if (emergency) {
      const parsed = JSON.parse(emergency);
      const animalCount = Object.keys(parsed).length;
      console.log('✅ Emergency storage parsed successfully:', animalCount, 'animals');
      
      if (typeof parsed === 'object' && parsed !== null && animalCount > 0) {
        // Restore to primary and backup
        localStorage.setItem(STORAGE_KEY, emergency);
        localStorage.setItem(BACKUP_KEY, emergency);
        console.log('🔄 Restored from emergency storage');
        return parsed;
      }
    }
  } catch (error) {
    console.error('❌ Error loading from emergency storage:', error);
  }
  
  console.log('⚠️ No valid data found in any storage, starting with empty store');
  return {};
};

// Enhanced saving with triple redundancy and immediate verification
const saveAnimalsToStorage = (animals: Record<string, Animal>): void => {
  console.log('💾 === SAVING ANIMALS TO STORAGE ===');
  const animalCount = Object.keys(animals).length;
  console.log('💾 Attempting to save:', animalCount, 'animals');
  console.log('💾 Animals being saved:', Object.entries(animals).map(([id, animal]) => ({ id, name: animal.name, tag: animal.tag })));
  
  const dataToSave = JSON.stringify(animals);
  console.log('💾 Serialized data length:', dataToSave.length, 'characters');
  console.log('💾 First 200 chars of data:', dataToSave.substring(0, 200));
  
  try {
    // Create emergency backup first (before any changes)
    const currentData = localStorage.getItem(STORAGE_KEY);
    if (currentData && currentData !== dataToSave) {
      localStorage.setItem(EMERGENCY_KEY, currentData);
      console.log('💾 Created emergency backup from current data');
    }
    
    // Save to backup first
    localStorage.setItem(BACKUP_KEY, dataToSave);
    console.log('💾 Saved to backup storage');
    
    // Save to primary
    localStorage.setItem(STORAGE_KEY, dataToSave);
    console.log('💾 Saved to primary storage');
    
    // IMMEDIATE VERIFICATION - Read back and compare
    const primaryReadback = localStorage.getItem(STORAGE_KEY);
    const backupReadback = localStorage.getItem(BACKUP_KEY);
    
    console.log('🔍 Verification - Primary readback length:', primaryReadback?.length || 0);
    console.log('🔍 Verification - Backup readback length:', backupReadback?.length || 0);
    
    if (primaryReadback === dataToSave && backupReadback === dataToSave) {
      // Parse and count to double-check
      const primaryParsed = JSON.parse(primaryReadback);
      const primaryCount = Object.keys(primaryParsed).length;
      console.log('✅ VERIFICATION PASSED: All storage saves verified successfully');
      console.log('✅ Verified animal count in storage:', primaryCount);
      console.log('✅ Verified animals:', Object.keys(primaryParsed));
    } else {
      console.error('❌ VERIFICATION FAILED! Storage data mismatch');
      console.log('❌ Original data length:', dataToSave.length);
      console.log('❌ Primary readback length:', primaryReadback?.length || 0);
      console.log('❌ Backup readback length:', backupReadback?.length || 0);
      console.log('❌ Primary matches:', primaryReadback === dataToSave);
      console.log('❌ Backup matches:', backupReadback === dataToSave);
      
      // Try to save again
      console.log('🔄 Attempting second save...');
      localStorage.setItem(STORAGE_KEY, dataToSave);
      localStorage.setItem(BACKUP_KEY, dataToSave);
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR saving to storage:', error);
    
    // Try to recover from emergency backup
    try {
      const emergency = localStorage.getItem(EMERGENCY_KEY);
      if (emergency) {
        localStorage.setItem(STORAGE_KEY, emergency);
        console.log('🔄 Recovered from emergency backup due to save error');
      }
    } catch (recoveryError) {
      console.error('❌ Failed to recover from emergency backup:', recoveryError);
    }
  }
  
  console.log('💾 === SAVE OPERATION COMPLETE ===');
};

// Load existing data from localStorage with enhanced recovery
let animals: Record<string, Animal> = loadAnimalsFromStorage();

// Enhanced debugging on startup
console.log('🚀 Animal store initialized');
console.log('🚀 Initial animal count:', Object.keys(animals).length);
console.log('🚀 Initial animals:', Object.keys(animals));

// Export all existing functions with enhanced logging
export const getAnimal = (id: string): Animal | null => {
  const found = animals[id] || null;
  console.log('🔍 Getting animal with ID:', id, 'Found:', !!found);
  return found;
};

export const getAllAnimals = (): Animal[] => {
  const allAnimals = Object.values(animals);
  console.log('📋 Getting all animals, count:', allAnimals.length);
  console.log('📋 Current animals in memory:', Object.keys(animals));
  
  // CRITICAL: Always verify storage consistency on every read
  const storageCheck = localStorage.getItem(STORAGE_KEY);
  if (storageCheck) {
    try {
      const storageParsed = JSON.parse(storageCheck);
      const storageCount = Object.keys(storageParsed).length;
      const memoryCount = allAnimals.length;
      
      console.log('🔍 CONSISTENCY CHECK:');
      console.log('🔍 Memory has:', memoryCount, 'animals');
      console.log('🔍 Storage has:', storageCount, 'animals');
      
      if (storageCount !== memoryCount) {
        console.warn('⚠️ CRITICAL: MEMORY/STORAGE MISMATCH DETECTED!');
        console.log('⚠️ Memory animals:', Object.keys(animals));
        console.log('⚠️ Storage animals:', Object.keys(storageParsed));
        
        // Always prioritize storage if it has more or different data
        if (storageCount > memoryCount || JSON.stringify(animals) !== storageCheck) {
          console.log('🔄 CRITICAL: Syncing memory from storage');
          animals = storageParsed;
          console.log('✅ Memory synced, new count:', Object.keys(animals).length);
          return Object.values(animals);
        }
      } else {
        console.log('✅ Memory and storage are consistent');
      }
    } catch (e) {
      console.error('❌ Error checking storage consistency:', e);
    }
  }
  
  return allAnimals;
};

export const updateAnimal = (id: string, updatedData: Omit<Animal, 'id'>): boolean => {
  if (animals[id]) {
    console.log('✏️ Updating animal:', id);
    console.log('✏️ Before update - animal count:', Object.keys(animals).length);
    animals[id] = { id, ...updatedData };
    saveAnimalsToStorage(animals);
    console.log('✅ Animal updated in store');
    console.log('✅ After update - animal count:', Object.keys(animals).length);
    return true;
  }
  console.log('❌ Failed to update animal - not found:', id);
  return false;
};

export const addAnimal = (animal: Animal): void => {
  console.log('➕ === ADDING ANIMAL ===');
  console.log('➕ Adding animal ID:', animal.id, 'Name:', animal.name, 'Tag:', animal.tag);
  console.log('➕ Current animals BEFORE add:', Object.keys(animals).length);
  console.log('➕ Current animal IDs BEFORE add:', Object.keys(animals));
  
  // Check if animal already exists
  if (animals[animal.id]) {
    console.warn('⚠️ Animal with this ID already exists, overwriting:', animal.id);
  }
  
  // Add to memory
  animals[animal.id] = { ...animal };
  const newCount = Object.keys(animals).length;
  console.log('✅ Animal added to memory store');
  console.log('✅ Memory store now has:', newCount, 'animals');
  console.log('✅ All animal IDs in memory:', Object.keys(animals));
  
  // Save immediately and verify extensively
  console.log('💾 Starting save operation...');
  saveAnimalsToStorage(animals);
  
  // CRITICAL: Multiple verification steps
  setTimeout(() => {
    console.log('🔍 === POST-SAVE VERIFICATION (50ms delay) ===');
    const verification = loadAnimalsFromStorage();
    const verificationCount = Object.keys(verification).length;
    console.log('🔍 Storage verification count:', verificationCount);
    console.log('🔍 Storage verification IDs:', Object.keys(verification));
    console.log('🔍 Expected count:', newCount);
    
    if (verificationCount !== newCount) {
      console.error('❌ CRITICAL: Animal count mismatch after save!');
      console.error('❌ Expected:', newCount, 'Got:', verificationCount);
      console.error('❌ Missing animals:', Object.keys(animals).filter(id => !verification[id]));
      
      // Force save again
      console.log('🔄 Attempting emergency re-save...');
      saveAnimalsToStorage(animals);
    } else {
      console.log('✅ Animal successfully added and verified');
    }
    console.log('🔍 === END POST-SAVE VERIFICATION ===');
  }, 50);
  
  console.log('➕ === ADD ANIMAL COMPLETE ===');
};

export const deleteAnimal = (id: string): boolean => {
  if (animals[id]) {
    console.log('🗑️ Deleting animal:', id);
    console.log('🗑️ Before delete - animal count:', Object.keys(animals).length);
    delete animals[id];
    saveAnimalsToStorage(animals);
    console.log('✅ Animal deleted from store');
    console.log('✅ After delete - animal count:', Object.keys(animals).length);
    return true;
  }
  console.log('❌ Failed to delete animal - not found:', id);
  return false;
};

export const getAnimalCountBySpecies = (): Record<string, number> => {
  const allAnimals = getAllAnimals();
  const counts: Record<string, number> = {};
  
  allAnimals.forEach(animal => {
    counts[animal.species] = (counts[animal.species] || 0) + 1;
  });
  
  console.log('📊 Species counts:', counts);
  return counts;
};

export const getAnimalsBySpecies = (species: string): Animal[] => {
  const allAnimals = getAllAnimals();
  const filtered = allAnimals.filter(animal => animal.species === species);
  console.log(`🔍 Animals of species ${species}:`, filtered.length);
  return filtered;
};

export const getAnimalsByHealthStatus = (status: string): Animal[] => {
  const allAnimals = getAllAnimals();
  const filtered = allAnimals.filter(animal => animal.healthStatus === status);
  console.log(`🔍 Animals with health status ${status}:`, filtered.length);
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
  console.log(`🔍 Search results for "${query}":`, filtered.length, 'animals found');
  return filtered;
};

export const clearAllAnimals = (): void => {
  console.log('🗑️ Clearing all animals. Current count:', Object.keys(animals).length);
  animals = {};
  saveAnimalsToStorage(animals);
  console.log('✅ All animals cleared from store');
};

// Enhanced debug function with more details
export const debugStore = () => {
  console.log('🐛 === ENHANCED ANIMAL STORE DEBUG ===');
  console.log('🐛 Animals in memory count:', Object.keys(animals).length);
  console.log('🐛 Animals in memory:', Object.entries(animals).map(([id, animal]) => ({ id, name: animal.name, tag: animal.tag })));
  
  // Check all storage locations with detailed info
  const storageKeys = [STORAGE_KEY, BACKUP_KEY, EMERGENCY_KEY];
  storageKeys.forEach(key => {
    const data = localStorage.getItem(key);
    console.log(`\n--- ${key} ---`);
    console.log('Raw data length:', data?.length || 0);
    console.log('Raw data preview:', data ? data.substring(0, 100) + '...' : 'null');
    
    if (data) {
      try {
        const parsed = JSON.parse(data);
        const count = Object.keys(parsed).length;
        console.log('Parsed count:', count);
        console.log('Parsed animals:', Object.entries(parsed).map(([id, animal]: [string, any]) => ({ id, name: animal.name, tag: animal.tag })));
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
  console.log('\n🐛 Total localStorage usage:', totalUsage, 'characters');
  console.log('🐛 === END ENHANCED DEBUG ===');
};

// Force reload from storage with better recovery
export const reloadFromStorage = (): void => {
  console.log('🔄 === FORCE RELOADING FROM STORAGE ===');
  const oldCount = Object.keys(animals).length;
  animals = loadAnimalsFromStorage();
  const newCount = Object.keys(animals).length;
  console.log(`🔄 Reloaded: ${oldCount} → ${newCount} animals`);
  
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
            console.log(`🔄 Recovering ${Object.keys(parsed).length} animals from ${source}`);
            animals = parsed;
            saveAnimalsToStorage(animals);
            break;
          }
        }
      } catch (e) {
        console.error(`❌ Failed to recover from ${source}:`, e);
      }
    }
  }
};

// Auto-recovery and detailed startup logging
console.log('🚀 Animal store initialized with ULTRA persistence');
debugStore();

// Additional startup verification
setTimeout(() => {
  console.log('🔍 === STARTUP VERIFICATION (100ms delay) ===');
  const currentCount = Object.keys(animals).length;
  const storageData = localStorage.getItem(STORAGE_KEY);
  if (storageData) {
    try {
      const storageParsed = JSON.parse(storageData);
      const storageCount = Object.keys(storageParsed).length;
      console.log('🔍 Startup check - Memory:', currentCount, 'Storage:', storageCount);
      if (currentCount !== storageCount) {
        console.warn('⚠️ Startup mismatch detected, forcing sync...');
        animals = storageParsed;
      }
    } catch (e) {
      console.error('❌ Startup verification error:', e);
    }
  }
  console.log('🔍 === END STARTUP VERIFICATION ===');
}, 100);
