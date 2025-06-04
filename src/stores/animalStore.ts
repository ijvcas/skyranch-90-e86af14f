
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

// Empty data storage - no mock data
let animals: Record<string, Animal> = {};

export const getAnimal = (id: string): Animal | null => {
  return animals[id] || null;
};

export const getAllAnimals = (): Animal[] => {
  return Object.values(animals);
};

export const updateAnimal = (id: string, updatedData: Omit<Animal, 'id'>): boolean => {
  if (animals[id]) {
    animals[id] = { id, ...updatedData };
    console.log('Animal updated in store:', animals[id]);
    return true;
  }
  return false;
};

export const addAnimal = (animal: Animal): void => {
  animals[animal.id] = animal;
  console.log('Animal added to store:', animal);
};

export const getAnimalCountBySpecies = (): Record<string, number> => {
  const allAnimals = getAllAnimals();
  const counts: Record<string, number> = {};
  
  allAnimals.forEach(animal => {
    counts[animal.species] = (counts[animal.species] || 0) + 1;
  });
  
  return counts;
};
