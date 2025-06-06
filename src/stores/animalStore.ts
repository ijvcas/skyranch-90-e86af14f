
import { create } from 'zustand';

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
  maternalGrandmotherId?: string;
  maternalGrandfatherId?: string;
  paternalGrandmotherId?: string;
  paternalGrandfatherId?: string;
  healthStatus: string;
  notes: string;
  image: string | null;
}

interface AnimalStore {
  animals: Animal[];
  addAnimal: (animal: Animal) => void;
  updateAnimal: (id: string, animal: Animal) => void;
  deleteAnimal: (id: string) => void;
  getAnimal: (id: string) => Animal | undefined;
}

export const useAnimalStore = create<AnimalStore>((set, get) => ({
  animals: [],
  addAnimal: (animal) =>
    set((state) => ({ animals: [...state.animals, animal] })),
  updateAnimal: (id, updatedAnimal) =>
    set((state) => ({
      animals: state.animals.map((animal) =>
        animal.id === id ? updatedAnimal : animal
      ),
    })),
  deleteAnimal: (id) =>
    set((state) => ({
      animals: state.animals.filter((animal) => animal.id !== id),
    })),
  getAnimal: (id) => get().animals.find((animal) => animal.id === id),
}));
