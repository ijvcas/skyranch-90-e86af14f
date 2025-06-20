
export class BreedingDataCalculator {
  
  static calculateBreedingsByMonth(records: any[]): Array<{month: string, breedings: number, pregnancies: number}> {
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

  static calculateTopPerformingFemales(records: any[], animalNames: Map<string, string>): Array<{
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

  static calculateDonkeySpecificData(records: any[], animalNames: Map<string, string>) {
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
}
