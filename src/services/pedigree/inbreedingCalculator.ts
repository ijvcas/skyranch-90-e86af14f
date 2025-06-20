
import type { PedigreeNode, InbreedingAnalysis } from './types';
import { PedigreeTreeBuilder } from './pedigreeTreeBuilder';

export class InbreedingCalculator {
  
  static calculateInbreedingCoefficient(pedigree: PedigreeNode): InbreedingAnalysis {
    console.log('🧮 Calculating inbreeding coefficient for:', pedigree.name);
    
    const ancestors = PedigreeTreeBuilder.getAllAncestors(pedigree);
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

  static calculatePotentialInbreeding(malePedigree: PedigreeNode, femalePedigree: PedigreeNode): InbreedingAnalysis {
    // Simplified analysis of potential common ancestors
    const maleAncestors = PedigreeTreeBuilder.getAllAncestors(malePedigree);
    const femaleAncestors = PedigreeTreeBuilder.getAllAncestors(femalePedigree);
    
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
}
