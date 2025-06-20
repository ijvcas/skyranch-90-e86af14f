
export class SeasonalBreedingAnalyzer {
  
  static analyzeSeasonalTrends(monthlyData: Array<{month: string, breedings: number, pregnancies: number}>): {
    bestMonths: string[];
    worstMonths: string[];
    recommendations: string[];
  } {
    // Sort months by pregnancy success rate
    const monthsWithRates = monthlyData
      .filter(m => m.breedings > 0)
      .map(m => ({
        month: m.month,
        rate: m.pregnancies / m.breedings
      }))
      .sort((a, b) => b.rate - a.rate);

    const bestMonths = monthsWithRates.slice(0, 2).map(m => m.month);
    const worstMonths = monthsWithRates.slice(-2).map(m => m.month);

    const recommendations = [];
    if (bestMonths.length > 0) {
      recommendations.push(`Mejores meses para apareamiento de burros: ${bestMonths.join(', ')}`);
    }
    if (worstMonths.length > 0) {
      recommendations.push(`Evitar apareamientos en: ${worstMonths.join(', ')}`);
    }
    
    // Donkey-specific seasonal recommendations
    recommendations.push('Para burros: la primavera (marzo-mayo) es óptima para apareamientos');
    recommendations.push('Gestación de 12-14 meses: planificar nacimientos para primavera siguiente');

    return {
      bestMonths,
      worstMonths,
      recommendations
    };
  }
}
