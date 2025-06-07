
import { supabase } from '@/integrations/supabase/client';
import { isValidUUID } from './animalValidation';

export const processParentId = async (parentInput: string | undefined | null): Promise<string | null> => {
  console.log(`🔄 Processing parent input: "${parentInput}"`);
  
  // Handle empty/null/undefined cases
  if (!parentInput || 
      parentInput.trim() === '' || 
      parentInput === 'undefined' || 
      parentInput === 'null' ||
      parentInput === 'NULL') {
    console.log('✅ Empty parent input, returning null');
    return null;
  }
  
  const cleanInput = parentInput.trim();
  
  // If it's already a valid UUID, verify it exists and return it
  if (isValidUUID(cleanInput)) {
    console.log(`🔍 Input is UUID, verifying: ${cleanInput}`);
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('id, name, tag')
        .eq('id', cleanInput)
        .single();
      
      if (!error && data) {
        console.log(`✅ UUID verified: ${cleanInput}`);
        return cleanInput;
      } else {
        console.log(`❌ UUID not found: ${cleanInput}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Error verifying UUID:', error);
      return null;
    }
  }
  
  // Search by name or tag for registered animals
  console.log(`🔍 Searching by name/tag: "${cleanInput}"`);
  try {
    const { data, error } = await supabase
      .from('animals')
      .select('id, name, tag')
      .or(`name.ilike.%${cleanInput}%,tag.ilike.%${cleanInput}%`)
      .limit(1);
      
    if (error) {
      console.error(`❌ Search error:`, error);
      // Don't return null here - we'll store the name as-is
    }
    
    if (data && data.length > 0) {
      console.log(`✅ Found registered animal: ${data[0].name} (${data[0].tag}) -> ${data[0].id}`);
      return data[0].id;
    }
    
    // If no registered animal found, we'll store the name as-is
    // This allows for unregistered parent names
    console.log(`ℹ️ No registered animal found for "${cleanInput}", storing as name`);
    return cleanInput;
  } catch (error) {
    console.error('❌ Search exception:', error);
    // Still return the original input so the name is preserved
    return cleanInput;
  }
};

export const getAnimalNameById = async (animalId: string): Promise<string> => {
  if (!animalId) {
    return '';
  }

  // If it's not a UUID, it's probably already a name, so return it
  if (!isValidUUID(animalId)) {
    return animalId;
  }

  try {
    const { data, error } = await supabase
      .from('animals')
      .select('name, tag')
      .eq('id', animalId)
      .single();
      
    if (error || !data) {
      // If we can't find the animal by ID, it might be stored as a name
      return animalId;
    }
    
    return data.name && data.tag ? `${data.name} (${data.tag})` : data.name || data.tag || animalId;
  } catch (error) {
    console.error('❌ Error getting animal name:', error);
    return animalId;
  }
};
