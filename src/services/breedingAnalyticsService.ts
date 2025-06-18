
export interface BreedingAnalytics {
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
}

export interface BreedingRecommendation {
  id: string;
  type: 'breeding_window' | 'health_check' | 'nutrition' | 'rest_period';
  animalId: string;
  animalName: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
}

export class BreedingAnalyticsService {
  // Mock data for now - replace with actual API calls
  static async getAnalytics(): Promise<BreedingAnalytics> {
    return {
      totalBreedings: 45,
      pregnancyRate: 78.5,
      avgGestationLength: 283,
      upcomingBirths: 8,
      breedingsByMonth: [
        { month: 'Ene', breedings: 5, pregnancies: 4 },
        { month: 'Feb', breedings: 8, pregnancies: 6 },
        { month: 'Mar', breedings: 6, pregnancies: 5 },
        { month: 'Abr', breedings: 7, pregnancies: 6 },
        { month: 'May', breedings: 4, pregnancies: 3 },
        { month: 'Jun', breedings: 9, pregnancies: 7 },
      ],
      breedingsByStatus: [
        { status: 'Confirmado', count: 15 },
        { status: 'Pendiente', count: 8 },
        { status: 'Fallido', count: 5 },
        { status: 'Nacido', count: 17 },
      ],
      topPerformingFemales: [
        { animalId: '1', animalName: 'Bella', pregnancies: 3, successRate: 85.7 },
        { animalId: '2', animalName: 'Luna', pregnancies: 2, successRate: 80.0 },
        { animalId: '3', animalName: 'Rosa', pregnancies: 4, successRate: 75.0 },
      ]
    };
  }

  static async getRecommendations(): Promise<BreedingRecommendation[]> {
    return [
      {
        id: '1',
        type: 'breeding_window',
        animalId: '1',
        animalName: 'Bella',
        title: 'Ventana de cría óptima',
        description: 'Bella está en el momento ideal para la reproducción basado en su ciclo.',
        priority: 'high',
        dueDate: '2024-07-15'
      },
      {
        id: '2',
        type: 'health_check',
        animalId: '2',
        animalName: 'Luna',
        title: 'Chequeo veterinario recomendado',
        description: 'Programar revisión antes del próximo período de cría.',
        priority: 'medium',
        dueDate: '2024-07-20'
      }
    ];
  }
}

// Export the service instance for backward compatibility
export const breedingAnalyticsService = BreedingAnalyticsService;
