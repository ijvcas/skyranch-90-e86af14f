
import { supabase } from '@/integrations/supabase/client';
import type { Animal } from '@/stores/animalStore';

export interface PedigreeNode {
  id: string;
  name: string;
  gender?: string;
  generation: number;
  isRegistered: boolean;
  children?: PedigreeNode[];
}

export interface InbreedingAnalysis {
  coefficient: number;
  riskLevel: 'low' | 'moderate' | 'high';
  commonAncestors: string[];
  recommendations: string[];
}

export interface GeneticDiversityScore {
  score: number; // 0-100
  completeness: number; // percentage of known lineage
  diversityFactors: {
    uniqueAncestors: number;
    generationDepth: number;
    bloodlineVariety: number;
  };
}

export interface BreedingRecommendation {
  id: string;
  maleId: string;
  maleName: string;
  femaleId: string;
  femaleName: string;
  compatibilityScore: number;
  geneticDiversityGain: number;
  inbreedingRisk: 'low' | 'moderate' | 'high';
  recommendations: string[];
  reasoning: string[];
}

export class PedigreeAnalysisService {
  
  static async getCompletePedigree(animalId: string): Promise<PedigreeNode | null> {
    console.log('🧬 Getting complete pedigree for animal:', animalId);
    
    try {
      const { data: animal } = await supabase
        .from('animals')
        .select('*')
        .eq('id', animalId)
        .single();

      if (!animal) return null;

      return await this.buildPedigreeTree(animal, 1);
    } catch (error) {
      console.error('Error getting pedigree:', error);
      return null;
    }
  }

  private static async buildPedigreeTree(animal: any, generation: number): Promise<PedigreeNode> {
    const node: PedigreeNode = {
      id: animal.id,
      name: animal.name,
      gender: animal.gender,
      generation,
      isRegistered: true,
      children: []
    };

    // Recursively build parent nodes (up to 4 generations)
    if (generation <= 4) {
      const parents = await this.getParents(animal);
      if (parents.length > 0) {
        for (const parent of parents) {
          const parentNode = await this.buildPedigreeTree(parent, generation + 1);
          node.children?.push(parentNode);
        }
      }
    }

    return node;
  }

  private static async getParents(animal: any): Promise<any[]> {
    const parents = [];
    
    if (animal.mother_id) {
      const mother = await this.resolveParent(animal.mother_id);
      if (mother) parents.push(mother);
    }
    
    if (animal.father_id) {
      const father = await this.resolveParent(animal.father_id);
      if (father) parents.push(father);
    }

    return parents;
  }

  private static async resolveParent(parentId: string): Promise<any | null> {
    // Check if it's a UUID (registered animal)
    if (this.isValidUUID(parentId)) {
      const { data: animal } = await supabase
        .from('animals')
        .select('*')
        .eq('id', parentId)
        .single();
      return animal;
    }
    
    // It's a text name (external animal)
    return {
      id: parentId,
      name: parentId,
      gender: 'unknown',
      species: 'unknown',
      isRegistered: false
    };
  }

  private static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  static calculateInbreedingCoefficient(pedigree: PedigreeNode): InbreedingAnalysis {
    console.log('🧮 Calculating inbreeding coefficient for:', pedigree.name);
    
    const ancestors = this.getAllAncestors(pedigree);
    const ancestorCounts = new Map<string, number>();
    
    // Count occurrences of each ancestor
    ancestors.forEach(ancestor => {
      ancestorCounts.set(ancestor.id, (ancestorCounts.get(ancestor.id) || 0) + 1);
    });

    // Find common ancestors (appearing more than once)
    const commonAncestors: string[] = [];
    let inbreedingSum = 0;

    ancestorCounts.forEach((count, ancestorId) => {
      if (count > 1) {
        const ancestor = ancestors.find(a => a.id === ancestorId);
        if (ancestor) {
          commonAncestors.push(ancestor.name);
          // Simplified Wright's coefficient calculation
          inbreedingSum += (count - 1) * Math.pow(0.5, ancestor.generation);
        }
      }
    });

    const coefficient = inbreedingSum;
    const riskLevel = coefficient > 0.125 ? 'high' : coefficient > 0.0625 ? 'moderate' : 'low';
    
    const recommendations = this.generateInbreedingRecommendations(coefficient, commonAncestors);

    return {
      coefficient,
      riskLevel,
      commonAncestors,
      recommendations
    };
  }

  private static getAllAncestors(node: PedigreeNode, ancestors: PedigreeNode[] = []): PedigreeNode[] {
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        ancestors.push(child);
        this.getAllAncestors(child, ancestors);
      });
    }
    return ancestors;
  }

  private static generateInbreedingRecommendations(coefficient: number, commonAncestors: string[]): string[] {
    const recommendations = [];
    
    if (coefficient > 0.125) {
      recommendations.push('⚠️ Alto riesgo de consanguinidad. Evitar este apareamiento.');
      recommendations.push('Buscar animales con linajes completamente diferentes.');
    } else if (coefficient > 0.0625) {
      recommendations.push('⚡ Consanguinidad moderada. Monitorear la descendencia cuidadosamente.');
      recommendations.push('Considerar análisis genético adicional.');
    } else {
      recommendations.push('✅ Bajo riesgo de consanguinidad. Apareamiento genéticamente viable.');
    }

    if (commonAncestors.length > 0) {
      recommendations.push(`Ancestros comunes detectados: ${commonAncestors.join(', ')}`);
    }

    return recommendations;
  }

  static calculateGeneticDiversity(pedigree: PedigreeNode): GeneticDiversityScore {
    console.log('🌈 Calculating genetic diversity for:', pedigree.name);
    
    const ancestors = this.getAllAncestors(pedigree);
    const uniqueAncestors = new Set(ancestors.map(a => a.id)).size;
    const maxGenerations = Math.max(...ancestors.map(a => a.generation), 0);
    const registeredAncestors = ancestors.filter(a => a.isRegistered).length;
    const totalPossibleAncestors = Math.pow(2, maxGenerations) - 1; // 2^n - 1
    
    const completeness = totalPossibleAncestors > 0 ? (ancestors.length / totalPossibleAncestors) * 100 : 0;
    
    // Genetic diversity score (0-100)
    const diversityScore = Math.min(100, (
      (uniqueAncestors / Math.max(ancestors.length, 1)) * 40 + // Uniqueness weight: 40%
      (maxGenerations / 4) * 30 + // Depth weight: 30%
      (completeness / 100) * 30 // Completeness weight: 30%
    ));

    return {
      score: Math.round(diversityScore),
      completeness: Math.round(completeness),
      diversityFactors: {
        uniqueAncestors,
        generationDepth: maxGenerations,
        bloodlineVariety: uniqueAncestors
      }
    };
  }

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
      const malePedigree = await this.getCompletePedigree(male.id);
      const femalePedigree = await this.getCompletePedigree(female.id);

      if (!malePedigree || !femalePedigree) {
        return null;
      }

      // Calculate inbreeding risk for potential offspring
      const inbreedingAnalysis = this.calculatePotentialInbreeding(malePedigree, femalePedigree);
      
      // Calculate genetic diversity scores
      const maleDiversity = this.calculateGeneticDiversity(malePedigree);
      const femaleDiversity = this.calculateGeneticDiversity(femalePedigree);
      
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

  private static calculatePotentialInbreeding(malePedigree: PedigreeNode, femalePedigree: PedigreeNode): InbreedingAnalysis {
    // Simplified analysis of potential common ancestors
    const maleAncestors = this.getAllAncestors(malePedigree);
    const femaleAncestors = this.getAllAncestors(femalePedigree);
    
    const commonAncestorIds = new Set();
    const commonAncestorNames: string[] = [];
    
    maleAncestors.forEach(maleAncestor => {
      femaleAncestors.forEach(femaleAncestor => {
        if (maleAncestor.id === femaleAncestor.id) {
          commonAncestorIds.add(maleAncestor.id);
          if (!commonAncestorNames.includes(maleAncestor.name)) {
            commonAncestorNames.push(maleAncestor.name);
          }
        }
      });
    });

    const coefficient = commonAncestorIds.size * 0.0625; // Simplified calculation
    const riskLevel = coefficient > 0.125 ? 'high' : coefficient > 0.0625 ? 'moderate' : 'low';

    return {
      coefficient,
      riskLevel,
      commonAncestors: commonAncestorNames,
      recommendations: []
    };
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
