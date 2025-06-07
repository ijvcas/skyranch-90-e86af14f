
import { supabase } from '@/integrations/supabase/client';
import { isValidUUID } from './animalValidation';

export const processParentId = async (parentInput: string | undefined | null): Promise<string | null> => {
  console.log('🔍 Processing parent input:', parentInput);
  
  // Handle empty/null/undefined cases
  if (!parentInput || 
      parentInput.trim() === '' || 
      parentInput === 'undefined' || 
      parentInput === 'null' ||
      parentInput === 'NULL') {
    console.log('🔍 Parent input is empty, returning null');
    return null;
  }
  
  const cleanInput = parentInput.trim();
  console.log('🔍 Clean input:', cleanInput);
  
  // If it's already a valid UUID, verify it exists and return it
  if (isValidUUID(cleanInput)) {
    console.log('🔍 Input is UUID, verifying existence...');
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('id')
        .eq('id', cleanInput)
        .single();
      
      if (!error && data) {
        console.log('🔍 UUID exists in database, returning:', cleanInput);
        return cleanInput;
      } else {
        console.log('🔍 UUID not found in database, returning as text:', cleanInput);
        return cleanInput; // Return the UUID as text if not found
      }
    } catch (error) {
      console.error('Error verifying UUID:', error);
      console.log('🔍 Error verifying UUID, returning as text:', cleanInput);
      return cleanInput; // Return as text if there's an error
    }
  }
  
  // Search by name or tag for registered animals (optimized query)
  console.log('🔍 Searching for registered animal by name/tag...');
  try {
    const { data, error } = await supabase
      .from('animals')
      .select('id')
      .or(`name.ilike.%${cleanInput}%,tag.ilike.%${cleanInput}%`)
      .limit(1)
      .single();
      
    if (!error && data) {
      console.log('🔍 Found registered animal, returning ID:', data.id);
      return data.id;
    }
    
    // If no registered animal found, store the name as-is
    console.log('🔍 No registered animal found, storing name as text:', cleanInput);
    return cleanInput;
  } catch (error) {
    // Still return the original input so the name is preserved
    console.log('🔍 Error searching for animal, storing name as text:', cleanInput);
    return cleanInput;
  }
};

export const getAnimalNameById = async (animalId: string): Promise<string> => {
  console.log('🔍 Getting display name for:', animalId);
  
  if (!animalId) {
    return '';
  }

  // If it's not a UUID, it's probably already a name, so return it
  if (!isValidUUID(animalId)) {
    console.log('🔍 Not a UUID, returning as name:', animalId);
    return animalId;
  }

  try {
    const { data, error } = await supabase
      .from('animals')
      .select('name, tag')
      .eq('id', animalId)
      .single();
      
    if (error || !data) {
      console.log('🔍 Animal not found, returning ID as name:', animalId);
      return animalId;
    }
    
    const displayName = data.name && data.tag ? `${data.name} (${data.tag})` : data.name || data.tag || animalId;
    console.log('🔍 Found animal, returning display name:', displayName);
    return displayName;
  } catch (error) {
    console.log('🔍 Error fetching animal, returning ID as name:', animalId);
    return animalId;
  }
};
