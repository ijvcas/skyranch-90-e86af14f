
import { supabase } from '@/integrations/supabase/client';
import { isValidUUID } from './animalValidation';

export const processParentId = async (parentInput: string | undefined | null): Promise<string | null> => {
  // Handle empty/null/undefined cases
  if (!parentInput || 
      parentInput.trim() === '' || 
      parentInput === 'undefined' || 
      parentInput === 'null' ||
      parentInput === 'NULL') {
    return null;
  }
  
  const cleanInput = parentInput.trim();
  
  // If it's already a valid UUID, verify it exists and return it
  if (isValidUUID(cleanInput)) {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('id')
        .eq('id', cleanInput)
        .single();
      
      if (!error && data) {
        return cleanInput;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error verifying UUID:', error);
      return null;
    }
  }
  
  // Search by name or tag for registered animals (optimized query)
  try {
    const { data, error } = await supabase
      .from('animals')
      .select('id')
      .or(`name.ilike.%${cleanInput}%,tag.ilike.%${cleanInput}%`)
      .limit(1)
      .single();
      
    if (error) {
      // Don't log search errors for performance
    }
    
    if (data) {
      return data.id;
    }
    
    // If no registered animal found, store the name as-is
    return cleanInput;
  } catch (error) {
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
      return animalId;
    }
    
    return data.name && data.tag ? `${data.name} (${data.tag})` : data.name || data.tag || animalId;
  } catch (error) {
    return animalId;
  }
};
