
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
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('✅ Loaded animals from storage:', Object.keys(parsed).length);
      return parsed;
    }
  } catch (error) {
    console.error('❌ Error loading from storage:', error);
  }
  
  console.log('⚠️ No valid data found, starting with empty store');
  return {};
};

// Simple saving function
const saveAnimalsToStorage = (animals: Record<string, Animal>): void => {
  try {
    const dataToSave = JSON.stringify(animals);
    localStorage.setItem(STORAGE_KEY, dataToSave);
    console.log('✅ Saved', Object.keys(animals).length, 'animals to storage');
  } catch (error) {
    console.error('❌ Error saving to storage:', error);
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
  console.log('📋 Getting all animals, count:', allAnimals.length);
  return allAnimals;
};

export const updateAnimal = (id: string, updatedData: Omit<Animal, 'id'>): boolean => {
  if (animals[id]) {
    console.log('✏️ Updating animal:', id);
    animals[id] = { id, ...updatedData };
    saveAnimalsToStorage(animals);
    console.log('✅ Animal updated');
    return true;
  }
  console.log('❌ Failed to update animal - not found:', id);
  return false;
};

export const addAnimal = (animal: Animal): void => {
  console.log('➕ Adding animal:', animal.id, animal.name);
  console.log('➕ Current count before add:', Object.keys(animals).length);
  
  // Add to memory
  animals[animal.id] = { ...animal };
  
  console.log('➕ Memory updated, new count:', Object.keys(animals).length);
  console.log('➕ All animals in memory:', Object.keys(animals));
  
  // Save to storage
  saveAnimalsToStorage(animals);
  
  console.log('✅ Animal add operation complete');
};

export const deleteAnimal = (id: string): boolean => {
  if (animals[id]) {
    console.log('🗑️ Deleting animal:', id);
    delete animals[id];
    saveAnimalsToStorage(animals);
    console.log('✅ Animal deleted');
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
  console.log('🗑️ Clearing all animals');
  animals = {};
  saveAnimalsToStorage(animals);
  console.log('✅ All animals cleared');
};

export const debugStore = () => {
  console.log('🐛 Animals in memory:', Object.keys(animals).length);
  console.log('🐛 Storage check:', localStorage.getItem(STORAGE_KEY)?.length || 0, 'characters');
};
