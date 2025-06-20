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
  relationshipWarning?: string;
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

export interface FamilyRelationship {
  type: 'parent-child' | 'siblings' | 'grandparent-grandchild' | 'none';
  details: string;
  shouldBlock: boolean;
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

      // Enhanced gender filtering with better logging
      const males = convertedAnimals.filter(a => {
        const gender = a.gender?.toLowerCase().trim();
        const isMale = gender === 'male' || gender === 'macho';
        console.log(`🔍 Animal ${a.name} (${a.tag}) - Gender: "${a.gender}" -> Normalized: "${gender}" -> Is Male: ${isMale}`);
        return isMale;
      });
      
      const females = convertedAnimals.filter(a => {
        const gender = a.gender?.toLowerCase().trim();
        const isFemale = gender === 'female' || gender === 'hembra';
        console.log(`🔍 Animal ${a.name} (${a.tag}) - Gender: "${a.gender}" -> Normalized: "${gender}" -> Is Female: ${isFemale}`);
        return isFemale;
      });

      console.log(`Found ${males.length} males and ${females.length} females`);
      console.log('Males:', males.map(m => `${m.name} (${m.gender})`));
      console.log('Females:', females.map(f => `${f.name} (${f.gender})`));
      
      // Log animals that weren't categorized
      const uncategorized = convertedAnimals.filter(a => {
        const gender = a.gender?.toLowerCase().trim();
        return !(gender === 'male' || gender === 'macho' || gender === 'female' || gender === 'hembra');
      });
      
      if (uncategorized.length > 0) {
        console.log('⚠️ Uncategorized animals (unknown gender):', uncategorized.map(a => `${a.name} (${a.gender || 'undefined'})`));
      }
      
      return { males, females };
    } catch (error) {
      console.error('Error getting breeding pairs:', error);
      return { males: [], females: [] };
    }
  }

  static async detectFamilyRelationship(animal1: Animal, animal2: Animal): Promise<FamilyRelationship> {
    console.log(`🔍 Checking family relationship between ${animal1.name} and ${animal2.name}`);
    
    try {
      // Get all animals to cross-reference parent names/IDs
      const { data: allAnimals } = await supabase
        .from('animals')
        .select('id, name, mother_id, father_id');

      if (!allAnimals) {
        return { type: 'none', details: 'Unable to verify relationships', shouldBlock: false };
      }

      const animalMap = new Map(allAnimals.map(a => [a.id, a]));
      const nameToIdMap = new Map(allAnimals.map(a => [a.name.toLowerCase(), a.id]));

      // Helper function to resolve parent ID from either UUID or name
      const resolveParentId = (parentValue: string | undefined): string | null => {
        if (!parentValue || parentValue.trim() === '') return null;
        
        // If it's already a UUID and exists in our animal map
        if (animalMap.has(parentValue)) {
          return parentValue;
        }
        
        // Try to find by name (case insensitive)
        const normalizedName = parentValue.toLowerCase().trim();
        return nameToIdMap.get(normalizedName) || null;
      };

      // Resolve parent IDs for both animals
      const animal1MotherId = resolveParentId(animal1.motherId);
      const animal1FatherId = resolveParentId(animal1.fatherId);
      const animal2MotherId = resolveParentId(animal2.motherId);
      const animal2FatherId = resolveParentId(animal2.fatherId);

      console.log(`${animal1.name} parents: mother=${animal1MotherId}, father=${animal1FatherId}`);
      console.log(`${animal2.name} parents: mother=${animal2MotherId}, father=${animal2FatherId}`);

      // Check if one is the parent of the other
      if (animal1.id === animal2MotherId || animal1.id === animal2FatherId) {
        return {
          type: 'parent-child',
          details: `${animal1.name} is the parent of ${animal2.name}`,
          shouldBlock: true
        };
      }

      if (animal2.id === animal1MotherId || animal2.id === animal1FatherId) {
        return {
          type: 'parent-child',
          details: `${animal2.name} is the parent of ${animal1.name}`,
          shouldBlock: true
        };
      }

      // Check if they are siblings (share same mother or father)
      if (animal1MotherId && animal2MotherId && animal1MotherId === animal2MotherId) {
        const motherAnimal = animalMap.get(animal1MotherId);
        return {
          type: 'siblings',
          details: `Both animals share the same mother: ${motherAnimal?.name || 'Unknown'}`,
          shouldBlock: true
        };
      }

      if (animal1FatherId && animal2FatherId && animal1FatherId === animal2FatherId) {
        const fatherAnimal = animalMap.get(animal1FatherId);
        return {
          type: 'siblings',
          details: `Both animals share the same father: ${fatherAnimal?.name || 'Unknown'}`,
          shouldBlock: true
        };
      }

      // Check for grandparent-grandchild relationships
      const animal1Grandparents = [
        resolveParentId(animal1.paternalGrandfatherId),
        resolveParentId(animal1.paternalGrandmotherId),
        resolveParentId(animal1.maternalGrandfatherId),
        resolveParentId(animal1.maternalGrandmotherId)
      ].filter(Boolean);

      if (animal1Grandparents.includes(animal2.id)) {
        return {
          type: 'grandparent-grandchild',
          details: `${animal2.name} is a grandparent of ${animal1.name}`,
          shouldBlock: true
        };
      }

      const animal2Grandparents = [
        resolveParentId(animal2.paternalGrandfatherId),
        resolveParentId(animal2.paternalGrandmotherId),
        resolveParentId(animal2.maternalGrandfatherId),
        resolveParentId(animal2.maternalGrandmotherId)
      ].filter(Boolean);

      if (animal2Grandparents.includes(animal1.id)) {
        return {
          type: 'grandparent-grandchild',
          details: `${animal1.name} is a grandparent of ${animal2.name}`,
          shouldBlock: true
        };
      }

      return { type: 'none', details: 'No direct family relationship detected', shouldBlock: false };

    } catch (error) {
      console.error('Error detecting family relationship:', error);
      return { type: 'none', details: 'Error checking relationships', shouldBlock: false };
    }
  }

  static async analyzeUniversalPair(male: Animal, female: Animal): Promise<UniversalPedigreeAnalysis> {
    console.log(`🧬 Analyzing universal pair: ${male.name} (${male.species}, ${male.gender}) x ${female.name} (${female.species}, ${female.gender})`);
    
    // Validate that we have male x female pairing
    const maleGender = male.gender?.toLowerCase().trim();
    const femaleGender = female.gender?.toLowerCase().trim();
    const isMale = maleGender === 'male' || maleGender === 'macho';
    const isFemale = femaleGender === 'female' || femaleGender === 'hembra';
    
    if (!isMale || !isFemale) {
      throw new Error(`Invalid breeding pair: ${male.name} (${male.gender}) x ${female.name} (${female.gender}). Only male x female pairings are allowed.`);
    }
    
    // Ensure same species
    if (male.species !== female.species) {
      throw new Error('Cannot analyze cross-species breeding');
    }

    // Check for family relationships first
    const familyRelationship = await this.detectFamilyRelationship(male, female);
    
    if (familyRelationship.shouldBlock) {
      console.log(`❌ Blocking breeding pair due to family relationship: ${familyRelationship.details}`);
      return {
        maleId: male.id,
        maleName: male.name,
        femaleId: female.id,
        femaleName: female.name,
        species: male.species,
        compatibilityScore: 0,
        inbreedingCoefficient: 1.0,
        riskLevel: 'high',
        commonAncestors: [],
        geneticDiversityScore: 0,
        recommendations: [
          '🚫 APAREAMIENTO BLOQUEADO - Relación familiar directa detectada',
          `⚠️ ${familyRelationship.details}`,
          '📋 Buscar animales sin relación familiar para apareamiento'
        ],
        speciesSpecificAdvice: ['No recomendado debido a relación familiar'],
        optimalBreedingWindow: 'No aplicable',
        expectedGestationDays: 0,
        relationshipWarning: familyRelationship.details
      };
    }

    const species = male.species;
    const speciesConfig = SpeciesConfigService.getSpeciesConfig(species);
    
    if (!speciesConfig) {
      throw new Error(`Species configuration not found for: ${species}`);
    }

    // Extract lineage information
    const maleLineage = this.extractLineage(male);
    const femaleLineage = this.extractLineage(female);
    
    console.log(`${male.name} lineage depth: ${maleLineage.length}`);
    console.log(`${female.name} lineage depth: ${femaleLineage.length}`);
    
    // Find common ancestors
    const commonAncestors = this.findCommonAncestors(maleLineage, femaleLineage);
    
    // Calculate inbreeding coefficient
    const inbreedingCoefficient = this.calculateInbreedingCoefficient(commonAncestors, maleLineage, femaleLineage);
    
    // Determine risk level using species-specific thresholds
    const riskLevel = SpeciesConfigService.getInbreedingRiskLevel(species, inbreedingCoefficient);
    
    // Calculate genetic diversity with improved algorithm
    const geneticDiversityScore = this.calculateImprovedGeneticDiversity(male, female, maleLineage, femaleLineage, commonAncestors);
    
    // Calculate compatibility score with enhanced algorithm
    const compatibilityScore = this.calculateEnhancedCompatibilityScore(
      male, female, inbreedingCoefficient, geneticDiversityScore, maleLineage, femaleLineage, species
    );
    
    // Check for special breeds
    const maleBreedInfo = male.breed ? SpeciesConfigService.getSpecialBreedConfig(species, male.breed) : null;
    const femaleBreedInfo = female.breed ? SpeciesConfigService.getSpecialBreedConfig(species, female.breed) : null;
    const isSpecialBreed = !!(maleBreedInfo || femaleBreedInfo);

    // Generate recommendations
    const recommendations = this.generateEnhancedRecommendations(
      male, female, riskLevel, geneticDiversityScore, commonAncestors, species, compatibilityScore
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
      coefficient += 0.0625; // Standard coefficient for shared ancestors
    });
    
    return Math.min(coefficient, 0.5);
  }

  private static calculateImprovedGeneticDiversity(
    male: Animal, 
    female: Animal, 
    maleLineage: string[], 
    femaleLineage: string[], 
    commonAncestors: string[]
  ): number {
    // If both animals have no or minimal pedigree data, assume high genetic diversity
    if (maleLineage.length === 0 && femaleLineage.length === 0) {
      console.log('Both animals have no pedigree data - assuming high genetic diversity');
      return 85; // High diversity when no lineage conflicts are known
    }

    // If only one has pedigree data, assume moderate to high diversity
    if (maleLineage.length === 0 || femaleLineage.length === 0) {
      console.log('Only one animal has pedigree data - assuming good genetic diversity');
      return 75; // Good diversity when only partial data available
    }

    // Calculate diversity based on known lineage
    const totalUniqueAncestors = new Set([...maleLineage, ...femaleLineage]).size;
    const totalAncestors = maleLineage.length + femaleLineage.length;
    const diversityRatio = totalAncestors > 0 ? totalUniqueAncestors / totalAncestors : 1;
    
    // Penalize for common ancestors
    const commonPenalty = commonAncestors.length * 15; // Increased penalty for common ancestors
    
    const baseScore = diversityRatio * 100;
    const finalScore = Math.max(20, baseScore - commonPenalty); // Minimum score of 20%
    
    console.log(`Genetic diversity calculation: base=${baseScore.toFixed(1)}, penalty=${commonPenalty}, final=${finalScore.toFixed(1)}`);
    
    return Math.min(100, finalScore);
  }

  private static calculateEnhancedCompatibilityScore(
    male: Animal,
    female: Animal,
    inbreedingCoeff: number, 
    geneticDiversity: number, 
    maleLineage: string[], 
    femaleLineage: string[],
    species: string
  ): number {
    console.log(`Calculating compatibility for ${male.name} (${male.breed || 'no breed'}) x ${female.name} (${female.breed || 'no breed'})`);
    
    let score = 0;
    
    // Base genetic diversity component (40% weight)
    const diversityScore = geneticDiversity * 0.4;
    score += diversityScore;
    
    // Inbreeding risk component (30% weight)
    const inbreedingScore = Math.max(0, 100 - (inbreedingCoeff * 800)) * 0.3;
    score += inbreedingScore;
    
    // Special breed preservation bonus (20% weight)
    let breedBonus = 0;
    const specialBreeds = ['baudet de poitou', 'nez noir du valais'];
    const maleBreedLower = (male.breed || '').toLowerCase();
    const femaleBreedLower = (female.breed || '').toLowerCase();
    
    // Same special breed bonus
    if (maleBreedLower && femaleBreedLower && maleBreedLower === femaleBreedLower) {
      if (specialBreeds.some(breed => maleBreedLower.includes(breed))) {
        breedBonus = 90; // High bonus for same special breed
        console.log(`Special breed match bonus: ${maleBreedLower}`);
      } else {
        breedBonus = 70; // Good bonus for same regular breed
      }
    } else if (specialBreeds.some(breed => maleBreedLower.includes(breed) || femaleBreedLower.includes(breed))) {
      breedBonus = 60; // Moderate bonus for one special breed
    } else {
      breedBonus = 50; // Base score for different or unknown breeds
    }
    
    score += breedBonus * 0.2;
    
    // Pedigree completeness bonus (10% weight)
    const avgLineageDepth = (maleLineage.length + femaleLineage.length) / 2;
    const completenessScore = Math.min(100, avgLineageDepth * 12.5) * 0.1; // Max at 8 ancestors
    score += completenessScore;
    
    const finalScore = Math.round(Math.max(0, Math.min(100, score)));
    
    console.log(`Compatibility breakdown: diversity=${diversityScore.toFixed(1)}, inbreeding=${inbreedingScore.toFixed(1)}, breed=${(breedBonus * 0.2).toFixed(1)}, completeness=${completenessScore.toFixed(1)}, final=${finalScore}`);
    
    return finalScore;
  }

  private static generateEnhancedRecommendations(
    male: Animal, 
    female: Animal, 
    riskLevel: 'low' | 'moderate' | 'high', 
    geneticDiversity: number, 
    commonAncestors: string[],
    species: string,
    compatibilityScore: number
  ): string[] {
    const recommendations: string[] = [];
    const speciesConfig = SpeciesConfigService.getSpeciesConfig(species);
    
    // Compatibility-based recommendations
    if (compatibilityScore >= 80) {
      recommendations.push(`✅ Excelente compatibilidad (${compatibilityScore}%) para ${speciesConfig?.name || species}`);
      recommendations.push('🌟 Apareamiento altamente recomendado');
    } else if (compatibilityScore >= 60) {
      recommendations.push(`📈 Buena compatibilidad (${compatibilityScore}%) para apareamiento`);
      recommendations.push('👍 Apareamiento recomendado con monitoreo');
    } else if (compatibilityScore >= 40) {
      recommendations.push(`⚠️ Compatibilidad moderada (${compatibilityScore}%) - considerar con cuidado`);
      recommendations.push('🔍 Evaluar otras opciones disponibles');
    } else {
      recommendations.push(`❌ Baja compatibilidad (${compatibilityScore}%) - no recomendado`);
      recommendations.push('📋 Buscar mejores opciones de apareamiento');
    }

    // Risk-based recommendations
    if (riskLevel === 'high') {
      recommendations.push('🚫 Alto riesgo de consanguinidad detectado');
    } else if (riskLevel === 'moderate') {
      recommendations.push('⚠️ Consanguinidad moderada - monitorear descendencia');
    }

    // Breed-specific recommendations
    const maleBreedLower = (male.breed || '').toLowerCase();
    const femaleBreedLower = (female.breed || '').toLowerCase();
    
    if (maleBreedLower.includes('baudet') || femaleBreedLower.includes('baudet')) {
      recommendations.push('🇫🇷 Preservación del linaje francés Baudet de Poitou');
    }
    
    if (maleBreedLower.includes('nez noir') || femaleBreedLower.includes('nez noir')) {
      recommendations.push('🏔️ Conservación de raza alpina Nez Noir du Valais');
    }

    // Genetic diversity recommendations
    if (geneticDiversity > 80) {
      recommendations.push('🧬 Excelente diversidad genética esperada');
    } else if (geneticDiversity > 60) {
      recommendations.push('📊 Buena diversidad genética en descendencia');
    } else if (geneticDiversity > 40) {
      recommendations.push('📉 Diversidad genética limitada - considerar opciones');
    }

    // Species-specific timing advice
    if (speciesConfig) {
      recommendations.push(`📅 Mejor época: ${speciesConfig.optimalBreedingMonths.join(', ')}`);
      recommendations.push(`🤱 Gestación esperada: ${speciesConfig.gestationDays} días`);
    }

    // Common ancestors warning
    if (commonAncestors.length > 0) {
      recommendations.push(`⚠️ Ancestros comunes: ${commonAncestors.slice(0, 2).join(', ')}`);
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
              
              // Only include recommendations with acceptable compatibility scores
              if (analysis.compatibilityScore >= 30 && !analysis.relationshipWarning) {
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
              } else if (analysis.relationshipWarning) {
                console.log(`Blocked recommendation due to family relationship: ${male.name} x ${female.name} - ${analysis.relationshipWarning}`);
              } else {
                console.log(`Low compatibility recommendation filtered: ${male.name} x ${female.name} - ${analysis.compatibilityScore}%`);
              }
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
