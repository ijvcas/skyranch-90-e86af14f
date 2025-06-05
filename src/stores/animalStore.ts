
import { Storage } from '@capacitor/storage';

// Simple animal data store with reliable Capacitor native storage persistence
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
const BACKUP_KEY = 'skyranch_animals_backup';

// Simple in-memory store
let animals: Animal[] = [];

// Enhanced logging for live debugging
const debugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`🔍 [${timestamp}] [AnimalStore] ${message}`, data || '');
  
  // Check Capacitor Storage availability
  console.log('✅ Using Capacitor native storage');
};

// Simple save function with backup using Capacitor Storage
const saveAnimals = async (): Promise<boolean> => {
  try {
    debugLog('🔄 Attempting to save animals', `${animals.length} animals`);
    
    // Create backup before saving
    const currentData = await Storage.get({ key: STORAGE_KEY });
    if (currentData.value) {
      await Storage.set({ key: BACKUP_KEY, value: currentData.value });
      debugLog('💾 Created backup');
    }
    
    const dataToSave = JSON.stringify(animals);
    debugLog('📝 Data to save:', dataToSave.substring(0, 200) + '...');
    
    await Storage.set({ key: STORAGE_KEY, value: dataToSave });
    debugLog('✅ Data saved successfully to native storage');
    
    // Immediate verification
    const verification = await Storage.get({ key: STORAGE_KEY });
    if (verification.value) {
      const verified = JSON.parse(verification.value);
      debugLog('✅ Save verified', `${verified.length} animals recovered`);
      return true;
    } else {
      debugLog('❌ Verification failed: no data found after save');
      return false;
    }
  } catch (error) {
    debugLog('❌ Save failed', error);
    console.error('Full save error:', error);
    
    // Try to restore from backup
    try {
      const backup = await Storage.get({ key: BACKUP_KEY });
      if (backup.value) {
        await Storage.set({ key: STORAGE_KEY, value: backup.value });
        debugLog('🔄 Restored from backup');
      }
    } catch (backupError) {
      debugLog('❌ Backup restore failed', backupError);
    }
    
    return false;
  }
};

// Simple load function using Capacitor Storage
const loadAnimals = async (): Promise<void> => {
  try {
    debugLog('🔄 Loading animals from native storage');
    const stored = await Storage.get({ key: STORAGE_KEY });
    
    if (stored.value) {
      debugLog('📂 Found stored data');
      const parsed = JSON.parse(stored.value);
      
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
debugLog('🚀 Initializing animal store with native storage...');
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
  
  const saved = await saveAnimals();
  debugLog('💾 Add result', saved ? 'success' : 'failed');
  
  return saved;
};

export const updateAnimal = async (id: string, updatedData: Omit<Animal, 'id'>): Promise<boolean> => {
  debugLog('✏️ Updating animal', id);
  const index = animals.findIndex(animal => animal.id === id);
  
  if (index !== -1) {
    animals[index] = { id, ...updatedData };
    debugLog('✅ Animal updated in memory', animals[index].name);
    
    const saved = await saveAnimals();
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
    const saved = await saveAnimals();
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

// Function to get animal count by species (for Dashboard)
export const getAnimalCountBySpecies = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  animals.forEach(animal => {
    counts[animal.species] = (counts[animal.species] || 0) + 1;
  });
  return counts;
};

// Function to clear all animals (for Settings)
export const clearAllAnimals = async (): Promise<boolean> => {
  debugLog('🗑️ Clearing all animals');
  animals = [];
  const saved = await saveAnimals();
  debugLog('💾 Clear result', saved ? 'success' : 'failed');
  return saved;
};

// Function to restore from backup (for Settings)
export const restoreAnimalsFromBackup = async (): Promise<boolean> => {
  try {
    debugLog('🔄 Restoring from backup');
    const backup = await Storage.get({ key: BACKUP_KEY });
    if (backup.value) {
      const parsed = JSON.parse(backup.value);
      if (Array.isArray(parsed)) {
        animals = parsed;
        const saved = await saveAnimals();
        debugLog('✅ Restored from backup', `${animals.length} animals`);
        return saved;
      }
    }
    debugLog('❌ No valid backup found');
    return false;
  } catch (error) {
    debugLog('❌ Backup restore failed', error);
    return false;
  }
};

// Function to get backup info (for Settings)
export const getBackupInfo = async (): Promise<{ hasBackup: boolean; backupCount: number; backupDate: string }> => {
  try {
    const backup = await Storage.get({ key: BACKUP_KEY });
    if (backup.value) {
      const parsed = JSON.parse(backup.value);
      return {
        hasBackup: true,
        backupCount: Array.isArray(parsed) ? parsed.length : 0,
        backupDate: 'Available'
      };
    }
  } catch (error) {
    debugLog('❌ Error reading backup info', error);
  }
  
  return {
    hasBackup: false,
    backupCount: 0,
    backupDate: 'None'
  };
};

// Debug function to check storage manually
export const debugStorage = async (): Promise<void> => {
  debugLog('=== MANUAL STORAGE DEBUG ===');
  console.log('🔍 In-memory animals:', animals.length);
  console.log('🔍 Raw in-memory data:', animals);
  
  try {
    const stored = await Storage.get({ key: STORAGE_KEY });
    console.log('🔍 Raw native storage data:', stored.value);
    
    if (stored.value) {
      const parsed = JSON.parse(stored.value);
      console.log('🔍 Parsed native storage data:', parsed);
      console.log('🔍 Parsed count:', Array.isArray(parsed) ? parsed.length : 'not array');
    }
  } catch (e) {
    console.log('🔍 Native storage error:', e);
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
