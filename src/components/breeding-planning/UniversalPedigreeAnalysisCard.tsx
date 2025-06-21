
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { UniversalBreedingAnalysisService } from '@/services/universal-breeding';
import type { UniversalPedigreeAnalysis } from '@/services/universal-breeding/types';
import { useToast } from '@/hooks/use-toast';
import SpeciesSelector from './SpeciesSelector';
import BreedingAnalysisForm from './BreedingAnalysisForm';
import AnalysisResults from './AnalysisResults';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-red-500" />
          <span>Análisis Universal de Pedigrí</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SpeciesSelector
          selectedSpecies={selectedSpecies}
          onSpeciesChange={setSelectedSpecies}
          availableSpecies={availableSpecies}
        />

        <BreedingAnalysisForm
          filteredMales={filteredMales}
          filteredFemales={filteredFemales}
          selectedMaleId={selectedMaleId}
          selectedFemaleId={selectedFemaleId}
          onMaleSelect={setSelectedMaleId}
          onFemaleSelect={setSelectedFemaleId}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />

        {analysis && (
          <AnalysisResults analysis={analysis} />
        )}
      </CardContent>
    </Card>
  );
};

export default UniversalPedigreeAnalysisCard;
