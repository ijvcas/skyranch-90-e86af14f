
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Heart, Calendar } from 'lucide-react';
import BreedingGoalsCard from './BreedingGoalsCard';
import BreedingAnalyticsCard from './BreedingAnalyticsCard';
import BreedingRecommendationsCard from './BreedingRecommendationsCard';
import SeasonalPlanningCard from './SeasonalPlanningCard';

const BreedingPlanningTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Card with Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <span>Planificación Estratégica de Apareamientos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 text-lg mb-4">
            Utiliza herramientas avanzadas de análisis y planificación para optimizar tu programa de apareamientos,
            mejorar la genética del hato y maximizar la productividad de tu rancho.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
              <Target className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Objetivos</p>
                <p className="text-sm text-gray-600">Define metas claras</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-800">Análisis</p>
                <p className="text-sm text-gray-600">Rendimiento histórico</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
              <Heart className="w-8 h-8 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">Recomendaciones</p>
                <p className="text-sm text-gray-600">Parejas ideales</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-semibold text-purple-800">Estacional</p>
                <p className="text-sm text-gray-600">Planificación por época</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Planning Components */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BreedingGoalsCard />
        <BreedingAnalyticsCard />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BreedingRecommendationsCard />
        <SeasonalPlanningCard />
      </div>

      {/* Additional Planning Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Capacidad del Rancho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hembras reproductivas</span>
                <span className="font-semibold">45/60</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs text-gray-500">75% de capacidad utilizada</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Partos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Esta semana</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Próximas 2 semanas</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">7</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Este mes</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">12</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recursos Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Instalaciones de parto</span>
                <span className="text-green-600 font-medium">8 disponibles</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Personal veterinario</span>
                <span className="text-blue-600 font-medium">Dr. García</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Medicamentos</span>
                <span className="text-yellow-600 font-medium">Revisar stock</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BreedingPlanningTab;
