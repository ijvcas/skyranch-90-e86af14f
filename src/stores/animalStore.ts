
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
      return parsed;
    }
  } catch (error) {
    console.error('Error loading animals from storage:', error);
  }
  return {};
};

const saveAnimalsToStorage = (animals: Record<string, Animal>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(animals));
    console.log('Saved animals to storage:', Object.keys(animals).length, 'animals');
  } catch (error) {
    console.error('Error saving animals to storage:', error);
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
  return allAnimals;
};

export const updateAnimal = (id: string, updatedData: Omit<Animal, 'id'>): boolean => {
  if (animals[id]) {
    animals[id] = { id, ...updatedData };
    saveAnimalsToStorage(animals);
    console.log('Animal updated in store:', animals[id]);
    return true;
  }
  console.log('Failed to update animal - not found:', id);
  return false;
};

export const addAnimal = (animal: Animal): void => {
  animals[animal.id] = animal;
  saveAnimalsToStorage(animals);
  console.log('Animal added to store:', animal);
  console.log('Total animals in store:', Object.keys(animals).length);
};

export const deleteAnimal = (id: string): boolean => {
  if (animals[id]) {
    delete animals[id];
    saveAnimalsToStorage(animals);
    console.log('Animal deleted from store:', id);
    console.log('Remaining animals in store:', Object.keys(animals).length);
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
  animals = {};
  saveAnimalsToStorage(animals);
  console.log('All animals cleared from store');
};

// Debug function to check store state
export const debugStore = () => {
  console.log('Current store state:');
  console.log('Animals count:', Object.keys(animals).length);
  console.log('Animals:', animals);
  console.log('localStorage data:', localStorage.getItem(STORAGE_KEY));
};
