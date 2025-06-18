
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Heart, Calendar, Award } from 'lucide-react';
import { BreedingAnalytics } from '@/services/breedingAnalyticsService';

interface BreedingAnalyticsCardProps {
  analytics: BreedingAnalytics;
}

const BreedingAnalyticsCard: React.FC<BreedingAnalyticsCardProps> = ({ analytics }) => {
  const formatNumber = (value: number | string): string => {
    if (typeof value === 'number') {
      return value.toFixed(1);
    }
    return value;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Análisis de Reproducción
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Success Rate */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(analytics.successRate)}%
            </div>
            <div className="text-sm text-gray-600">Tasa de Éxito</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.totalBreedings}
            </div>
            <div className="text-sm text-gray-600">Total Cruces</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(analytics.averageGestationLength)}
            </div>
            <div className="text-sm text-gray-600">Días Gestación</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatNumber(analytics.lineageStats.diversityScore)}%
            </div>
            <div className="text-sm text-gray-600">Diversidad</div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Mejores Machos
            </h4>
            <div className="space-y-2">
              {analytics.topPerformingMales.slice(0, 3).map((male, index) => (
                <div key={male.id} className="flex justify-between items-center text-sm">
                  <span className="truncate">{male.name}</span>
                  <span className="text-green-600 font-medium">{male.successfulBreedings}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Mejores Hembras
            </h4>
            <div className="space-y-2">
              {analytics.topPerformingFemales.slice(0, 3).map((female, index) => (
                <div key={female.id} className="flex justify-between items-center text-sm">
                  <span className="truncate">{female.name}</span>
                  <span className="text-pink-600 font-medium">{female.successfulBreedings}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health Stats */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Estadísticas de Salud
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">
                {analytics.healthStats.healthyOffspring}
              </div>
              <div className="text-xs text-gray-600">Crías Sanas</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">
                {analytics.healthStats.complicatedDeliveries}
              </div>
              <div className="text-xs text-gray-600">Partos Complicados</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {analytics.healthStats.totalOffspring}
              </div>
              <div className="text-xs text-gray-600">Total Crías</div>
            </div>
          </div>
        </div>

        {/* Inbreeding Warning */}
        {analytics.lineageStats.inbredPercentage > 10 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Advertencia:</strong> Se detectó un {formatNumber(analytics.lineageStats.inbredPercentage)}% de consanguinidad en el rebaño. 
                  Considere introducir nuevos reproductores para mejorar la diversidad genética.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BreedingAnalyticsCard;
