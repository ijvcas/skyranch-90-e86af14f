
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BreedingAnalyticsCard from './BreedingAnalyticsCard';
import BreedingRecommendationsCard from './BreedingRecommendationsCard';
import BreedingGoalsCard from './BreedingGoalsCard';
import SeasonalPlanningCard from './SeasonalPlanningCard';

const BreedingPlanningTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Planificación Reproductiva</h2>
          <p className="text-muted-foreground">
            Sistema de análisis genético y recomendaciones basado en datos reales
          </p>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Análisis Real</TabsTrigger>
          <TabsTrigger value="recommendations">Análisis Genético</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
          <TabsTrigger value="seasonal">Planificación Estacional</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <BreedingAnalyticsCard />
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
