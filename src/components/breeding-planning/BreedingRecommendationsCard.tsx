
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dna } from 'lucide-react';
import DonkeyPedigreeAnalysisCard from './DonkeyPedigreeAnalysisCard';

const BreedingRecommendationsCard = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="w-5 h-5" />
            Sistema de Análisis Genético de Burros Franceses
          </CardTitle>
          <CardDescription>
            Análisis científico de pedigrí basado en tus burros reales (LUNA & LASCAUX DU VERN)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Análisis de Consanguinidad</h4>
              <p className="text-sm text-blue-700">
                Calcula el coeficiente de Wright específico para burros franceses, evaluando el riesgo genético entre LUNA y LASCAUX.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Diversidad del Linaje Francés</h4>
              <p className="text-sm text-green-700">
                Evalúa la riqueza del linaje francés DU VERN y recomienda apareamientos que preserven la calidad genética.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Recomendaciones Inteligentes</h4>
              <p className="text-sm text-purple-700">
                Sugiere el apareamiento óptimo entre tus burros basado en compatibilidad genética y estacionalidad.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Datos Reales de Burros</h4>
              <p className="text-sm text-orange-700">
                Utiliza el linaje francés real de LUNA y LASCAUX DU VERN para proporcionar insights precisos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <DonkeyPedigreeAnalysisCard />
    </div>
  );
};

export default BreedingRecommendationsCard;
