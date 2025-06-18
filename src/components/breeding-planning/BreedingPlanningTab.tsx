
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BreedingAnalyticsCard from './BreedingAnalyticsCard';
import BreedingRecommendationsCard from './BreedingRecommendationsCard';
import BreedingGoalsCard from './BreedingGoalsCard';
import SeasonalPlanningCard from './SeasonalPlanningCard';

const BreedingPlanningTab = () => {
  // Mock analytics data - in a real app, this would come from a hook or API
  const mockAnalytics = {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Planificación Reproductiva</h2>
          <p className="text-muted-foreground">
            Analiza el rendimiento reproductivo y planifica futuros cruces
          </p>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
          <TabsTrigger value="seasonal">Planificación Estacional</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <BreedingAnalyticsCard analytics={mockAnalytics} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <BreedingRecommendationsCard />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <BreedingGoalsCard />
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-6">
          <SeasonalPlanningCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BreedingPlanningTab;
