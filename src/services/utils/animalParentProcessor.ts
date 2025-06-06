import { supabase } from '@/integrations/supabase/client';
import { isValidUUID } from './animalValidation';

// Helper function to find animal by name or tag
export const findAnimalByNameOrTag = async (searchTerm: string): Promise<string | null> => {
  if (!searchTerm || searchTerm.trim() === '' || searchTerm === 'undefined' || searchTerm === 'null') {
    console.log('Empty or invalid search term provided:', searchTerm);
    return null;
  }
  
  const cleanSearchTerm = searchTerm.trim();
  console.log(`🔍 Searching for animal with term: "${cleanSearchTerm}"`);
  
  try {
    const { data, error } = await supabase
      .from('animals')
      .select('id, name, tag')
      .or(`name.ilike.%${cleanSearchTerm}%,tag.ilike.%${cleanSearchTerm}%`)
      .limit(1);
      
    if (error) {
      console.error(`❌ Error searching for animal: ${error.message}`);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log(`❌ No animal found for search term: "${cleanSearchTerm}"`);
      return null;
    }
    
    console.log(`✅ Found animal:`, data[0]);
    return data[0].id;
  } catch (error) {
    console.error('❌ Exception in findAnimalByNameOrTag:', error);
    return null;
  }
};

// Process parent IDs: try to find by UUID first, then by name/tag
export const processParentId = async (parentInput: string | undefined | null): Promise<string | null> => {
  console.log(`🔄 Processing parent input: "${parentInput}" (type: ${typeof parentInput})`);
  
  // Handle all empty/invalid cases
  if (!parentInput || 
      parentInput.trim() === '' || 
      parentInput === 'undefined' || 
      parentInput === 'null' ||
      parentInput === 'NULL') {
    console.log('✅ Empty parent input, returning null');
    return null;
  }
  
  const cleanInput = parentInput.trim();
  console.log(`🔄 Clean input: "${cleanInput}"`);
  
  // If it's a valid UUID, verify it exists in database
  if (isValidUUID(cleanInput)) {
    console.log(`🔍 Input is valid UUID, verifying existence: ${cleanInput}`);
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('id, name, tag')
        .eq('id', cleanInput)
        .single();
      
      if (!error && data) {
        console.log(`✅ UUID verified and exists: ${cleanInput} (${data.name})`);
        return cleanInput;
      } else {
        console.log(`❌ UUID not found in database: ${cleanInput}`, error?.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Exception verifying UUID:', error);
      return null;
    }
  }
  
  // Otherwise, search by name or tag
  console.log(`🔍 Not a UUID, searching by name/tag: "${cleanInput}"`);
  const foundId = await findAnimalByNameOrTag(cleanInput);
  console.log(`📝 Search result for "${cleanInput}": ${foundId}`);
  return foundId;
};

// Helper function to get animal name by ID for display purposes
export const getAnimalNameById = async (animalId: string): Promise<string> => {
  console.log(`🔍 Getting animal name for ID: "${animalId}" (type: ${typeof animalId})`);
  
  if (!animalId || 
      animalId.trim() === '' || 
      animalId === 'undefined' || 
      animalId === 'null' ||
      animalId === 'NULL') {
    console.log('❌ Empty or invalid animal ID provided');
    return '';
  }

  const cleanId = animalId.trim();
  
  if (!isValidUUID(cleanId)) {
    console.log(`❌ Invalid UUID format: ${cleanId}`);
    return '';
  }

  try {
    const { data, error } = await supabase
      .from('animals')
      .select('name, tag')
      .eq('id', cleanId)
      .single();
      
    if (error || !data) {
      console.log(`❌ No animal found for ID: ${cleanId}`, error?.message);
      return '';
    }
    
    const displayName = data.name && data.tag ? `${data.name} (${data.tag})` : data.name || data.tag || '';
    console.log(`✅ Found animal name: "${displayName}"`);
    return displayName;
  } catch (error) {
    console.error('❌ Exception getting animal name:', error);
    return '';
  }
};
