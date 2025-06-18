
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, Calendar, TrendingUp, Plus } from 'lucide-react';
import { breedingAnalyticsService, BreedingRecommendation } from '@/services/breedingAnalyticsService';
import { useToast } from '@/hooks/use-toast';

const BreedingRecommendationsCard: React.FC = () => {
  const [recommendations, setRecommendations] = useState<BreedingRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const data = await breedingAnalyticsService.getBreedingRecommendations();
      setRecommendations(data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las recomendaciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStarRating = (score: number) => {
    const stars = Math.round(score / 20); // Convert to 1-5 scale
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const handleCreateBreeding = (recommendation: BreedingRecommendation) => {
    toast({
      title: "Crear Apareamiento",
      description: `Redirigiéndote para crear apareamiento entre ${recommendation.motherName} y ${recommendation.fatherName}`,
    });
    // Here you would typically navigate to the breeding form with pre-filled data
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span>Recomendaciones de Apareamiento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500" />
            <CardTitle>Recomendaciones de Apareamiento</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={loadRecommendations}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hay recomendaciones disponibles</p>
              <p className="text-sm">Asegúrate de tener animales registrados con información completa</p>
            </div>
          ) : (
            recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getCompatibilityColor(rec.compatibilityScore)}>
                      {rec.compatibilityScore.toFixed(0)}% Compatible
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {getStarRating(rec.compatibilityScore)}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleCreateBreeding(rec)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Apareamiento
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center space-x-2">
                      <span>♀</span>
                      <span>{rec.motherName}</span>
                    </h3>
                    <p className="text-sm text-gray-600">Madre</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center space-x-2">
                      <span>♂</span>
                      <span>{rec.fatherName}</span>
                    </h3>
                    <p className="text-sm text-gray-600">Padre</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-2">Análisis:</p>
                  <p className="text-sm text-gray-700">{rec.reason}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-500">Diversidad Genética</p>
                      <p className="font-medium text-green-600">{rec.geneticDiversityScore.toFixed(0)}%</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Fecha estimada de parto</p>
                        <p className="font-medium text-blue-600">
                          {new Date(rec.estimatedDueDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {recommendations.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Consejos de Apareamiento</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Las recomendaciones se basan en compatibilidad genética y diversidad</li>
              <li>• Considera el historial de salud y rendimiento de ambos padres</li>
              <li>• Verifica que los animales estén en edad reproductiva adecuada</li>
              <li>• Programa los apareamientos según la estación y condiciones del rancho</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BreedingRecommendationsCard;
