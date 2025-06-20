
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
