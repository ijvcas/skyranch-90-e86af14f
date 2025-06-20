
import type { Animal } from '@/stores/animalStore';
import { SpeciesConfigService } from '@/services/species/speciesConfig';

export class RecommendationService {
  static generateEnhancedRecommendations(
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
}
