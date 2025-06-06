
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
  
  // Search by name or tag
  console.log(`🔍 Searching by name/tag: "${cleanInput}"`);
  try {
    const { data, error } = await supabase
      .from('animals')
      .select('id, name, tag')
      .or(`name.ilike.%${cleanInput}%,tag.ilike.%${cleanInput}%`)
      .limit(1);
      
    if (error) {
      console.error(`❌ Search error:`, error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log(`❌ No animal found for: "${cleanInput}"`);
      return null;
    }
    
    console.log(`✅ Found animal: ${data[0].name} (${data[0].tag}) -> ${data[0].id}`);
    return data[0].id;
  } catch (error) {
    console.error('❌ Search exception:', error);
    return null;
  }
};

export const getAnimalNameById = async (animalId: string): Promise<string> => {
  if (!animalId || !isValidUUID(animalId)) {
    return '';
  }

  try {
    const { data, error } = await supabase
      .from('animals')
      .select('name, tag')
      .eq('id', animalId)
      .single();
      
    if (error || !data) {
      return '';
    }
    
    return data.name && data.tag ? `${data.name} (${data.tag})` : data.name || data.tag || '';
  } catch (error) {
    console.error('❌ Error getting animal name:', error);
    return '';
  }
};
