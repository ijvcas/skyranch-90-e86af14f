
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

// Mock data storage
let mockAnimals: Record<string, Animal> = {
  '001': {
    id: '001',
    name: 'Dolly',
    tag: '001',
    species: 'ovino',
    breed: 'Merino',
    birthDate: '2022-03-15',
    gender: 'hembra',
    weight: '65',
    color: 'Blanco',
    motherId: '',
    fatherId: '',
    notes: 'Animal muy dócil y saludable',
    healthStatus: 'healthy',
    image: 'https://images.unsplash.com/photo-1452960962994-acf4fd70b632'
  },
  '002': {
    id: '002',
    name: 'Woolly',
    tag: '002',
    species: 'ovino',
    breed: 'Romney',
    birthDate: '2021-05-20',
    gender: 'macho',
    weight: '70',
    color: 'Gris',
    motherId: '',
    fatherId: '',
    notes: 'Buen reproductor',
    healthStatus: 'healthy',
    image: null
  },
  '003': {
    id: '003',
    name: 'Burrito',
    tag: '003',
    species: 'equino',
    breed: 'Andaluz',
    birthDate: '2019-08-10',
    gender: 'macho',
    weight: '180',
    color: 'Marrón',
    motherId: '',
    fatherId: '',
    notes: 'Animal de trabajo',
    healthStatus: 'healthy',
    image: null
  },
  '004': {
    id: '004',
    name: 'Bessie',
    tag: '004',
    species: 'bovino',
    breed: 'Holstein',
    birthDate: '2020-11-05',
    gender: 'hembra',
    weight: '520',
    color: 'Negro con manchas blancas',
    motherId: '',
    fatherId: '',
    notes: 'Excelente productora de leche',
    healthStatus: 'healthy',
    image: null
  }
};

export const getAnimal = (id: string): Animal | null => {
  return mockAnimals[id] || null;
};

export const getAllAnimals = (): Animal[] => {
  return Object.values(mockAnimals);
};

export const updateAnimal = (id: string, updatedData: Omit<Animal, 'id'>): boolean => {
  if (mockAnimals[id]) {
    mockAnimals[id] = { id, ...updatedData };
    console.log('Animal updated in store:', mockAnimals[id]);
    return true;
  }
  return false;
};

export const addAnimal = (animal: Animal): void => {
  mockAnimals[animal.id] = animal;
};
