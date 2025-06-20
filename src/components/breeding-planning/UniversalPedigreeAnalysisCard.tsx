
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Heart, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UniversalBreedingAnalysisService } from '@/services/universal-breeding';
import type { UniversalPedigreeAnalysis } from '@/services/universal-breeding/types';
import { useToast } from '@/hooks/use-toast';
import { getStatusColor, getStatusText } from '@/utils/animalStatus';
import AnimalSelectionWithStatus from './AnimalSelectionWithStatus';

const UniversalPedigreeAnalysisCard: React.FC = () => {
  const [selectedSpecies, setSelectedSpecies] = useState<string>('ALL_SPECIES');
  const [selectedMaleId, setSelectedMaleId] = useState<string>('');
  const [selectedFemaleId, setSelectedFemaleId] = useState<string>('');
  const [analysis, setAnalysis] = useState<UniversalPedigreeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const { data: breedingPairs } = useQuery({
    queryKey: ['breeding-pairs', selectedSpecies === 'ALL_SPECIES' ? undefined : selectedSpecies],
    queryFn: () => UniversalBreedingAnalysisService.getBreedingPairsBySpecies(selectedSpecies === 'ALL_SPECIES' ? undefined : selectedSpecies),
    enabled: true
  });

  const availableSpecies = breedingPairs ? 
    [...new Set([
      ...breedingPairs.males.map(m => m.species),
      ...breedingPairs.females.map(f => f.species)
    ])] : [];

  const filteredMales = breedingPairs?.males.filter(m => 
    selectedSpecies === 'ALL_SPECIES' || m.species === selectedSpecies
  ) || [];

  const filteredFemales = breedingPairs?.females.filter(f => 
    selectedSpecies === 'ALL_SPECIES' || f.species === selectedSpecies
  ) || [];

  const handleAnalyze = async () => {
    if (!selectedMaleId || !selectedFemaleId) {
      toast({
        title: "Selección incompleta",
        description: "Por favor selecciona tanto el macho como la hembra para el análisis.",
        variant: "destructive"
      });
      return;
    }

    const male = filteredMales.find(m => m.id === selectedMaleId);
    const female = filteredFemales.find(f => f.id === selectedFemaleId);

    if (!male || !female) {
      toast({
        title: "Error",
        description: "No se pudieron encontrar los animales seleccionados.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await UniversalBreedingAnalysisService.analyzeUniversalPair(male, female);
      setAnalysis(result);
      
      toast({
        title: "Análisis completado",
        description: `Compatibilidad: ${result.compatibilityScore}%`,
      });
    } catch (error) {
      console.error('Error analyzing pair:', error);
      toast({
        title: "Error en el análisis",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'moderate': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-red-500" />
          <span>Análisis Universal de Pedigrí</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Species Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Especie (opcional)</label>
          <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las especies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_SPECIES">Todas las especies</SelectItem>
              {availableSpecies.map((species) => (
                <SelectItem key={species} value={species}>
                  {species}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Male Selection */}
          <AnimalSelectionWithStatus
            animals={filteredMales}
            selectedAnimalId={selectedMaleId}
            onAnimalSelect={setSelectedMaleId}
            placeholder="Seleccionar macho"
            label="Macho"
          />

          {/* Female Selection */}
          <AnimalSelectionWithStatus
            animals={filteredFemales}
            selectedAnimalId={selectedFemaleId}
            onAnimalSelect={setSelectedFemaleId}
            placeholder="Seleccionar hembra"
            label="Hembra"
          />
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={!selectedMaleId || !selectedFemaleId || isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analizando...
            </>
          ) : (
            'Analizar Compatibilidad'
          )}
        </Button>

        {analysis && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Resultado del Análisis</h3>
              <div className="flex items-center space-x-2">
                <Badge className={getRiskColor(analysis.riskLevel)}>
                  {getRiskIcon(analysis.riskLevel)}
                  <span className="ml-1">
                    {analysis.riskLevel === 'low' ? 'Bajo Riesgo' : 
                     analysis.riskLevel === 'moderate' ? 'Riesgo Moderado' : 'Alto Riesgo'}
                  </span>
                </Badge>
                <Badge variant="outline">
                  Compatibilidad: {analysis.compatibilityScore}%
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Diversidad Genética:</span>
                <div>{analysis.geneticDiversityScore.toFixed(1)}%</div>
              </div>
              <div>
                <span className="font-medium">Coef. Consanguinidad:</span>
                <div>{(analysis.inbreedingCoefficient * 100).toFixed(2)}%</div>
              </div>
              <div>
                <span className="font-medium">Gestación:</span>
                <div>{analysis.expectedGestationDays} días</div>
              </div>
              <div>
                <span className="font-medium">Época Óptima:</span>
                <div>{analysis.optimalBreedingWindow}</div>
              </div>
            </div>

            {analysis.relationshipWarning && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Advertencia de Parentesco</span>
                </div>
                <p className="text-red-700 mt-1">{analysis.relationshipWarning}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Recomendaciones:</h4>
              <ul className="space-y-1 text-sm">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-gray-400">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {analysis.speciesSpecificAdvice.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Consejos Específicos de la Especie:</h4>
                <ul className="space-y-1 text-sm">
                  {analysis.speciesSpecificAdvice.map((advice, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-400">•</span>
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UniversalPedigreeAnalysisCard;
