
import type { Animal } from '@/stores/animalStore';

// Helper function to transform database row to Animal interface
export const transformAnimalData = (data: any): Animal => {
  console.log('Transforming animal data:', data);
  
  const animal = {
    id: data.id,
    name: data.name || '',
    tag: data.tag || '',
    species: data.species || 'bovino',
    breed: data.breed || '',
    birthDate: data.birth_date || '',
    gender: data.gender || '',
    weight: data.weight ? data.weight.toString() : '',
    color: data.color || '',
    motherId: data.mother_id || '',
    fatherId: data.father_id || '',
    healthStatus: data.health_status || 'healthy',
    notes: data.notes || '',
    image: data.image_url || null,
    maternalGrandmotherId: data.maternal_grandmother_id || '',
    maternalGrandfatherId: data.maternal_grandfather_id || '',
    paternalGrandmotherId: data.paternal_grandmother_id || '',
    paternalGrandfatherId: data.paternal_grandfather_id || '',
  };

  console.log('Transformed animal:', animal);
  return animal;
};
