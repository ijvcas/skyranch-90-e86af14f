
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dna } from 'lucide-react';
import UniversalPedigreeAnalysisCard from './UniversalPedigreeAnalysisCard';

const BreedingRecommendationsCard = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="w-5 h-5" />
            Sistema Universal de Análisis Genético
          </CardTitle>
          <CardDescription>
            Análisis científico de pedigrí para todas las especies - desde burros franceses Baudet de Poitou hasta ovejas suizas Nez Noir du Valais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">🐴 Burros Baudet de Poitou</h4>
              <p className="text-sm text-blue-700">
                Análisis especializado para tu raza francesa histórica con preservación del linaje francés y gestación de 12-14 meses.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">🐑 Ovejas Nez Noir du Valais</h4>
              <p className="text-sm text-green-700">
                Análisis adaptado para tu raza suiza/francesa alpina con características montañosas y gestación de 5 meses.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">🧬 Análisis Multi-Especies</h4>
              <p className="text-sm text-purple-700">
                Sistema universal que se adapta automáticamente a bovinos, caprinos, porcinos y otras especies de tu finca.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">📊 Datos Reales</h4>
              <p className="text-sm text-orange-700">
                Utiliza el pedigrí real de todos tus animales para proporcionar recomendaciones precisas y científicas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <UniversalPedigreeAnalysisCard />
    </div>
  );
};

export default BreedingRecommendationsCard;
