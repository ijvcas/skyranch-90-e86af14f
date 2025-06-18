
import { supabase } from '@/integrations/supabase/client';

export interface BreedingAnalytics {
  totalBreedings: number;
  successRate: number;
  averageGestationLength: number;
  breedingsByMonth: Array<{
    month: string;
    count: number;
  }>;
  topPerformingMales: Array<{
    id: string;
    name: string;
    successfulBreedings: number;
  }>;
  topPerformingFemales: Array<{
    id: string;
    name: string;
    successfulBreedings: number;
  }>;
  healthStats: {
    healthyOffspring: number;
    complicatedDeliveries: number;
    totalOffspring: number;
  };
  lineageStats: {
    inbredPercentage: number;
    diversityScore: number;
  };
}

export const getBreedingAnalytics = async (): Promise<BreedingAnalytics> => {
  try {
    // Fetch breeding records
    const { data: breedingData, error: breedingError } = await supabase
      .from('breeding_records')
      .select('*');

    if (breedingError) throw breedingError;

    // Fetch animals for health and lineage analysis
    const { data: animalsData, error: animalsError } = await supabase
      .from('animals')
      .select('*');

    if (animalsError) throw animalsError;

    const breedingRecords = breedingData || [];
    const animals = animalsData || [];

    return {
      totalBreedings: breedingRecords.length,
      successRate: calculateSuccessRate(breedingRecords),
      averageGestationLength: calculateAverageGestationLength(breedingRecords),
      breedingsByMonth: calculateBreedingsByMonth(breedingRecords),
      topPerformingMales: calculateTopPerformingMales(breedingRecords, animals),
      topPerformingFemales: calculateTopPerformingFemales(breedingRecords, animals),
      healthStats: calculateHealthStats(breedingRecords, animals),
      lineageStats: calculateLineageStats(animals)
    };
  } catch (error) {
    console.error('Error fetching breeding analytics:', error);
    throw error;
  }
};

function calculateSuccessRate(records: any[]): number {
  if (records.length === 0) return 0;
  const successful = records.filter(r => r.pregnancy_confirmed).length;
  return (successful / records.length) * 100;
}

function calculateAverageGestationLength(records: any[]): number {
  const recordsWithGestation = records.filter(r => r.gestation_length > 0);
  if (recordsWithGestation.length === 0) return 0;
  const total = recordsWithGestation.reduce((sum, r) => sum + r.gestation_length, 0);
  return total / recordsWithGestation.length;
}

function calculateBreedingsByMonth(records: any[]) {
  const monthCounts: Record<string, number> = {};
  
  records.forEach(record => {
    const date = new Date(record.breeding_date);
    const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
  });

  return Object.entries(monthCounts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function calculateTopPerformingMales(records: any[], animals: any[]) {
  const malePerformance: Record<string, number> = {};
  
  records.forEach(record => {
    if (record.father_id && record.pregnancy_confirmed) {
      malePerformance[record.father_id] = (malePerformance[record.father_id] || 0) + 1;
    }
  });

  return Object.entries(malePerformance)
    .map(([id, count]) => {
      const animal = animals.find(a => a.id === id);
      return {
        id,
        name: animal?.name || 'Unknown',
        successfulBreedings: count
      };
    })
    .sort((a, b) => b.successfulBreedings - a.successfulBreedings)
    .slice(0, 5);
}

function calculateTopPerformingFemales(records: any[], animals: any[]) {
  const femalePerformance: Record<string, number> = {};
  
  records.forEach(record => {
    if (record.mother_id && record.pregnancy_confirmed) {
      femalePerformance[record.mother_id] = (femalePerformance[record.mother_id] || 0) + 1;
    }
  });

  return Object.entries(femalePerformance)
    .map(([id, count]) => {
      const animal = animals.find(a => a.id === id);
      return {
        id,
        name: animal?.name || 'Unknown',
        successfulBreedings: count
      };
    })
    .sort((a, b) => b.successfulBreedings - a.successfulBreedings)
    .slice(0, 5);
}

function calculateHealthStats(records: any[], animals: any[]) {
  let healthyOffspring = 0;
  let complicatedDeliveries = 0;
  let totalOffspring = 0;

  records.forEach(record => {
    if (record.actual_birth_date) {
      totalOffspring++;
      
      // Find offspring animals born around the birth date
      const birthDate = new Date(record.actual_birth_date);
      const offspring = animals.filter(animal => {
        if (!animal.birth_date) return false;
        const animalBirthDate = new Date(animal.birth_date);
        const daysDiff = Math.abs((animalBirthDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7 && (animal.mother_id === record.mother_id || animal.father_id === record.father_id);
      });

      if (offspring.some(o => o.health_status === 'healthy')) {
        healthyOffspring++;
      }
      
      if (record.delivery_notes?.toLowerCase().includes('complicat')) {
        complicatedDeliveries++;
      }
    }
  });

  return {
    healthyOffspring,
    complicatedDeliveries,
    totalOffspring
  };
}

function calculateLineageStats(animals: any[]) {
  let inbredCount = 0;
  const totalAnimalsWithLineage = animals.filter(a => a.mother_id && a.father_id).length;

  animals.forEach(animal => {
    if (animal.mother_id && animal.father_id) {
      // Check for inbreeding patterns
      const mother = animals.find(a => a.id === animal.mother_id);
      const father = animals.find(a => a.id === animal.father_id);
      
      if (mother && father) {
        // Check if parents share grandparents (simplified inbreeding check)
        if (
          (mother.mother_id && mother.mother_id === father.mother_id) ||
          (mother.father_id && mother.father_id === father.father_id) ||
          (mother.maternal_grandmother_id && mother.maternal_grandmother_id === father.maternal_grandmother_id) ||
          (mother.paternal_grandfather_id && mother.paternal_grandfather_id === father.paternal_grandfather_id)
        ) {
          inbredCount++;
        }
      }
    }
  });

  const inbredPercentage = totalAnimalsWithLineage > 0 ? (inbredCount / totalAnimalsWithLineage) * 100 : 0;
  const diversityScore = Math.max(0, 100 - inbredPercentage);

  return {
    inbredPercentage,
    diversityScore
  };
}
