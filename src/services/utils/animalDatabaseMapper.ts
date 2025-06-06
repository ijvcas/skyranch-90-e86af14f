
import type { Animal } from '@/stores/animalStore';

// Helper function to map Animal interface to database format
export const mapAnimalToDatabase = (animal: Omit<Animal, 'id'>, userId: string) => {
  return {
    name: animal.name,
    tag: animal.tag,
    species: animal.species,
    breed: animal.breed,
    birth_date: animal.birthDate || null,
    gender: animal.gender,
    weight: animal.weight ? parseFloat(animal.weight) : null,
    color: animal.color,
    health_status: animal.healthStatus,
    notes: animal.notes,
    image_url: animal.image,
    user_id: userId,
  };
};

// Helper function to create update object for database
export const createUpdateObject = (animal: Omit<Animal, 'id'>) => {
  return {
    name: animal.name,
    tag: animal.tag,
    species: animal.species,
    breed: animal.breed,
    birth_date: animal.birthDate || null,
    gender: animal.gender,
    weight: animal.weight ? parseFloat(animal.weight) : null,
    color: animal.color,
    health_status: animal.healthStatus,
    notes: animal.notes,
    image_url: animal.image,
  };
};
