
// Re-export everything from the new modular structure for backward compatibility
export {
  PedigreeTreeBuilder,
  InbreedingCalculator,
  GeneticDiversityCalculator,
  BreedingRecommendationGenerator
} from './pedigree';

export type {
  PedigreeNode,
  InbreedingAnalysis,
  GeneticDiversityScore,
  BreedingRecommendation
} from './pedigree';

// Import the classes for the main service
import {
  PedigreeTreeBuilder,
  InbreedingCalculator,
  GeneticDiversityCalculator,
  BreedingRecommendationGenerator
} from './pedigree';

// Main service class that combines all functionality
export class PedigreeAnalysisService {
  static getCompletePedigree = PedigreeTreeBuilder.getCompletePedigree;
  static calculateInbreedingCoefficient = InbreedingCalculator.calculateInbreedingCoefficient;
  static calculateGeneticDiversity = GeneticDiversityCalculator.calculateGeneticDiversity;
  static generateBreedingRecommendations = BreedingRecommendationGenerator.generateBreedingRecommendations;
}
