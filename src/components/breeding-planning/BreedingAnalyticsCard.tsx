
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
        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(analytics.pregnancyRate)}%
            </div>
            <div className="text-sm text-gray-600">Tasa de Embarazo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.totalBreedings}
            </div>
            <div className="text-sm text-gray-600">Total Cruces</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(analytics.avgGestationLength)}
            </div>
            <div className="text-sm text-gray-600">Días Gestación</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {analytics.upcomingBirths}
            </div>
            <div className="text-sm text-gray-600">Próximos Partos</div>
          </div>
        </div>

        {/* Top Performing Females */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Mejores Hembras
          </h4>
          <div className="space-y-2">
            {analytics.topPerformingFemales.slice(0, 3).map((female, index) => (
              <div key={female.animalId} className="flex justify-between items-center text-sm">
                <span className="truncate">{female.animalName}</span>
                <span className="text-pink-600 font-medium">{female.pregnancies}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Breeding Status Chart */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Estado de Reproducciones
          </h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            {analytics.breedingsByStatus.map((status, index) => (
              <div key={index}>
                <div className="text-lg font-bold text-blue-600">
                  {status.count}
                </div>
                <div className="text-xs text-gray-600">{status.status}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreedingAnalyticsCard;
