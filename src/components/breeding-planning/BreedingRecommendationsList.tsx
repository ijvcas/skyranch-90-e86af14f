
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star } from 'lucide-react';
import { PedigreeAnalysisService, type BreedingRecommendation } from '@/services/pedigreeAnalysisService';

const BreedingRecommendationsList: React.FC = () => {
  const [breedingRecommendations, setBreedingRecommendations] = useState<BreedingRecommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  useEffect(() => {
    loadBreedingRecommendations();
  }, []);

  const loadBreedingRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
      const recommendations = await PedigreeAnalysisService.generateBreedingRecommendations();
      setBreedingRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading breeding recommendations:', error);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskColor = (riskLevel: 'low' | 'moderate' | 'high') => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (recommendationsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Recomendaciones de Apareamiento Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500">Generando recomendaciones basadas en análisis genético...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (breedingRecommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Recomendaciones de Apareamiento Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay suficientes animales
            </h3>
            <p className="text-gray-500">
              Necesitas al menos un macho y una hembra registrados para generar recomendaciones.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Recomendaciones de Apareamiento Inteligentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {breedingRecommendations.slice(0, 5).map((recommendation, index) => (
            <div key={recommendation.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium">
                    {recommendation.maleName} × {recommendation.femaleName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <div 
                        className={`w-3 h-3 rounded-full ${getCompatibilityColor(recommendation.compatibilityScore)}`}
                      />
                      <span className="text-sm font-medium">
                        {recommendation.compatibilityScore}% compatibilidad
                      </span>
                    </div>
                    <Badge className={getRiskColor(recommendation.inbreedingRisk)}>
                      {recommendation.inbreedingRisk === 'low' ? 'Bajo riesgo' : 
                       recommendation.inbreedingRisk === 'moderate' ? 'Riesgo moderado' : 'Alto riesgo'}
                    </Badge>
                    {index === 0 && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Recomendado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-sm space-y-1">
                {recommendation.recommendations.map((rec, recIndex) => (
                  <div key={recIndex} className="text-gray-600">{rec}</div>
                ))}
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                Ganancia de diversidad genética: {recommendation.geneticDiversityGain}%
              </div>
            </div>
          ))}
          
          <Button 
            onClick={loadBreedingRecommendations}
            variant="outline"
            className="w-full mt-4"
          >
            Recalcular Recomendaciones
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreedingRecommendationsList;
