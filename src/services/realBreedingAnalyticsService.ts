import { supabase } from '@/integrations/supabase/client';

export interface RealBreedingAnalytics {
  totalBreedings: number;
  pregnancyRate: number;
  avgGestationLength: number;
  upcomingBirths: number;
  breedingsByMonth: Array<{
    month: string;
    breedings: number;
    pregnancies: number;
  }>;
  breedingsByStatus: Array<{
    status: string;
    count: number;
  }>;
  topPerformingFemales: Array<{
    animalId: string;
    animalName: string;
    pregnancies: number;
    successRate: number;
  }>;
  seasonalTrends: {
    bestMonths: string[];
    worstMonths: string[];
    recommendations: string[];
  };
  donkeySpecificData: {
    totalDonkeyBreedings: number;
    lunaBreedings: number;
    lascauxBreedings: number;
    frenchLineagePreservation: string;
  };
}

export class RealBreedingAnalyticsService {
  
  static async getAnalytics(): Promise<RealBreedingAnalytics> {
    console.log('📊 Getting real breeding analytics for donkeys...');
    
    try {
      // Get all breeding records
      const { data: breedingRecords } = await supabase
        .from('breeding_records')
        .select('*')
        .order('breeding_date', { ascending: false });

      // Get all animals for name mapping, focusing on donkeys
      const { data: animals } = await supabase
        .from('animals')
        .select('id, name, species')
        .eq('species', 'equino');

      const animalNames = new Map(animals?.map(a => [a.id, a.name]) || []);

      if (!breedingRecords) {
        return this.getEmptyAnalytics();
      }

      // Filter breeding records for donkeys only
      const donkeyBreedings = breedingRecords.filter(record => {
        const motherName = animalNames.get(record.mother_id);
        const fatherName = animalNames.get(record.father_id);
        return motherName || fatherName; // At least one parent should be a registered donkey
      });

      const totalBreedings = donkeyBreedings.length;
      const confirmedPregnancies = donkeyBreedings.filter(r => r.pregnancy_confirmed).length;
      const pregnancyRate = totalBreedings > 0 ? (confirmedPregnancies / totalBreedings) * 100 : 0;

      // Calculate average gestation length for donkeys (should be around 12-14 months)
      const completedBirths = donkeyBreedings.filter(r => r.actual_birth_date && r.breeding_date);
      const gestationLengths = completedBirths.map(r => {
        const breedingDate = new Date(r.breeding_date);
        const birthDate = new Date(r.actual_birth_date!);
        return Math.floor((birthDate.getTime() - breedingDate.getTime()) / (1000 * 60 * 60 * 24));
      });
      const avgGestationLength = gestationLengths.length > 0 
        ? Math.round(gestationLengths.reduce((a, b) => a + b, 0) / gestationLengths.length)
        : 0;

      // Calculate upcoming births
      const now = new Date();
      const upcomingBirths = donkeyBreedings.filter(r => {
        if (!r.expected_due_date) return false;
        const dueDate = new Date(r.expected_due_date);
        const daysDiff = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff <= 60; // Within next 60 days for donkeys
      }).length;

      // Breedings by month for donkeys
      const breedingsByMonth = this.calculateBreedingsByMonth(donkeyBreedings);

      // Breedings by status
      const statusCounts = new Map<string, number>();
      donkeyBreedings.forEach(r => {
        statusCounts.set(r.status, (statusCounts.get(r.status) || 0) + 1);
      });

      const breedingsByStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({
        status: this.translateStatus(status),
        count
      }));

      // Top performing donkey females
      const topPerformingFemales = this.calculateTopPerformingFemales(donkeyBreedings, animalNames);

      // Seasonal trends
      const seasonalTrends = this.analyzeSeasonalTrends(breedingsByMonth);

      // Donkey-specific data
      const donkeySpecificData = this.calculateDonkeySpecificData(donkeyBreedings, animalNames);

      return {
        totalBreedings,
        pregnancyRate: Math.round(pregnancyRate * 10) / 10,
        avgGestationLength,
        upcomingBirths,
        breedingsByMonth,
        breedingsByStatus,
        topPerformingFemales,
        seasonalTrends,
        donkeySpecificData
      };
    } catch (error) {
      console.error('Error getting real breeding analytics:', error);
      return this.getEmptyAnalytics();
    }
  }

  private static calculateDonkeySpecificData(records: any[], animalNames: Map<string, string>) {
    const lunaBreedings = records.filter(r => {
      const motherName = animalNames.get(r.mother_id);
      const fatherName = animalNames.get(r.father_id);
      return (motherName && motherName.toUpperCase().includes('LUNA')) || 
             (fatherName && fatherName.toUpperCase().includes('LUNA'));
    }).length;

    const lascauxBreedings = records.filter(r => {
      const motherName = animalNames.get(r.mother_id);
      const fatherName = animalNames.get(r.father_id);
      return (motherName && motherName.toUpperCase().includes('LASCAUX')) || 
             (fatherName && fatherName.toUpperCase().includes('LASCAUX'));
    }).length;

    let frenchLineagePreservation = 'No hay registros suficientes';
    if (records.length > 0) {
      frenchLineagePreservation = lunaBreedings + lascauxBreedings > 0 
        ? 'Linaje francés DU VERN activo'
        : 'Considerar apareamientos para preservar linaje francés';
    }

    return {
      totalDonkeyBreedings: records.length,
      lunaBreedings,
      lascauxBreedings,
      frenchLineagePreservation
    };
  }

  private static getEmptyAnalytics(): RealBreedingAnalytics {
    return {
      totalBreedings: 0,
      pregnancyRate: 0,
      avgGestationLength: 0,
      upcomingBirths: 0,
      breedingsByMonth: [],
      breedingsByStatus: [],
      topPerformingFemales: [],
      seasonalTrends: {
        bestMonths: [],
        worstMonths: [],
        recommendations: ['Registra apareamientos de burros para obtener análisis de tendencias']
      },
      donkeySpecificData: {
        totalDonkeyBreedings: 0,
        lunaBreedings: 0,
        lascauxBreedings: 0,
        frenchLineagePreservation: 'Registra apareamientos para análisis de linaje francés'
      }
    };
  }

  private static calculateBreedingsByMonth(records: any[]): Array<{month: string, breedings: number, pregnancies: number}> {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthlyData = new Map<number, {breedings: number, pregnancies: number}>();

    // Initialize all months
    for (let i = 0; i < 12; i++) {
      monthlyData.set(i, {breedings: 0, pregnancies: 0});
    }

    records.forEach(record => {
      const month = new Date(record.breeding_date).getMonth();
      const data = monthlyData.get(month)!;
      data.breedings++;
      if (record.pregnancy_confirmed) {
        data.pregnancies++;
      }
    });

    return Array.from(monthlyData.entries()).map(([monthIndex, data]) => ({
      month: monthNames[monthIndex],
      breedings: data.breedings,
      pregnancies: data.pregnancies
    }));
  }

  private static calculateTopPerformingFemales(records: any[], animalNames: Map<string, string>): Array<{
    animalId: string;
    animalName: string;
    pregnancies: number;
    successRate: number;
  }> {
    const femaleStats = new Map<string, {breedings: number, pregnancies: number}>();

    records.forEach(record => {
      const femaleId = record.mother_id;
      if (!femaleStats.has(femaleId)) {
        femaleStats.set(femaleId, {breedings: 0, pregnancies: 0});
      }
      const stats = femaleStats.get(femaleId)!;
      stats.breedings++;
      if (record.pregnancy_confirmed) {
        stats.pregnancies++;
      }
    });

    return Array.from(femaleStats.entries())
      .map(([animalId, stats]) => ({
        animalId,
        animalName: animalNames.get(animalId) || 'Desconocido',
        pregnancies: stats.pregnancies,
        successRate: stats.breedings > 0 ? Math.round((stats.pregnancies / stats.breedings) * 100 * 10) / 10 : 0
      }))
      .filter(female => female.pregnancies > 0)
      .sort((a, b) => b.pregnancies - a.pregnancies)
      .slice(0, 5);
  }

  private static analyzeSeasonalTrends(monthlyData: Array<{month: string, breedings: number, pregnancies: number}>): {
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

  private static translateStatus(status: string): string {
    const translations: Record<string, string> = {
      'planned': 'Planeado',
      'confirmed_pregnant': 'Embarazo Confirmado',
      'birth_completed': 'Parto Completado',
      'not_pregnant': 'No Embarazada',
      'failed': 'Fallido',
      'completed': 'Completado'
    };
    return translations[status] || status;
  }
}
