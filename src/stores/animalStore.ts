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

// Simple loading function with extensive debugging
const loadAnimalsFromStorage = (): Record<string, Animal> => {
  console.log('🔍 LOAD: Starting to load animals from storage...');
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('🔍 LOAD: Raw stored data length:', stored?.length || 0);
    console.log('🔍 LOAD: Raw stored data preview:', stored?.substring(0, 500) || 'null');
    
    if (stored) {
      console.log('🔍 LOAD: About to parse JSON...');
      const parsed = JSON.parse(stored);
      console.log('🔍 LOAD: JSON parsed successfully');
      console.log('🔍 LOAD: Parsed data type:', typeof parsed);
      console.log('🔍 LOAD: Parsed data is array?', Array.isArray(parsed));
      console.log('🔍 LOAD: Parsed data keys:', Object.keys(parsed));
      console.log('🔍 LOAD: Animal count from parsed data:', Object.keys(parsed).length);
      
      // Log each animal in detail
      Object.entries(parsed).forEach(([key, animal]: [string, any], index) => {
        console.log(`🔍 LOAD: Animal ${index + 1} (key: ${key}):`, {
          id: animal.id,
          name: animal.name,
          tag: animal.tag,
          fullObject: animal
        });
      });
      
      // Validate the structure
      const validAnimals: Record<string, Animal> = {};
      Object.entries(parsed).forEach(([key, animal]: [string, any]) => {
        if (animal && typeof animal === 'object' && animal.id) {
          validAnimals[key] = animal as Animal;
          console.log(`✅ LOAD: Valid animal added: ${animal.id} - ${animal.name}`);
        } else {
          console.error(`❌ LOAD: Invalid animal structure for key ${key}:`, animal);
        }
      });
      
      console.log('✅ LOAD: Successfully loaded and validated animals:', Object.keys(validAnimals).length);
      return validAnimals;
    }
  } catch (error) {
    console.error('❌ LOAD: Error loading from storage:', error);
    console.error('❌ LOAD: Error details:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  console.log('⚠️ LOAD: No valid data found, starting with empty store');
  return {};
};

// Simple saving function with extensive debugging
const saveAnimalsToStorage = (animals: Record<string, Animal>): void => {
  console.log('💾 SAVE: Starting to save animals to storage...');
  console.log('💾 SAVE: Animals to save count:', Object.keys(animals).length);
  console.log('💾 SAVE: Animal keys to save:', Object.keys(animals));
  
  // Log each animal being saved
  Object.entries(animals).forEach(([key, animal], index) => {
    console.log(`💾 SAVE: Animal ${index + 1} (key: ${key}):`, {
      id: animal.id,
      name: animal.name,
      tag: animal.tag,
      hasAllFields: !!(animal.species && animal.breed && animal.birthDate)
    });
  });
  
  try {
    // Create a clean copy to avoid any reference issues
    const cleanAnimals = JSON.parse(JSON.stringify(animals));
    console.log('💾 SAVE: Clean copy created, count:', Object.keys(cleanAnimals).length);
    
    const dataToSave = JSON.stringify(cleanAnimals);
    console.log('💾 SAVE: JSON string created, length:', dataToSave.length);
    console.log('💾 SAVE: JSON preview (first 500 chars):', dataToSave.substring(0, 500));
    console.log('💾 SAVE: JSON preview (last 200 chars):', dataToSave.substring(dataToSave.length - 200));
    
    // Count objects in the JSON string
    const objectCount = (dataToSave.match(/"id":/g) || []).length;
    console.log('💾 SAVE: Objects detected in JSON string:', objectCount);
    
    localStorage.setItem(STORAGE_KEY, dataToSave);
    console.log('✅ SAVE: Data written to localStorage');
    
    // Immediate verification with detailed checking
    console.log('🔍 SAVE: Starting immediate verification...');
    const verification = localStorage.getItem(STORAGE_KEY);
    
    if (verification) {
      console.log('🔍 SAVE: Verification - raw data length:', verification.length);
      console.log('🔍 SAVE: Verification - matches saved data length:', verification.length === dataToSave.length);
      
      try {
        const verifiedData = JSON.parse(verification);
        const verifiedCount = Object.keys(verifiedData).length;
        console.log('✅ SAVE: Verification - parsed count:', verifiedCount);
        console.log('✅ SAVE: Verification - parsed keys:', Object.keys(verifiedData));
        
        if (verifiedCount !== Object.keys(animals).length) {
          console.error('❌ SAVE: CRITICAL ERROR - Count mismatch!');
          console.error('❌ SAVE: Expected:', Object.keys(animals).length);
          console.error('❌ SAVE: Actually saved:', verifiedCount);
          console.error('❌ SAVE: Original animals:', Object.keys(animals));
          console.error('❌ SAVE: Verified animals:', Object.keys(verifiedData));
        } else {
          console.log('✅ SAVE: Verification passed - counts match');
        }
      } catch (parseError) {
        console.error('❌ SAVE: Verification parse error:', parseError);
      }
    } else {
      console.error('❌ SAVE: CRITICAL ERROR - No data found after save!');
    }
    
  } catch (error) {
    console.error('❌ SAVE: Error saving to storage:', error);
    console.error('❌ SAVE: Error details:', error instanceof Error ? error.message : 'Unknown error');
  }
};

// Load existing data from localStorage
let animals: Record<string, Animal> = loadAnimalsFromStorage();

console.log('🚀 Animal store initialized with', Object.keys(animals).length, 'animals');
console.log('🚀 Initial animal IDs:', Object.keys(animals));

export const getAnimal = (id: string): Animal | null => {
  const animal = animals[id] || null;
  console.log('🔍 GET: Requesting animal', id, animal ? 'FOUND' : 'NOT FOUND');
  return animal;
};

export const getAllAnimals = (): Animal[] => {
  const allAnimals = Object.values(animals);
  console.log('📋 GET ALL: Current animals in memory:', Object.keys(animals).length);
  console.log('📋 GET ALL: Animal IDs:', Object.keys(animals));
  return allAnimals;
};

export const updateAnimal = (id: string, updatedData: Omit<Animal, 'id'>): boolean => {
  console.log('✏️ UPDATE: Attempting to update animal:', id);
  
  if (animals[id]) {
    console.log('✏️ UPDATE: Animal found, updating...');
    animals[id] = { id, ...updatedData };
    saveAnimalsToStorage(animals);
    console.log('✅ UPDATE: Animal updated successfully');
    return true;
  }
  
  console.log('❌ UPDATE: Failed to update animal - not found:', id);
  return false;
};

export const addAnimal = (animal: Animal): void => {
  console.log('➕ ADD: ========== STARTING ADD OPERATION ==========');
  console.log('➕ ADD: Animal data:', { id: animal.id, name: animal.name, tag: animal.tag });
  console.log('➕ ADD: Current count before add:', Object.keys(animals).length);
  console.log('➕ ADD: Current animal IDs before add:', Object.keys(animals));
  
  // Check if animal already exists
  if (animals[animal.id]) {
    console.log('⚠️ ADD: Animal already exists, will overwrite');
  }
  
  // Add to memory
  animals[animal.id] = { ...animal };
  
  console.log('➕ ADD: Animal added to memory');
  console.log('➕ ADD: New count in memory:', Object.keys(animals).length);
  console.log('➕ ADD: All animal IDs in memory:', Object.keys(animals));
  
  // Verify the animal was actually added to memory
  if (animals[animal.id]) {
    console.log('✅ ADD: Confirmed animal exists in memory:', animals[animal.id].name);
  } else {
    console.error('❌ ADD: CRITICAL ERROR - Animal not found in memory after add!');
    return;
  }
  
  // Save to storage
  console.log('➕ ADD: About to save to storage...');
  saveAnimalsToStorage(animals);
  
  // Final verification
  console.log('➕ ADD: ========== FINAL VERIFICATION ==========');
  const finalVerification = getAllAnimals();
  console.log('➕ ADD: Final verification count:', finalVerification.length);
  console.log('➕ ADD: Final verification IDs:', finalVerification.map(a => a.id));
  
  if (finalVerification.find(a => a.id === animal.id)) {
    console.log('✅ ADD: SUCCESS - Animal verified in final check');
  } else {
    console.error('❌ ADD: CRITICAL ERROR - Animal missing in final verification!');
  }
  
  console.log('➕ ADD: ========== ADD OPERATION COMPLETE ==========');
};

export const deleteAnimal = (id: string): boolean => {
  console.log('🗑️ DELETE: Attempting to delete animal:', id);
  
  if (animals[id]) {
    console.log('🗑️ DELETE: Animal found, deleting...');
    delete animals[id];
    saveAnimalsToStorage(animals);
    console.log('✅ DELETE: Animal deleted successfully');
    return true;
  }
  
  console.log('❌ DELETE: Failed to delete animal - not found:', id);
  return false;
};

export const getAnimalCountBySpecies = (): Record<string, number> => {
  const allAnimals = getAllAnimals();
  const counts: Record<string, number> = {};
  
  allAnimals.forEach(animal => {
    counts[animal.species] = (counts[animal.species] || 0) + 1;
  });
  
  return counts;
};

export const getAnimalsBySpecies = (species: string): Animal[] => {
  const allAnimals = getAllAnimals();
  return allAnimals.filter(animal => animal.species === species);
};

export const getAnimalsByHealthStatus = (status: string): Animal[] => {
  const allAnimals = getAllAnimals();
  return allAnimals.filter(animal => animal.healthStatus === status);
};

export const searchAnimals = (query: string): Animal[] => {
  const allAnimals = getAllAnimals();
  const lowercaseQuery = query.toLowerCase();
  return allAnimals.filter(animal => 
    animal.name.toLowerCase().includes(lowercaseQuery) ||
    animal.tag.toLowerCase().includes(lowercaseQuery) ||
    animal.species.toLowerCase().includes(lowercaseQuery) ||
    animal.breed.toLowerCase().includes(lowercaseQuery)
  );
};

export const clearAllAnimals = (): void => {
  console.log('🗑️ CLEAR: Clearing all animals');
  animals = {};
  saveAnimalsToStorage(animals);
  console.log('✅ CLEAR: All animals cleared');
};

export const debugStore = () => {
  console.log('🐛 DEBUG: ========== STORE DEBUG INFO ==========');
  console.log('🐛 DEBUG: Animals in memory:', Object.keys(animals).length);
  console.log('🐛 DEBUG: Animal IDs in memory:', Object.keys(animals));
  
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    try {
      const parsed = JSON.parse(storage);
      console.log('🐛 DEBUG: Animals in storage:', Object.keys(parsed).length);
      console.log('🐛 DEBUG: Animal IDs in storage:', Object.keys(parsed));
      console.log('🐛 DEBUG: Storage size:', storage.length, 'characters');
    } catch (e) {
      console.log('🐛 DEBUG: Storage parse error:', e);
    }
  } else {
    console.log('🐛 DEBUG: No data in storage');
  }
  console.log('🐛 DEBUG: ========================================');
};
