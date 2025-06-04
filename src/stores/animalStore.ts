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
    console.log('🔍 LOAD: Raw stored data preview:', stored?.substring(0, 200) || 'null');
    
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('🔍 LOAD: Parsed data type:', typeof parsed);
      console.log('🔍 LOAD: Parsed data keys:', Object.keys(parsed));
      console.log('🔍 LOAD: Animal count from parsed data:', Object.keys(parsed).length);
      
      // Log each animal
      Object.values(parsed).forEach((animal: any, index) => {
        console.log(`🔍 LOAD: Animal ${index + 1}:`, {
          id: animal.id,
          name: animal.name,
          tag: animal.tag
        });
      });
      
      console.log('✅ LOAD: Successfully loaded animals from storage:', Object.keys(parsed).length);
      return parsed;
    }
  } catch (error) {
    console.error('❌ LOAD: Error loading from storage:', error);
  }
  
  console.log('⚠️ LOAD: No valid data found, starting with empty store');
  return {};
};

// Simple saving function with extensive debugging
const saveAnimalsToStorage = (animals: Record<string, Animal>): void => {
  console.log('💾 SAVE: Starting to save animals to storage...');
  console.log('💾 SAVE: Animals to save count:', Object.keys(animals).length);
  
  // Log each animal being saved
  Object.values(animals).forEach((animal, index) => {
    console.log(`💾 SAVE: Animal ${index + 1} being saved:`, {
      id: animal.id,
      name: animal.name,
      tag: animal.tag
    });
  });
  
  try {
    const dataToSave = JSON.stringify(animals);
    console.log('💾 SAVE: JSON string length:', dataToSave.length);
    console.log('💾 SAVE: JSON preview:', dataToSave.substring(0, 200));
    
    localStorage.setItem(STORAGE_KEY, dataToSave);
    console.log('✅ SAVE: Successfully saved to localStorage');
    
    // Immediate verification
    const verification = localStorage.getItem(STORAGE_KEY);
    if (verification) {
      const verifiedData = JSON.parse(verification);
      console.log('✅ SAVE: Verification successful - count:', Object.keys(verifiedData).length);
      
      if (Object.keys(verifiedData).length !== Object.keys(animals).length) {
        console.error('❌ SAVE: VERIFICATION FAILED! Saved count does not match!');
        console.error('❌ SAVE: Expected:', Object.keys(animals).length);
        console.error('❌ SAVE: Actually saved:', Object.keys(verifiedData).length);
      }
    } else {
      console.error('❌ SAVE: VERIFICATION FAILED! No data found after save!');
    }
    
  } catch (error) {
    console.error('❌ SAVE: Error saving to storage:', error);
  }
};

// Load existing data from localStorage
let animals: Record<string, Animal> = loadAnimalsFromStorage();

console.log('🚀 Animal store initialized with', Object.keys(animals).length, 'animals');

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
  console.log('➕ ADD: Starting to add animal...');
  console.log('➕ ADD: Animal data:', { id: animal.id, name: animal.name, tag: animal.tag });
  console.log('➕ ADD: Current count before add:', Object.keys(animals).length);
  console.log('➕ ADD: Current animal IDs before add:', Object.keys(animals));
  
  // Add to memory
  animals[animal.id] = { ...animal };
  
  console.log('➕ ADD: Animal added to memory');
  console.log('➕ ADD: New count in memory:', Object.keys(animals).length);
  console.log('➕ ADD: All animal IDs in memory:', Object.keys(animals));
  
  // Save to storage
  console.log('➕ ADD: About to save to storage...');
  saveAnimalsToStorage(animals);
  
  // Double verification
  console.log('➕ ADD: Performing post-save verification...');
  const verification = getAllAnimals();
  console.log('➕ ADD: Verification count:', verification.length);
  
  if (verification.find(a => a.id === animal.id)) {
    console.log('✅ ADD: Animal successfully verified in storage');
  } else {
    console.error('❌ ADD: CRITICAL ERROR - Animal not found after save!');
  }
  
  console.log('✅ ADD: Animal add operation complete');
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
  console.log('🐛 DEBUG: Animals in memory:', Object.keys(animals).length);
  console.log('🐛 DEBUG: Animal IDs in memory:', Object.keys(animals));
  
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    try {
      const parsed = JSON.parse(storage);
      console.log('🐛 DEBUG: Animals in storage:', Object.keys(parsed).length);
      console.log('🐛 DEBUG: Animal IDs in storage:', Object.keys(parsed));
    } catch (e) {
      console.log('🐛 DEBUG: Storage parse error:', e);
    }
  } else {
    console.log('🐛 DEBUG: No data in storage');
  }
};
