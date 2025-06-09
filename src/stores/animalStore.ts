
import { create } from 'zustand';
import { getAllAnimals as fetchAllAnimals, getAnimal as fetchAnimal } from '@/services/animalService';

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
  current_lot_id?: string; // Added to match database schema
}

interface AnimalStore {
  animals: Animal[];
  isLoading: boolean;
  addAnimal: (animal: Animal) => void;
  updateAnimal: (id: string, animal: Animal) => void;
  deleteAnimal: (id: string) => void;
  getAnimal: (id: string) => Animal | undefined;
  getAllAnimals: () => Animal[];
  loadAnimals: () => Promise<void>;
  setAnimals: (animals: Animal[]) => void;
}

export const useAnimalStore = create<AnimalStore>((set, get) => ({
  animals: [],
  isLoading: false,
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
  getAllAnimals: () => get().animals,
  loadAnimals: async () => {
    set({ isLoading: true });
    try {
      const animals = await fetchAllAnimals();
      set({ animals, isLoading: false });
    } catch (error) {
      console.error('Error loading animals:', error);
      set({ isLoading: false });
    }
  },
  setAnimals: (animals) => set({ animals }),
}));
