
import { supabase } from '@/integrations/supabase/client';
import { BreedingRecord } from '@/services/breeding/types';
import { Animal } from '@/stores/animalStore';

export interface BreedingGoal {
  id: string;
  title: string;
  targetBreedings: number;
  currentBreedings: number;
  targetDate: string;
  species: string;
  description?: string;
}

export interface BreedingAnalytics {
  totalBreedings: number;
  successRate: number;
  pregnancyRate: number;
  birthCompletionRate: number;
  averageGestationDays: number;
  geneticDiversityScore: number;
  seasonalBreedingData: Array<{
    month: string;
    count: number;
    successRate: number;
  }>;
}

export interface BreedingRecommendation {
  motherId: string;
  fatherId: string;
  motherName: string;
  fatherName: string;
  compatibilityScore: number;
  geneticDiversityScore: number;
  reason: string;
  estimatedDueDate: string;
}

class BreedingAnalyticsService {
  async getBreedingAnalytics(): Promise<BreedingAnalytics> {
    console.log('📊 Fetching breeding analytics...');
    
    const { data: records, error } = await supabase
      .from('breeding_records')
      .select('*');

    if (error) {
      console.error('Error fetching breeding records:', error);
      throw error;
    }

    const totalBreedings = records.length;
    const successfulBreedings = records.filter(r => r.status === 'birth_completed').length;
    const pregnantBreedings = records.filter(r => r.pregnancy_confirmed).length;
    
    const successRate = totalBreedings > 0 ? (successfulBreedings / totalBreedings) * 100 : 0;
    const pregnancyRate = totalBreedings > 0 ? (pregnantBreedings / totalBreedings) * 100 : 0;
    const birthCompletionRate = pregnantBreedings > 0 ? (successfulBreedings / pregnantBreedings) * 100 : 0;

    // Calculate average gestation days
    const completedBreedings = records.filter(r => r.actual_birth_date && r.breeding_date);
    const averageGestationDays = completedBreedings.length > 0 
      ? completedBreedings.reduce((sum, record) => {
          const breedingDate = new Date(record.breeding_date);
          const birthDate = new Date(record.actual_birth_date);
          const gestationDays = Math.ceil((birthDate.getTime() - breedingDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + gestationDays;
        }, 0) / completedBreedings.length
      : 0;

    // Calculate seasonal breeding data
    const seasonalData = this.calculateSeasonalData(records);

    // Calculate genetic diversity score (simplified)
    const geneticDiversityScore = await this.calculateGeneticDiversity();

    return {
      totalBreedings,
      successRate,
      pregnancyRate,
      birthCompletionRate,
      averageGestationDays,
      geneticDiversityScore,
      seasonalBreedingData: seasonalData
    };
  }

  private calculateSeasonalData(records: BreedingRecord[]) {
    const monthlyData: { [key: string]: { count: number; successful: number } } = {};
    
    records.forEach(record => {
      const month = new Date(record.breedingDate).toLocaleString('es-ES', { month: 'long' });
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, successful: 0 };
      }
      monthlyData[month].count++;
      if (record.status === 'birth_completed') {
        monthlyData[month].successful++;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      count: data.count,
      successRate: data.count > 0 ? (data.successful / data.count) * 100 : 0
    }));
  }

  private async calculateGeneticDiversity(): Promise<number> {
    const { data: animals } = await supabase
      .from('animals')
      .select('id, mother_id, father_id, species');

    if (!animals || animals.length === 0) return 0;

    // Simple genetic diversity calculation based on unique parent combinations
    const parentCombinations = new Set();
    animals.forEach(animal => {
      if (animal.mother_id && animal.father_id) {
        parentCombinations.add(`${animal.mother_id}-${animal.father_id}`);
      }
    });

    const uniqueCombinations = parentCombinations.size;
    const totalAnimals = animals.length;
    
    return totalAnimals > 0 ? (uniqueCombinations / totalAnimals) * 100 : 0;
  }

  async getBreedingRecommendations(): Promise<BreedingRecommendation[]> {
    console.log('🎯 Generating breeding recommendations...');
    
    const { data: animals } = await supabase
      .from('animals')
      .select('*');

    if (!animals) return [];

    const females = animals.filter(a => 
      a.gender?.toLowerCase().includes('female') || 
      a.gender?.toLowerCase().includes('hembra') ||
      a.gender?.toLowerCase().includes('f')
    );
    
    const males = animals.filter(a => 
      a.gender?.toLowerCase().includes('male') || 
      a.gender?.toLowerCase().includes('macho') ||
      a.gender?.toLowerCase().includes('m')
    );

    const recommendations: BreedingRecommendation[] = [];

    females.forEach(female => {
      males.forEach(male => {
        if (female.species === male.species && female.id !== male.id) {
          const compatibilityScore = this.calculateCompatibilityScore(female, male);
          const geneticDiversityScore = this.calculatePairGeneticDiversity(female, male);
          
          if (compatibilityScore > 60) { // Only recommend good matches
            const estimatedDueDate = this.calculateEstimatedDueDate(female.species);
            
            recommendations.push({
              motherId: female.id,
              fatherId: male.id,
              motherName: female.name,
              fatherName: male.name,
              compatibilityScore,
              geneticDiversityScore,
              reason: this.generateRecommendationReason(compatibilityScore, geneticDiversityScore),
              estimatedDueDate
            });
          }
        }
      });
    });

    // Sort by compatibility score and return top 10
    return recommendations
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 10);
  }

  private calculateCompatibilityScore(female: Animal, male: Animal): number {
    let score = 70; // Base score

    // Same breed bonus
    if (female.breed === male.breed) score += 15;
    
    // Health status bonus
    if (female.health_status === 'healthy') score += 10;
    if (male.health_status === 'healthy') score += 10;

    // Age compatibility (simplified - assuming younger animals are better)
    const currentDate = new Date();
    const femaleAge = female.birth_date ? 
      (currentDate.getTime() - new Date(female.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365) : 0;
    const maleAge = male.birth_date ? 
      (currentDate.getTime() - new Date(male.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365) : 0;

    if (femaleAge >= 1 && femaleAge <= 6) score += 5;
    if (maleAge >= 1 && maleAge <= 8) score += 5;

    // Avoid inbreeding
    if (female.mother_id === male.mother_id || female.father_id === male.father_id) {
      score -= 30;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculatePairGeneticDiversity(female: Animal, male: Animal): number {
    let diversityScore = 50; // Base score

    // Different bloodlines
    if (female.mother_id !== male.mother_id) diversityScore += 20;
    if (female.father_id !== male.father_id) diversityScore += 20;
    
    // Different grandparents
    if (female.maternal_grandmother_id !== male.maternal_grandmother_id) diversityScore += 5;
    if (female.paternal_grandfather_id !== male.paternal_grandfather_id) diversityScore += 5;

    return Math.min(100, diversityScore);
  }

  private generateRecommendationReason(compatibilityScore: number, geneticDiversityScore: number): string {
    if (compatibilityScore >= 90) {
      return "Excelente compatibilidad genética y alta diversidad";
    } else if (compatibilityScore >= 80) {
      return "Muy buena compatibilidad con diversidad genética adecuada";
    } else if (geneticDiversityScore >= 80) {
      return "Buena diversidad genética para mejoramiento del hato";
    } else {
      return "Pareja compatible para apareamiento";
    }
  }

  private calculateEstimatedDueDate(species: string): string {
    const today = new Date();
    let gestationDays = 280; // Default cattle

    switch (species.toLowerCase()) {
      case 'bovino':
      case 'cattle':
        gestationDays = 280;
        break;
      case 'equino':
      case 'horse':
        gestationDays = 340;
        break;
      case 'porcino':
      case 'pig':
        gestationDays = 114;
        break;
      case 'caprino':
      case 'goat':
        gestationDays = 150;
        break;
      case 'ovino':
      case 'sheep':
        gestationDays = 147;
        break;
    }

    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + gestationDays);
    
    return dueDate.toISOString().split('T')[0];
  }
}

export const breedingAnalyticsService = new BreedingAnalyticsService();
