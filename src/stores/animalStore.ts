
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

// Simple loading function
const loadAnimalsFromStorage = (): Record<string, Animal> => {
  console.log('🔍 LOAD: Loading animals from storage...');
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('🔍 LOAD: Raw stored data:', stored);
    
    if (!stored) {
      console.log('🔍 LOAD: No data found in storage');
      return {};
    }

    const parsed = JSON.parse(stored);
    console.log('🔍 LOAD: Parsed data:', parsed);
    console.log('🔍 LOAD: Parsed data type:', typeof parsed);
    console.log('🔍 LOAD: Is array?', Array.isArray(parsed));
    
    // Handle both array and object formats for backwards compatibility
    let animalsObject: Record<string, Animal> = {};
    
    if (Array.isArray(parsed)) {
      // Convert array to object
      parsed.forEach((animal: Animal) => {
        if (animal && animal.id) {
          animalsObject[animal.id] = animal;
        }
      });
    } else if (parsed && typeof parsed === 'object') {
      // Already an object, use directly
      animalsObject = parsed;
    }
    
    console.log('🔍 LOAD: Final animals object:', animalsObject);
    console.log('🔍 LOAD: Animal count:', Object.keys(animalsObject).length);
    return animalsObject;
    
  } catch (error) {
    console.error('❌ LOAD: Error loading from storage:', error);
    return {};
  }
};

// Simple saving function
const saveAnimalsToStorage = (animals: Record<string, Animal>): void => {
  console.log('💾 SAVE: Saving animals to storage...');
  console.log('💾 SAVE: Animals to save:', animals);
  console.log('💾 SAVE: Count:', Object.keys(animals).length);
  
  try {
    const dataToSave = JSON.stringify(animals);
    console.log('💾 SAVE: JSON to save:', dataToSave);
    
    localStorage.setItem(STORAGE_KEY, dataToSave);
    console.log('✅ SAVE: Data saved successfully');
    
    // Immediate verification
    const verification = localStorage.getItem(STORAGE_KEY);
    if (verification) {
      const verifiedData = JSON.parse(verification);
      console.log('✅ SAVE: Verification successful, count:', Object.keys(verifiedData).length);
    } else {
      console.error('❌ SAVE: Verification failed - no data found');
    }
    
  } catch (error) {
    console.error('❌ SAVE: Error saving to storage:', error);
  }
};

// Load existing data from localStorage
let animals: Record<string, Animal> = loadAnimalsFromStorage();

console.log('🚀 Animal store initialized with', Object.keys(animals).length, 'animals');

export const getAnimal = (id: string): Animal | null => {
  return animals[id] || null;
};

export const getAllAnimals = (): Animal[] => {
  const allAnimals = Object.values(animals);
  console.log('📋 GET ALL: Returning', allAnimals.length, 'animals');
  return allAnimals;
};

export const updateAnimal = (id: string, updatedData: Omit<Animal, 'id'>): boolean => {
  console.log('✏️ UPDATE: Updating animal:', id);
  
  if (animals[id]) {
    animals[id] = { id, ...updatedData };
    saveAnimalsToStorage(animals);
    console.log('✅ UPDATE: Animal updated successfully');
    return true;
  }
  
  console.log('❌ UPDATE: Animal not found:', id);
  return false;
};

export const addAnimal = (animal: Animal): void => {
  console.log('➕ ADD: Adding animal:', animal.id, animal.name);
  console.log('➕ ADD: Current count before:', Object.keys(animals).length);
  
  // Add to memory
  animals[animal.id] = { ...animal };
  
  console.log('➕ ADD: Added to memory, new count:', Object.keys(animals).length);
  console.log('➕ ADD: All animals now:', Object.keys(animals));
  
  // Save to storage
  saveAnimalsToStorage(animals);
  
  console.log('✅ ADD: Animal added successfully');
};

export const deleteAnimal = (id: string): boolean => {
  console.log('🗑️ DELETE: Deleting animal:', id);
  
  if (animals[id]) {
    delete animals[id];
    saveAnimalsToStorage(animals);
    console.log('✅ DELETE: Animal deleted successfully');
    return true;
  }
  
  console.log('❌ DELETE: Animal not found:', id);
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
  console.log('🐛 DEBUG: Animal IDs:', Object.keys(animals));
  
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    try {
      const parsed = JSON.parse(storage);
      console.log('🐛 DEBUG: Animals in storage:', Object.keys(parsed).length);
      console.log('🐛 DEBUG: Storage data:', parsed);
    } catch (e) {
      console.log('🐛 DEBUG: Storage parse error:', e);
    }
  } else {
    console.log('🐛 DEBUG: No data in storage');
  }
};
