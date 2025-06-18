
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar, Heart, Stethoscope, CheckCircle } from 'lucide-react';
import { BreedingAnalyticsService, type BreedingRecommendation } from '@/services/breedingAnalyticsService';

const BreedingRecommendationsCard = () => {
  const [recommendations, setRecommendations] = React.useState<BreedingRecommendation[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const data = await BreedingAnalyticsService.getRecommendations();
        setRecommendations(data);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'breeding_window': return <Heart className="h-4 w-4" />;
      case 'health_check': return <Stethoscope className="h-4 w-4" />;
      case 'nutrition': return <AlertTriangle className="h-4 w-4" />;
      case 'rest_period': return <Calendar className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones Reproductivas</CardTitle>
          <CardDescription>
            Sugerencias personalizadas para optimizar tu programa reproductivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500">Cargando recomendaciones...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recomendaciones Reproductivas</CardTitle>
        <CardDescription>
          Sugerencias personalizadas para optimizar tu programa reproductivo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¡Todo en orden!
            </h3>
            <p className="text-gray-500">
              No hay recomendaciones pendientes en este momento.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(recommendation.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {recommendation.title}
                        </h4>
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {getPriorityLabel(recommendation.priority)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {recommendation.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>Animal: {recommendation.animalName}</span>
                        {recommendation.dueDate && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Fecha: {recommendation.dueDate}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Marcar como hecho
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BreedingRecommendationsCard;
