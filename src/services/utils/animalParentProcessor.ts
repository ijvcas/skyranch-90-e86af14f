import { supabase } from '@/integrations/supabase/client';
import { isValidUUID } from './animalValidation';

// Helper function to find animal by name or tag
export const findAnimalByNameOrTag = async (searchTerm: string): Promise<string | null> => {
  if (!searchTerm || searchTerm.trim() === '') return null;
  
  console.log(`Searching for animal with term: "${searchTerm}"`);
  
  const { data, error } = await supabase
    .from('animals')
    .select('id, name, tag')
    .or(`name.ilike.%${searchTerm}%,tag.ilike.%${searchTerm}%`)
    .limit(1);
    
  if (error) {
    console.error(`Error searching for animal: ${error.message}`);
    return null;
  }
  
  if (!data || data.length === 0) {
    console.log(`No animal found for search term: ${searchTerm}`);
    return null;
  }
  
  console.log(`Found animal:`, data[0]);
  return data[0].id;
};

// Process parent IDs: try to find by UUID first, then by name/tag
export const processParentId = async (parentInput: string): Promise<string | null> => {
  if (!parentInput || parentInput.trim() === '') return null;
  
  console.log(`Processing parent input: "${parentInput}"`);
  
  // If it's a valid UUID, verify it exists in database
  if (isValidUUID(parentInput)) {
    console.log(`Verifying UUID exists: ${parentInput}`);
    const { data, error } = await supabase
      .from('animals')
      .select('id')
      .eq('id', parentInput)
      .single();
    
    if (!error && data) {
      console.log(`UUID verified: ${parentInput}`);
      return parentInput;
    } else {
      console.log(`UUID not found in database: ${parentInput}`);
    }
  }
  
  // Otherwise, search by name or tag
  const foundId = await findAnimalByNameOrTag(parentInput);
  console.log(`Searched for "${parentInput}", found ID: ${foundId}`);
  return foundId;
};

// Helper function to get animal name by ID for display purposes
export const getAnimalNameById = async (animalId: string): Promise<string> => {
  if (!animalId || animalId.trim() === '') {
    console.log('Empty animal ID provided');
    return '';
  }

  if (!isValidUUID(animalId)) {
    console.log(`Invalid UUID format: ${animalId}`);
    return '';
  }

  console.log(`Getting animal name for ID: ${animalId}`);
  
  const { data, error } = await supabase
    .from('animals')
    .select('name, tag')
    .eq('id', animalId)
    .single();
    
  if (error || !data) {
    console.log(`No animal found for ID: ${animalId}`, error?.message);
    return '';
  }
  
  const displayName = `${data.name} (${data.tag})`;
  console.log(`Found animal name: ${displayName}`);
  return displayName;
};
