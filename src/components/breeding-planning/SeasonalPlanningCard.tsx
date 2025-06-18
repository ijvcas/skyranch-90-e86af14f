
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Thermometer, Droplets, Sun, Snowflake, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SeasonalRecommendation {
  season: string;
  icon: React.ReactNode;
  color: string;
  title: string;
  advantages: string[];
  considerations: string[];
  idealSpecies: string[];
}

const SeasonalPlanningCard: React.FC = () => {
  const [selectedSeason, setSelectedSeason] = useState('primavera');

  const seasonalData: Record<string, SeasonalRecommendation> = {
    primavera: {
      season: 'primavera',
      icon: <Leaf className="w-6 h-6" />,
      color: 'bg-green-100 border-green-300 text-green-800',
      title: 'Primavera (Marzo - Mayo)',
      advantages: [
        'Temperaturas moderadas favorables',
        'Abundante pasto y forraje disponible',
        'Menor estrés térmico en los animales',
        'Condiciones ideales para la gestación'
      ],
      considerations: [
        'Mayor demanda de suplementos nutricionales',
        'Vigilar cambios bruscos de temperatura',
        'Preparar instalaciones para temporada de lluvias'
      ],
      idealSpecies: ['bovino', 'equino', 'caprino']
    },
    verano: {
      season: 'verano',
      icon: <Sun className="w-6 h-6" />,
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      title: 'Verano (Junio - Agosto)',
      advantages: [
        'Partos en épocas más frescas',
        'Mayor disponibilidad de agua',
        'Facilita manejo y supervisión'
      ],
      considerations: [
        'Alto estrés térmico puede afectar fertilidad',
        'Necesidad de sombra y ventilación adecuada',
        'Mayor consumo de agua',
        'Posible reducción en calidad de semen'
      ],
      idealSpecies: ['caprino', 'ovino']
    },
    otono: {
      season: 'otono',
      icon: <Thermometer className="w-6 h-6" />,
      color: 'bg-orange-100 border-orange-300 text-orange-800',
      title: 'Otoño (Septiembre - Noviembre)',
      advantages: [
        'Temperaturas moderadas',
        'Menor estrés en los animales',
        'Buena disponibilidad de forraje',
        'Condiciones estables para apareamiento'
      ],
      considerations: [
        'Preparar para temporada invernal',
        'Asegurar nutrición adecuada',
        'Planificar partos para primavera'
      ],
      idealSpecies: ['bovino', 'equino', 'porcino']
    },
    invierno: {
      season: 'invierno',
      icon: <Snowflake className="w-6 h-6" />,
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      title: 'Invierno (Diciembre - Febrero)',
      advantages: [
        'Partos en primavera-verano',
        'Menor actividad de parásitos',
        'Concentración de recursos en apareamiento'
      ],
      considerations: [
        'Temperaturas bajas pueden afectar fertilidad',
        'Mayor necesidad de refugio',
        'Suplementación nutricional crítica',
        'Vigilar condición corporal'
      ],
      idealSpecies: ['bovino', 'equino']
    }
  };

  const currentRecommendation = seasonalData[selectedSeason];

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'primavera';
    if (month >= 5 && month <= 7) return 'verano';
    if (month >= 8 && month <= 10) return 'otono';
    return 'invierno';
  };

  const currentSeason = getCurrentSeason();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <CardTitle>Planificación Estacional</CardTitle>
          </div>
          <Badge variant="outline" className="capitalize">
            Actual: {currentSeason}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Seleccionar Estación</label>
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primavera">🌸 Primavera</SelectItem>
                <SelectItem value="verano">☀️ Verano</SelectItem>
                <SelectItem value="otono">🍂 Otoño</SelectItem>
                <SelectItem value="invierno">❄️ Invierno</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={`border-2 border-dashed rounded-lg p-6 ${currentRecommendation.color}`}>
            <div className="flex items-center space-x-3 mb-4">
              {currentRecommendation.icon}
              <h3 className="text-xl font-bold">{currentRecommendation.title}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Ventajas</span>
                </h4>
                <ul className="space-y-2">
                  {currentRecommendation.advantages.map((advantage, index) => (
                    <li key={index} className="text-sm flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <span className="text-orange-600">⚠</span>
                  <span>Consideraciones</span>
                </h4>
                <ul className="space-y-2">
                  {currentRecommendation.considerations.map((consideration, index) => (
                    <li key={index} className="text-sm flex items-start space-x-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{consideration}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-3">Especies Ideales para esta Estación</h4>
              <div className="flex flex-wrap gap-2">
                {currentRecommendation.idealSpecies.map((species) => (
                  <Badge key={species} variant="secondary" className="capitalize">
                    {species}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span>Recomendaciones Nutricionales</span>
            </h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• Asegurar acceso constante a agua fresca y limpia</p>
              <p>• Suplementar con minerales específicos según la estación</p>
              <p>• Ajustar la dieta según disponibilidad de forraje</p>
              <p>• Monitorear condición corporal regularmente</p>
            </div>
          </div>

          {selectedSeason === currentSeason && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-blue-800 font-medium">
                🎯 Esta es la estación actual. Considera implementar estas recomendaciones en tus próximos apareamientos.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SeasonalPlanningCard;
