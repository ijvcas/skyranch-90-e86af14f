
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

// Simple in-memory store
let animals: Animal[] = [];

// Load from localStorage on initialization
const loadAnimals = (): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      animals = Array.isArray(parsed) ? parsed : [];
      console.log('✅ Loaded animals:', animals.length);
    } else {
      animals = [];
      console.log('📝 No stored animals found, starting fresh');
    }
  } catch (error) {
    console.error('❌ Error loading animals:', error);
    animals = [];
  }
};

// Save to localStorage
const saveAnimals = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(animals));
    console.log('💾 Saved animals:', animals.length);
  } catch (error) {
    console.error('❌ Error saving animals:', error);
  }
};

// Initialize on module load
loadAnimals();

export const getAllAnimals = (): Animal[] => {
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
  animals = [];
  saveAnimals();
};
