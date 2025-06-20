
import { supabase } from '@/integrations/supabase/client';
import type { BreedingRecommendation, GeneticDiversityScore, InbreedingAnalysis } from './types';
import { PedigreeTreeBuilder } from './pedigreeTreeBuilder';
import { InbreedingCalculator } from './inbreedingCalculator';
import { GeneticDiversityCalculator } from './geneticDiversityCalculator';

export class BreedingRecommendationGenerator {
  
  static async generateBreedingRecommendations(): Promise<BreedingRecommendation[]> {
    console.log('💡 Generating breeding recommendations...');
    
    try {
      // Get all breeding-capable animals
      const { data: animals } = await supabase
        .from('animals')
        .select('*')
        .in('health_status', ['healthy', 'good'])
        .not('gender', 'is', null);

      if (!animals || animals.length < 2) {
        return [];
      }

      const males = animals.filter(a => a.gender === 'male' || a.gender === 'macho');
      const females = animals.filter(a => a.gender === 'female' || a.gender === 'hembra');

      const recommendations: BreedingRecommendation[] = [];

      // Analyze all possible male-female combinations
      for (const male of males) {
        for (const female of females) {
          if (male.id === female.id) continue;

          const recommendation = await this.analyzeBreedingPair(male, female);
          if (recommendation) {
            recommendations.push(recommendation);
          }
        }
      }

      // Sort by compatibility score (highest first)
      return recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    } catch (error) {
      console.error('Error generating breeding recommendations:', error);
      return [];
    }
  }

  private static async analyzeBreedingPair(male: any, female: any): Promise<BreedingRecommendation | null> {
    try {
      // Get pedigrees for both animals
      const malePedigree = await PedigreeTreeBuilder.getCompletePedigree(male.id);
      const femalePedigree = await PedigreeTreeBuilder.getCompletePedigree(female.id);

      if (!malePedigree || !femalePedigree) {
        return null;
      }

      // Calculate inbreeding risk for potential offspring
      const inbreedingAnalysis = InbreedingCalculator.calculatePotentialInbreeding(malePedigree, femalePedigree);
      
      // Calculate genetic diversity scores
      const maleDiversity = GeneticDiversityCalculator.calculateGeneticDiversity(malePedigree);
      const femaleDiversity = GeneticDiversityCalculator.calculateGeneticDiversity(femalePedigree);
      
      // Calculate compatibility score (0-100)
      const compatibilityScore = this.calculateCompatibilityScore(
        maleDiversity,
        femaleDiversity,
        inbreedingAnalysis
      );

      // Generate recommendations
      const recommendations = this.generatePairRecommendations(
        male,
        female,
        maleDiversity,
        femaleDiversity,
        inbreedingAnalysis
      );

      return {
        id: `${male.id}-${female.id}`,
        maleId: male.id,
        maleName: male.name,
        femaleId: female.id,
        femaleName: female.name,
        compatibilityScore,
        geneticDiversityGain: Math.round((maleDiversity.score + femaleDiversity.score) / 2),
        inbreedingRisk: inbreedingAnalysis.riskLevel,
        recommendations: recommendations.slice(0, 3), // Top 3 recommendations
        reasoning: recommendations.slice(3) // Additional reasoning
      };
    } catch (error) {
      console.error('Error analyzing breeding pair:', error);
      return null;
    }
  }

  private static calculateCompatibilityScore(
    maleDiversity: GeneticDiversityScore,
    femaleDiversity: GeneticDiversityScore,
    inbreeding: InbreedingAnalysis
  ): number {
    let score = 0;
    
    // Genetic diversity component (40% weight)
    score += (maleDiversity.score + femaleDiversity.score) / 2 * 0.4;
    
    // Inbreeding risk component (40% weight)
    const inbreedingScore = inbreeding.riskLevel === 'low' ? 100 : 
                          inbreeding.riskLevel === 'moderate' ? 60 : 20;
    score += inbreedingScore * 0.4;
    
    // Pedigree completeness (20% weight)
    const completenessScore = (maleDiversity.completeness + femaleDiversity.completeness) / 2;
    score += completenessScore * 0.2;
    
    return Math.round(Math.min(100, Math.max(0, score)));
  }

  private static generatePairRecommendations(
    male: any,
    female: any,
    maleDiversity: GeneticDiversityScore,
    femaleDiversity: GeneticDiversityScore,
    inbreeding: InbreedingAnalysis
  ): string[] {
    const recommendations = [];
    
    if (inbreeding.riskLevel === 'low') {
      recommendations.push('✅ Excelente compatibilidad genética');
    } else if (inbreeding.riskLevel === 'moderate') {
      recommendations.push('⚡ Compatibilidad moderada - monitorear descendencia');
    } else {
      recommendations.push('⚠️ Riesgo alto de consanguinidad - no recomendado');
    }

    const avgDiversity = (maleDiversity.score + femaleDiversity.score) / 2;
    if (avgDiversity > 80) {
      recommendations.push('🌟 Alta diversidad genética esperada');
    } else if (avgDiversity > 60) {
      recommendations.push('📈 Diversidad genética buena');
    } else {
      recommendations.push('📉 Diversidad genética limitada');
    }

    if (maleDiversity.completeness > 80 && femaleDiversity.completeness > 80) {
      recommendations.push('📋 Pedigrí completo para análisis preciso');
    } else {
      recommendations.push('📋 Pedigrí incompleto - análisis limitado');
    }

    // Additional reasoning
    recommendations.push(`Diversidad del macho: ${maleDiversity.score}%`);
    recommendations.push(`Diversidad de la hembra: ${femaleDiversity.score}%`);
    recommendations.push(`Riesgo de consanguinidad: ${inbreeding.coefficient.toFixed(3)}`);

    return recommendations;
  }
}
