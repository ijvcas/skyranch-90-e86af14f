
import { supabase } from '@/integrations/supabase/client';
import { getAllAnimals } from '@/services/animalService';

interface OffspringAnimalData {
  breedingRecordId: string;
  motherId: string;
  fatherId: string;
  actualBirthDate: string;
  offspringCount: number;
  userId: string;
}

// Species-specific birth weight defaults (in kg)
const BIRTH_WEIGHT_DEFAULTS = {
  bovino: 35,
  ovino: 4,
  caprino: 3,
  porcino: 1.5,
  equino: 45,
  aviar: 0.05,
  canine: 0.5
};

// Generate unique tag based on existing patterns
const generateUniqueTag = async (userId: string, prefix: string = 'CRIA'): Promise<string> => {
  const { data: animals } = await supabase
    .from('animals')
    .select('tag')
    .eq('user_id', userId)
    .like('tag', `${prefix}%`);

  const existingTags = animals?.map(a => a.tag) || [];
  let counter = 1;
  let newTag = `${prefix}${counter.toString().padStart(3, '0')}`;
  
  while (existingTags.includes(newTag)) {
    counter++;
    newTag = `${prefix}${counter.toString().padStart(3, '0')}`;
  }
  
  return newTag;
};

export const createOffspringAnimals = async (data: OffspringAnimalData): Promise<string[]> => {
  console.log('🍼 Starting automatic offspring animal creation for breeding record:', data.breedingRecordId);
  
  // Check if animals already exist for this breeding record
  const { data: existingOffspring } = await supabase
    .from('offspring')
    .select('animal_id')
    .eq('breeding_record_id', data.breedingRecordId)
    .not('animal_id', 'is', null);

  if (existingOffspring && existingOffspring.length > 0) {
    console.log('⚠️ Animals already exist for this breeding record, skipping creation');
    return existingOffspring.map(o => o.animal_id!).filter(Boolean);
  }

  try {
    // Get parent animals to inherit information
    const allAnimals = await getAllAnimals();
    const mother = allAnimals.find(a => a.id === data.motherId);
    const father = allAnimals.find(a => a.id === data.fatherId);

    if (!mother) {
      throw new Error('Mother animal not found');
    }

    const species = mother.species;
    const birthWeight = BIRTH_WEIGHT_DEFAULTS[species as keyof typeof BIRTH_WEIGHT_DEFAULTS] || 1;
    
    const createdAnimalIds: string[] = [];

    // Create animals for each offspring
    for (let i = 1; i <= data.offspringCount; i++) {
      const uniqueTag = await generateUniqueTag(data.userId);
      const animalName = `Cría de ${mother.name} #${i}`;

      const { data: newAnimal, error: animalError } = await supabase
        .from('animals')
        .insert({
          user_id: data.userId,
          name: animalName,
          tag: uniqueTag,
          species: species,
          breed: mother.breed || null,
          birth_date: data.actualBirthDate,
          gender: null, // To be determined later
          weight: birthWeight,
          color: null, // To be determined later
          mother_id: data.motherId,
          father_id: data.fatherId,
          health_status: 'healthy',
          notes: `Creado automáticamente desde registro de apareamiento ${data.breedingRecordId}`
        })
        .select('id')
        .single();

      if (animalError) {
        console.error('Error creating animal:', animalError);
        throw animalError;
      }

      if (newAnimal) {
        createdAnimalIds.push(newAnimal.id);
        console.log(`✅ Created animal: ${animalName} (ID: ${newAnimal.id})`);

        // Create offspring record linking to the breeding record
        const { error: offspringError } = await supabase
          .from('offspring')
          .insert({
            breeding_record_id: data.breedingRecordId,
            animal_id: newAnimal.id,
            birth_weight: birthWeight,
            birth_status: 'alive',
            notes: 'Registro automático'
          });

        if (offspringError) {
          console.error('Error creating offspring record:', offspringError);
          // Don't throw here as the animal was created successfully
        }
      }
    }

    console.log(`🎉 Successfully created ${createdAnimalIds.length} offspring animals`);
    return createdAnimalIds;
    
  } catch (error) {
    console.error('Error in createOffspringAnimals:', error);
    throw error;
  }
};

export const getOffspringAnimalsForBreeding = async (breedingRecordId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('offspring')
    .select(`
      *,
      animals:animal_id (
        id,
        name,
        tag,
        species,
        breed,
        birth_date,
        gender,
        weight,
        color,
        health_status
      )
    `)
    .eq('breeding_record_id', breedingRecordId);

  if (error) {
    console.error('Error fetching offspring animals:', error);
    return [];
  }

  return data || [];
};
