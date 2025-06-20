import { supabase } from '@/integrations/supabase/client';
import { animalDatabaseMapper } from '@/services/utils/animalDatabaseMapper';
import { SpeciesConfigService } from '@/services/species/speciesConfig';
import type { Animal } from '@/stores/animalStore';

export interface UniversalPedigreeAnalysis {
  maleId: string;
  maleName: string;
  femaleId: string;
  femaleName: string;
  species: string;
  breedInfo?: {
    maleBred?: string;
    femaleBred?: string;
    isSpecialBreed: boolean;
    specialBreedInfo?: any;
  };
  compatibilityScore: number;
  inbreedingCoefficient: number;
  riskLevel: 'low' | 'moderate' | 'high';
  commonAncestors: string[];
  geneticDiversityScore: number;
  recommendations: string[];
  speciesSpecificAdvice: string[];
  optimalBreedingWindow: string;
  expectedGestationDays: number;
}

export interface UniversalBreedingRecommendation {
  pairId: string;
  maleName: string;
  femaleName: string;
  species: string;
  breed?: string;
  compatibilityScore: number;
  breedingWindow: string;
  seasonalAdvice: string[];
  geneticBenefits: string[];
  considerations: string[];
  isSpecialBreed: boolean;
  gestationDays: number;
}

export class UniversalBreedingAnalysisService {
  
  static async getBreedingPairsBySpecies(species?: string): Promise<{ males: Animal[], females: Animal[] }> {
    console.log(`🐾 Getting breeding pairs${species ? ` for species: ${species}` : ' for all species'}...`);
    
    try {
      let query = supabase
        .from('animals')
        .select('*')
        .in('health_status', ['healthy', 'good']);

      if (species) {
        query = query.eq('species', species);
      }

      const { data: animals } = await query;

      if (!animals) {
        return { males: [], females: [] };
      }

      const convertedAnimals = animals.map(animal => animalDatabaseMapper.fromDatabase(animal));

      // Fixed gender filtering logic
      const males = convertedAnimals.filter(a => 
        a.gender === 'male' || 
        a.gender === 'macho' ||
        a.gender?.toLowerCase() === 'male' ||
        a.gender?.toLowerCase() === 'macho'
      );
      
      const females = convertedAnimals.filter(a => 
        a.gender === 'female' || 
        a.gender === 'hembra' ||
        a.gender?.toLowerCase() === 'female' ||
        a.gender?.toLowerCase() === 'hembra'
      );

      console.log(`Found ${males.length} males and ${females.length} females`);
      console.log('Males:', males.map(m => `${m.name} (${m.gender})`));
      console.log('Females:', females.map(f => `${f.name} (${f.gender})`));
      
      return { males, females };
    } catch (error) {
      console.error('Error getting breeding pairs:', error);
      return { males: [], females: [] };
    }
  }

  static async analyzeUniversalPair(male: Animal, female: Animal): Promise<UniversalPedigreeAnalysis> {
    console.log(`🧬 Analyzing universal pair: ${male.name} (${male.species}, ${male.gender}) x ${female.name} (${female.species}, ${female.gender})`);
    
    // Validate that we have male x female pairing
    const isMale = male.gender === 'male' || male.gender === 'macho' || male.gender?.toLowerCase() === 'male' || male.gender?.toLowerCase() === 'macho';
    const isFemale = female.gender === 'female' || female.gender === 'hembra' || female.gender?.toLowerCase() === 'female' || female.gender?.toLowerCase() === 'hembra';
    
    if (!isMale || !isFemale) {
      throw new Error(`Invalid breeding pair: ${male.name} (${male.gender}) x ${female.name} (${female.gender}). Only male x female pairings are allowed.`);
    }
    
    // Ensure same species
    if (male.species !== female.species) {
      throw new Error('Cannot analyze cross-species breeding');
    }

    const species = male.species;
    const speciesConfig = SpeciesConfigService.getSpeciesConfig(species);
    
    if (!speciesConfig) {
      throw new Error(`Species configuration not found for: ${species}`);
    }

    // Extract lineage information
    const maleLineage = this.extractLineage(male);
    const femaleLineage = this.extractLineage(female);
    
    // Find common ancestors
    const commonAncestors = this.findCommonAncestors(maleLineage, femaleLineage);
    
    // Calculate inbreeding coefficient
    const inbreedingCoefficient = this.calculateInbreedingCoefficient(commonAncestors, maleLineage, femaleLineage);
    
    // Determine risk level using species-specific thresholds
    const riskLevel = SpeciesConfigService.getInbreedingRiskLevel(species, inbreedingCoefficient);
    
    // Calculate genetic diversity
    const geneticDiversityScore = this.calculateGeneticDiversity(maleLineage, femaleLineage, commonAncestors);
    
    // Calculate compatibility score
    const compatibilityScore = this.calculateCompatibilityScore(inbreedingCoefficient, geneticDiversityScore, maleLineage, femaleLineage, species);
    
    // Check for special breeds
    const maleBreedInfo = male.breed ? SpeciesConfigService.getSpecialBreedConfig(species, male.breed) : null;
    const femaleBreedInfo = female.breed ? SpeciesConfigService.getSpecialBreedConfig(species, female.breed) : null;
    const isSpecialBreed = !!(maleBreedInfo || femaleBreedInfo);

    // Generate recommendations
    const recommendations = this.generateUniversalRecommendations(
      male, female, riskLevel, geneticDiversityScore, commonAncestors, species
    );
    
    // Get species-specific advice
    const speciesSpecificAdvice = SpeciesConfigService.getOptimalBreedingAdvice(species, male.breed || female.breed);

    return {
      maleId: male.id,
      maleName: male.name,
      femaleId: female.id,
      femaleName: female.name,
      species,
      breedInfo: {
        maleBred: male.breed,
        femaleBred: female.breed,
        isSpecialBreed,
        specialBreedInfo: maleBreedInfo || femaleBreedInfo
      },
      compatibilityScore,
      inbreedingCoefficient,
      riskLevel,
      commonAncestors,
      geneticDiversityScore,
      recommendations,
      speciesSpecificAdvice,
      optimalBreedingWindow: speciesConfig.optimalBreedingMonths.join(', '),
      expectedGestationDays: speciesConfig.gestationDays
    };
  }

  private static extractLineage(animal: Animal): string[] {
    const lineage: string[] = [];
    
    const pedigreeFields = [
      animal.fatherId,
      animal.motherId,
      animal.paternalGrandfatherId,
      animal.paternalGrandmotherId,
      animal.maternalGrandfatherId,
      animal.maternalGrandmotherId,
      animal.paternalGreatGrandfatherPaternalId,
      animal.paternalGreatGrandmotherPaternalId,
      animal.paternalGreatGrandfatherMaternalId,
      animal.paternalGreatGrandmotherMaternalId,
      animal.maternalGreatGrandfatherPaternalId,
      animal.maternalGreatGrandmotherPaternalId,
      animal.maternalGreatGrandfatherMaternalId,
      animal.maternalGreatGrandmotherMaternalId
    ];

    pedigreeFields.forEach(field => {
      if (field && typeof field === 'string' && field.trim()) {
        const cleanName = field.trim().toUpperCase();
        if (!lineage.includes(cleanName)) {
          lineage.push(cleanName);
        }
      }
    });

    return lineage;
  }

  private static findCommonAncestors(maleLineage: string[], femaleLineage: string[]): string[] {
    return maleLineage.filter(ancestor => femaleLineage.includes(ancestor));
  }

  private static calculateInbreedingCoefficient(commonAncestors: string[], maleLineage: string[], femaleLineage: string[]): number {
    if (commonAncestors.length === 0) return 0;
    
    let coefficient = 0;
    commonAncestors.forEach(ancestor => {
      coefficient += 0.0625;
    });
    
    return Math.min(coefficient, 0.5);
  }

  private static calculateGeneticDiversity(maleLineage: string[], femaleLineage: string[], commonAncestors: string[]): number {
    const totalUniqueAncestors = new Set([...maleLineage, ...femaleLineage]).size;
    const totalAncestors = maleLineage.length + femaleLineage.length;
    const diversityRatio = totalAncestors > 0 ? totalUniqueAncestors / totalAncestors : 0;
    
    const commonPenalty = commonAncestors.length * 0.1;
    
    return Math.max(0, Math.min(100, (diversityRatio * 100) - (commonPenalty * 10)));
  }

  private static calculateCompatibilityScore(
    inbreedingCoeff: number, 
    geneticDiversity: number, 
    maleLineage: string[], 
    femaleLineage: string[],
    species: string
  ): number {
    let score = geneticDiversity * 0.4;
    
    const inbreedingScore = Math.max(0, 100 - (inbreedingCoeff * 800));
    score += inbreedingScore * 0.4;
    
    const completenessScore = Math.min(100, (maleLineage.length + femaleLineage.length) * 7.5);
    score += completenessScore * 0.2;
    
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  private static generateUniversalRecommendations(
    male: Animal, 
    female: Animal, 
    riskLevel: 'low' | 'moderate' | 'high', 
    geneticDiversity: number, 
    commonAncestors: string[],
    species: string
  ): string[] {
    const recommendations: string[] = [];
    const speciesConfig = SpeciesConfigService.getSpeciesConfig(species);
    
    // Risk-based recommendations
    if (riskLevel === 'low') {
      recommendations.push(`✅ Excelente compatibilidad genética para ${speciesConfig?.name || species}`);
      recommendations.push('🌟 Apareamiento recomendado - bajo riesgo de consanguinidad');
    } else if (riskLevel === 'moderate') {
      recommendations.push('⚠️ Consanguinidad moderada detectada');
      recommendations.push('🔍 Recomendado hacer análisis genético antes del apareamiento');
    } else {
      recommendations.push('🚫 Alto riesgo de consanguinidad - apareamiento no recomendado');
      recommendations.push(`📋 Buscar otros ${speciesConfig?.name || species} con linajes diferentes`);
    }

    // Genetic diversity recommendations
    if (geneticDiversity > 75) {
      recommendations.push('🧬 Excelente diversidad genética esperada en la descendencia');
    } else if (geneticDiversity > 50) {
      recommendations.push('📈 Buena diversidad genética, descendencia saludable esperada');
    } else {
      recommendations.push('📉 Diversidad genética limitada - considerar otros apareamientos');
    }

    // Species-specific advice
    if (speciesConfig) {
      recommendations.push(`📅 Mejor época: ${speciesConfig.optimalBreedingMonths.join(', ')}`);
      recommendations.push(`🤱 Gestación esperada: ${speciesConfig.gestationDays} días`);
    }

    // Common ancestors warning
    if (commonAncestors.length > 0) {
      recommendations.push(`⚠️ Ancestros comunes detectados: ${commonAncestors.slice(0, 2).join(', ')}`);
    }

    return recommendations;
  }

  static async generateUniversalBreedingRecommendations(): Promise<UniversalBreedingRecommendation[]> {
    console.log('💡 Generating universal breeding recommendations for all species...');
    
    try {
      const { males, females } = await this.getBreedingPairsBySpecies();
      
      if (males.length === 0 || females.length === 0) {
        console.log('No valid breeding pairs found - insufficient males or females');
        return [];
      }

      const recommendations: UniversalBreedingRecommendation[] = [];

      // Group by species for better organization
      const speciesGroups = new Set([...males.map(m => m.species), ...females.map(f => f.species)]);

      for (const species of speciesGroups) {
        const speciesMales = males.filter(m => m.species === species);
        const speciesFemales = females.filter(f => f.species === species);

        console.log(`Processing species ${species}: ${speciesMales.length} males, ${speciesFemales.length} females`);

        // Only analyze valid male x female combinations
        for (const male of speciesMales) {
          for (const female of speciesFemales) {
            try {
              const analysis = await this.analyzeUniversalPair(male, female);
              
              const speciesConfig = SpeciesConfigService.getSpeciesConfig(species);
              
              const recommendation: UniversalBreedingRecommendation = {
                pairId: `${male.id}-${female.id}`,
                maleName: male.name,
                femaleName: female.name,
                species,
                breed: male.breed || female.breed,
                compatibilityScore: analysis.compatibilityScore,
                breedingWindow: analysis.optimalBreedingWindow,
                seasonalAdvice: analysis.speciesSpecificAdvice.slice(0, 3),
                geneticBenefits: [
                  `Diversidad genética: ${analysis.geneticDiversityScore.toFixed(1)}%`,
                  `Preservación del linaje de ${speciesConfig?.name || species}`,
                  analysis.riskLevel === 'low' ? 'Bajo riesgo genético' : 'Monitoreo genético recomendado'
                ],
                considerations: analysis.recommendations.slice(0, 3),
                isSpecialBreed: analysis.breedInfo?.isSpecialBreed || false,
                gestationDays: analysis.expectedGestationDays
              };

              recommendations.push(recommendation);
            } catch (error) {
              console.error(`Error analyzing pair ${male.name} (${male.gender}) x ${female.name} (${female.gender}):`, error);
            }
          }
        }
      }

      console.log(`Generated ${recommendations.length} valid breeding recommendations`);
      return recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    } catch (error) {
      console.error('Error generating universal breeding recommendations:', error);
      return [];
    }
  }
}
