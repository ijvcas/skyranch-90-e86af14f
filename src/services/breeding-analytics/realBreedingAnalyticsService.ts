
import { supabase } from '@/integrations/supabase/client';
import type { RealBreedingAnalytics } from './types';
import { BreedingDataCalculator } from './dataCalculator';
import { SeasonalBreedingAnalyzer } from './seasonalAnalyzer';
import { BreedingStatusTranslator } from './statusTranslator';
import { SpeciesConfigService } from '@/services/species/speciesConfig';

export class RealBreedingAnalyticsService {
  
  static async getAnalytics(): Promise<RealBreedingAnalytics> {
    console.log('📊 Getting universal breeding analytics for all species...');
    
    try {
      // Get all breeding records
      const { data: breedingRecords } = await supabase
        .from('breeding_records')
        .select('*')
        .order('breeding_date', { ascending: false });

      // Get all animals for name mapping
      const { data: animals } = await supabase
        .from('animals')
        .select('id, name, species, breed')
        .in('health_status', ['healthy', 'good']);

      const animalNames = new Map(animals?.map(a => [a.id, a.name]) || []);
      const animalSpecies = new Map(animals?.map(a => [a.id, a.species]) || []);
      const animalBreeds = new Map(animals?.map(a => [a.id, a.breed]) || []);

      if (!breedingRecords) {
        return this.getEmptyAnalytics();
      }

      const totalBreedings = breedingRecords.length;
      const confirmedPregnancies = breedingRecords.filter(r => r.pregnancy_confirmed).length;
      const pregnancyRate = totalBreedings > 0 ? (confirmedPregnancies / totalBreedings) * 100 : 0;

      // Calculate average gestation length across all species
      const completedBirths = breedingRecords.filter(r => r.actual_birth_date && r.breeding_date);
      const gestationLengths = completedBirths.map(r => {
        const breedingDate = new Date(r.breeding_date);
        const birthDate = new Date(r.actual_birth_date!);
        return Math.floor((birthDate.getTime() - breedingDate.getTime()) / (1000 * 60 * 60 * 24));
      });
      const avgGestationLength = gestationLengths.length > 0 
        ? Math.round(gestationLengths.reduce((a, b) => a + b, 0) / gestationLengths.length)
        : 0;

      // Calculate upcoming births (next 60 days for all species)
      const now = new Date();
      const upcomingBirths = breedingRecords.filter(r => {
        if (!r.expected_due_date) return false;
        const dueDate = new Date(r.expected_due_date);
        const daysDiff = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff <= 60;
      }).length;

      // Breedings by month for all species
      const breedingsByMonth = BreedingDataCalculator.calculateBreedingsByMonth(breedingRecords);

      // Breedings by status
      const statusCounts = new Map<string, number>();
      breedingRecords.forEach(r => {
        statusCounts.set(r.status, (statusCounts.get(r.status) || 0) + 1);
      });

      const breedingsByStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({
        status: BreedingStatusTranslator.translateStatus(status),
        count
      }));

      // Top performing females across all species
      const topPerformingFemales = BreedingDataCalculator.calculateTopPerformingFemales(breedingRecords, animalNames);

      // Seasonal trends
      const seasonalTrends = SeasonalBreedingAnalyzer.analyzeSeasonalTrends(breedingsByMonth);

      // Multi-species specific data
      const multiSpeciesData = this.calculateMultiSpeciesData(breedingRecords, animalNames, animalSpecies, animalBreeds);

      return {
        totalBreedings,
        pregnancyRate: Math.round(pregnancyRate * 10) / 10,
        avgGestationLength,
        upcomingBirths,
        breedingsByMonth,
        breedingsByStatus,
        topPerformingFemales,
        seasonalTrends,
        donkeySpecificData: multiSpeciesData // Keeping the same property name for compatibility
      };
    } catch (error) {
      console.error('Error getting breeding analytics:', error);
      return this.getEmptyAnalytics();
    }
  }

  private static calculateMultiSpeciesData(
    breedingRecords: any[], 
    animalNames: Map<string, string>,
    animalSpecies: Map<string, string>,
    animalBreeds: Map<string, string>
  ) {
    // Count breedings by species
    const speciesCounts = new Map<string, number>();
    const specialBreedCounts = new Map<string, number>();

    breedingRecords.forEach(record => {
      const motherSpecies = animalSpecies.get(record.mother_id);
      const fatherSpecies = animalSpecies.get(record.father_id);
      const motherBreed = animalBreeds.get(record.mother_id);
      const fatherBreed = animalBreeds.get(record.father_id);

      // Count by species
      if (motherSpecies) {
        speciesCounts.set(motherSpecies, (speciesCounts.get(motherSpecies) || 0) + 1);
      }

      // Count special breeds
      if (motherBreed?.toLowerCase().includes('baudet') || fatherBreed?.toLowerCase().includes('baudet')) {
        specialBreedCounts.set('baudet_de_poitou', (specialBreedCounts.get('baudet_de_poitou') || 0) + 1);
      }
      if (motherBreed?.toLowerCase().includes('nez noir') || fatherBreed?.toLowerCase().includes('nez noir')) {
        specialBreedCounts.set('nez_noir_du_valais', (specialBreedCounts.get('nez_noir_du_valais') || 0) + 1);
      }

      // Legacy support for LUNA and LASCAUX
      const motherName = animalNames.get(record.mother_id);
      const fatherName = animalNames.get(record.father_id);
      if (motherName?.toUpperCase().includes('LUNA') || fatherName?.toUpperCase().includes('LUNA')) {
        specialBreedCounts.set('luna_breedings', (specialBreedCounts.get('luna_breedings') || 0) + 1);
      }
      if (motherName?.toUpperCase().includes('LASCAUX') || fatherName?.toUpperCase().includes('LASCAUX')) {
        specialBreedCounts.set('lascaux_breedings', (specialBreedCounts.get('lascaux_breedings') || 0) + 1);
      }
    });

    // Generate species summary
    const speciesSummary = Array.from(speciesCounts.entries())
      .map(([species, count]) => {
        const config = SpeciesConfigService.getSpeciesConfig(species);
        return `${config?.name || species}: ${count} apareamientos`;
      })
      .join(', ');

    const specialBreedSummary = Array.from(specialBreedCounts.entries())
      .map(([breed, count]) => {
        const breedNames: Record<string, string> = {
          'baudet_de_poitou': 'Baudet de Poitou',
          'nez_noir_du_valais': 'Nez Noir du Valais',
          'luna_breedings': 'LUNA',
          'lascaux_breedings': 'LASCAUX'
        };
        return `${breedNames[breed] || breed}: ${count}`;
      })
      .join(', ');

    return {
      totalDonkeyBreedings: breedingRecords.length, // Total for all species
      lunaBreedings: specialBreedCounts.get('luna_breedings') || 0,
      lascauxBreedings: specialBreedCounts.get('lascaux_breedings') || 0,
      frenchLineagePreservation: breedingRecords.length > 0 
        ? `Gestión multi-especies: ${speciesSummary}${specialBreedSummary ? `. Razas especiales: ${specialBreedSummary}` : ''}`
        : 'Registra apareamientos para análisis multi-especies'
    };
  }

  private static getEmptyAnalytics(): RealBreedingAnalytics {
    return {
      totalBreedings: 0,
      pregnancyRate: 0,
      avgGestationLength: 0,
      upcomingBirths: 0,
      breedingsByMonth: [],
      breedingsByStatus: [],
      topPerformingFemales: [],
      seasonalTrends: {
        bestMonths: [],
        worstMonths: [],
        recommendations: ['Registra apareamientos de cualquier especie para obtener análisis']
      },
      donkeySpecificData: {
        totalDonkeyBreedings: 0,
        lunaBreedings: 0,
        lascauxBreedings: 0,
        frenchLineagePreservation: 'Sistema preparado para análisis multi-especies'
      }
    };
  }
}
