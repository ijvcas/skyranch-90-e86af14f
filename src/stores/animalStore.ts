
// Simple animal data store with reliable localStorage persistence
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

const STORAGE_KEY = 'skyranch_animals';

// Simple in-memory store
let animals: Animal[] = [];

// Enhanced logging for live debugging
const debugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`🔍 [${timestamp}] [AnimalStore] ${message}`, data || '');
  
  // Check localStorage availability
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    console.log('✅ localStorage is available');
  } catch (e) {
    console.error('❌ localStorage is NOT available:', e);
  }
  
  // Log current storage state
  try {
    const currentStorage = localStorage.getItem(STORAGE_KEY);
    console.log('📦 Current localStorage data:', currentStorage ? `${JSON.parse(currentStorage).length} animals` : 'empty');
  } catch (e) {
    console.log('📦 localStorage read error:', e);
  }
};

// Simple save function
const saveAnimals = (): boolean => {
  try {
    debugLog('🔄 Attempting to save animals', `${animals.length} animals`);
    
    const dataToSave = JSON.stringify(animals);
    debugLog('📝 Data to save:', dataToSave.substring(0, 200) + '...');
    
    localStorage.setItem(STORAGE_KEY, dataToSave);
    debugLog('✅ Data saved successfully');
    
    // Immediate verification
    const verification = localStorage.getItem(STORAGE_KEY);
    if (verification) {
      const verified = JSON.parse(verification);
      debugLog('✅ Save verified', `${verified.length} animals recovered`);
      return true;
    } else {
      debugLog('❌ Verification failed: no data found after save');
      return false;
    }
  } catch (error) {
    debugLog('❌ Save failed', error);
    console.error('Full save error:', error);
    return false;
  }
};

// Simple load function
const loadAnimals = (): void => {
  try {
    debugLog('🔄 Loading animals from localStorage');
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      debugLog('📂 Found stored data');
      const parsed = JSON.parse(stored);
      
      if (Array.isArray(parsed)) {
        animals = parsed;
        debugLog('✅ Successfully loaded animals', `${animals.length} animals`);
        
        // Log sample for verification
        if (animals.length > 0) {
          console.log('🐄 Sample loaded animals:', animals.slice(0, 2).map(a => ({ id: a.id, name: a.name })));
        }
      } else {
        debugLog('❌ Invalid data format, resetting');
        animals = [];
      }
    } else {
      animals = [];
      debugLog('ℹ️ No stored data found, starting fresh');
    }
  } catch (error) {
    debugLog('❌ Load failed', error);
    animals = [];
  }
};

// Initialize on module load
debugLog('🚀 Initializing animal store...');
loadAnimals();

export const getAllAnimals = (): Animal[] => {
  debugLog('📋 Getting all animals', `returning ${animals.length} animals`);
  return [...animals];
};

export const getAnimal = (id: string): Animal | null => {
  const animal = animals.find(animal => animal.id === id) || null;
  debugLog('🔍 Getting animal by ID', `${id}: ${animal ? 'found' : 'not found'}`);
  return animal;
};

export const addAnimal = async (animal: Animal): Promise<boolean> => {
  debugLog('➕ Adding animal', `${animal.name} (ID: ${animal.id})`);
  
  // Remove any existing animal with same ID
  const initialLength = animals.length;
  animals = animals.filter(a => a.id !== animal.id);
  
  // Add the new animal
  animals.push(animal);
  
  debugLog('📊 Animals count', `${animals.length} (was ${initialLength})`);
  
  const saved = saveAnimals();
  debugLog('💾 Add result', saved ? 'success' : 'failed');
  
  return saved;
};

export const updateAnimal = async (id: string, updatedData: Omit<Animal, 'id'>): Promise<boolean> => {
  debugLog('✏️ Updating animal', id);
  const index = animals.findIndex(animal => animal.id === id);
  
  if (index !== -1) {
    animals[index] = { id, ...updatedData };
    debugLog('✅ Animal updated in memory', animals[index].name);
    
    const saved = saveAnimals();
    debugLog('💾 Update result', saved ? 'success' : 'failed');
    return saved;
  }
  
  debugLog('❌ Animal not found for update', id);
  return false;
};

export const deleteAnimal = async (id: string): Promise<boolean> => {
  const initialLength = animals.length;
  animals = animals.filter(animal => animal.id !== id);
  const deleted = animals.length < initialLength;
  
  if (deleted) {
    debugLog('🗑️ Animal deleted', id);
    const saved = saveAnimals();
    debugLog('💾 Delete result', saved ? 'success' : 'failed');
    return saved;
  }
  
  debugLog('❌ Animal not found for delete', id);
  return false;
};

export const searchAnimals = (query: string): Animal[] => {
  const lowercaseQuery = query.toLowerCase();
  return animals.filter(animal => 
    animal.name.toLowerCase().includes(lowercaseQuery) ||
    animal.tag.toLowerCase().includes(lowercaseQuery) ||
    animal.species.toLowerCase().includes(lowercaseQuery) ||
    animal.breed.toLowerCase().includes(lowercaseQuery)
  );
};

// Debug function to check storage manually
export const debugStorage = (): void => {
  debugLog('=== MANUAL STORAGE DEBUG ===');
  console.log('🔍 In-memory animals:', animals.length);
  console.log('🔍 Raw in-memory data:', animals);
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('🔍 Raw localStorage data:', stored);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('🔍 Parsed localStorage data:', parsed);
      console.log('🔍 Parsed count:', Array.isArray(parsed) ? parsed.length : 'not array');
    }
  } catch (e) {
    console.log('🔍 localStorage error:', e);
  }
  
  debugLog('=== END MANUAL DEBUG ===');
};

// Auto-check storage on window focus (for debugging live issues)
if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    debugLog('🔄 Window focus - checking storage consistency');
    loadAnimals();
  });
}
