
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
