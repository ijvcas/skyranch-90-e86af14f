
import type { PedigreeNode, GeneticDiversityScore } from './types';
import { PedigreeTreeBuilder } from './pedigreeTreeBuilder';

export class GeneticDiversityCalculator {
  
  static calculateGeneticDiversity(pedigree: PedigreeNode): GeneticDiversityScore {
    console.log('🌈 Calculating genetic diversity for:', pedigree.name);
    
    const ancestors = PedigreeTreeBuilder.getAllAncestors(pedigree);
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
}
