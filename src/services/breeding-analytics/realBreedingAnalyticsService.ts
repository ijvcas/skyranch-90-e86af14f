
import { supabase } from '@/integrations/supabase/client';
import type { RealBreedingAnalytics } from './types';
import { BreedingDataCalculator } from './dataCalculator';
import { SeasonalBreedingAnalyzer } from './seasonalAnalyzer';
import { BreedingStatusTranslator } from './statusTranslator';

export class RealBreedingAnalyticsService {
  
  static async getAnalytics(): Promise<RealBreedingAnalytics> {
    console.log('📊 Getting real breeding analytics for donkeys...');
    
    try {
      // Get all breeding records
      const { data: breedingRecords } = await supabase
        .from('breeding_records')
        .select('*')
        .order('breeding_date', { ascending: false });

      // Get all animals for name mapping, focusing on donkeys
      const { data: animals } = await supabase
        .from('animals')
        .select('id, name, species')
        .eq('species', 'equino');

      const animalNames = new Map(animals?.map(a => [a.id, a.name]) || []);

      if (!breedingRecords) {
        return this.getEmptyAnalytics();
      }

      // Filter breeding records for donkeys only
      const donkeyBreedings = breedingRecords.filter(record => {
        const motherName = animalNames.get(record.mother_id);
        const fatherName = animalNames.get(record.father_id);
        return motherName || fatherName; // At least one parent should be a registered donkey
      });

      const totalBreedings = donkeyBreedings.length;
      const confirmedPregnancies = donkeyBreedings.filter(r => r.pregnancy_confirmed).length;
      const pregnancyRate = totalBreedings > 0 ? (confirmedPregnancies / totalBreedings) * 100 : 0;

      // Calculate average gestation length for donkeys (should be around 12-14 months)
      const completedBirths = donkeyBreedings.filter(r => r.actual_birth_date && r.breeding_date);
      const gestationLengths = completedBirths.map(r => {
        const breedingDate = new Date(r.breeding_date);
        const birthDate = new Date(r.actual_birth_date!);
        return Math.floor((birthDate.getTime() - breedingDate.getTime()) / (1000 * 60 * 60 * 24));
      });
      const avgGestationLength = gestationLengths.length > 0 
        ? Math.round(gestationLengths.reduce((a, b) => a + b, 0) / gestationLengths.length)
        : 0;

      // Calculate upcoming births
      const now = new Date();
      const upcomingBirths = donkeyBreedings.filter(r => {
        if (!r.expected_due_date) return false;
        const dueDate = new Date(r.expected_due_date);
        const daysDiff = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff <= 60; // Within next 60 days for donkeys
      }).length;

      // Breedings by month for donkeys
      const breedingsByMonth = BreedingDataCalculator.calculateBreedingsByMonth(donkeyBreedings);

      // Breedings by status
      const statusCounts = new Map<string, number>();
      donkeyBreedings.forEach(r => {
        statusCounts.set(r.status, (statusCounts.get(r.status) || 0) + 1);
      });

      const breedingsByStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({
        status: BreedingStatusTranslator.translateStatus(status),
        count
      }));

      // Top performing donkey females
      const topPerformingFemales = BreedingDataCalculator.calculateTopPerformingFemales(donkeyBreedings, animalNames);

      // Seasonal trends
      const seasonalTrends = SeasonalBreedingAnalyzer.analyzeSeasonalTrends(breedingsByMonth);

      // Donkey-specific data
      const donkeySpecificData = BreedingDataCalculator.calculateDonkeySpecificData(donkeyBreedings, animalNames);

      return {
        totalBreedings,
        pregnancyRate: Math.round(pregnancyRate * 10) / 10,
        avgGestationLength,
        upcomingBirths,
        breedingsByMonth,
        breedingsByStatus,
        topPerformingFemales,
        seasonalTrends,
        donkeySpecificData
      };
    } catch (error) {
      console.error('Error getting real breeding analytics:', error);
      return this.getEmptyAnalytics();
    }
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
        recommendations: ['Registra apareamientos de burros para obtener análisis de tendencias']
      },
      donkeySpecificData: {
        totalDonkeyBreedings: 0,
        lunaBreedings: 0,
        lascauxBreedings: 0,
        frenchLineagePreservation: 'Registra apareamientos para análisis de linaje francés'
      }
    };
  }
}
