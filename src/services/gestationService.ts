
// Gestation periods in days for different species
const GESTATION_PERIODS: Record<string, number> = {
  // Cattle variations
  'bovino': 283,
  'cattle': 283,
  'vaca': 283,
  'toro': 283,
  'res': 283,
  
  // Horse variations
  'equino': 340,
  'horse': 340,
  'caballo': 340,
  'yegua': 340,
  
  // Sheep variations
  'ovino': 147,
  'sheep': 147,
  'oveja': 147,
  'carnero': 147,
  
  // Goat variations
  'caprino': 150,
  'goat': 150,
  'cabra': 150,
  'chivo': 150,
  
  // Pig variations
  'porcino': 114,
  'pig': 114,
  'cerdo': 114,
  'cochino': 114,
  'chancho': 114,
  
  // Llama/Alpaca variations
  'llama': 350,
  'alpaca': 350,
  'camélido': 350,
};

export const getGestationPeriod = (species: string): number | null => {
  if (!species) return null;
  
  const normalizedSpecies = species.toLowerCase().trim();
  return GESTATION_PERIODS[normalizedSpecies] || null;
};

export const calculateExpectedDueDate = (breedingDate: string, species: string): string => {
  if (!breedingDate || !species) return '';
  
  const gestationDays = getGestationPeriod(species);
  if (!gestationDays) return '';
  
  const breeding = new Date(breedingDate);
  const dueDate = new Date(breeding);
  dueDate.setDate(breeding.getDate() + gestationDays);
  
  return dueDate.toISOString().split('T')[0];
};

export const calculateActualGestationDuration = (breedingDate: string, birthDate: string): number | null => {
  if (!breedingDate || !birthDate) return null;
  
  const breeding = new Date(breedingDate);
  const birth = new Date(birthDate);
  
  const diffTime = birth.getTime() - breeding.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : null;
};

export const getSpeciesDisplayName = (species: string): string => {
  const displayNames: Record<string, string> = {
    'bovino': 'Bovino (283 días)',
    'cattle': 'Bovino (283 días)',
    'vaca': 'Bovino (283 días)',
    'toro': 'Bovino (283 días)',
    'res': 'Bovino (283 días)',
    'equino': 'Equino (340 días)',
    'horse': 'Equino (340 días)',
    'caballo': 'Equino (340 días)',
    'yegua': 'Equino (340 días)',
    'ovino': 'Ovino (147 días)',
    'sheep': 'Ovino (147 días)',
    'oveja': 'Ovino (147 días)',
    'carnero': 'Ovino (147 días)',
    'caprino': 'Caprino (150 días)',
    'goat': 'Caprino (150 días)',
    'cabra': 'Caprino (150 días)',
    'chivo': 'Caprino (150 días)',
    'porcino': 'Porcino (114 días)',
    'pig': 'Porcino (114 días)',
    'cerdo': 'Porcino (114 días)',
    'cochino': 'Porcino (114 días)',
    'chancho': 'Porcino (114 días)',
    'llama': 'Llama (350 días)',
    'alpaca': 'Alpaca (350 días)',
    'camélido': 'Camélido (350 días)',
  };
  
  const normalizedSpecies = species.toLowerCase().trim();
  return displayNames[normalizedSpecies] || species;
};
