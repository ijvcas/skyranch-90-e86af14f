
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreePine, Calculator } from 'lucide-react';
import { PedigreeAnalysisService, type InbreedingAnalysis, type GeneticDiversityScore } from '@/services/pedigreeAnalysisService';
import type { Animal } from '@/stores/animalStore';
import PedigreeAnalysisResults from './PedigreeAnalysisResults';

interface IndividualPedigreeAnalysisProps {
  animals: Animal[];
}

const IndividualPedigreeAnalysis: React.FC<IndividualPedigreeAnalysisProps> = ({ animals }) => {
  const [selectedAnimal, setSelectedAnimal] = useState<string>('');
  const [inbreedingAnalysis, setInbreedingAnalysis] = useState<InbreedingAnalysis | null>(null);
  const [diversityScore, setDiversityScore] = useState<GeneticDiversityScore | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeAnimal = async () => {
    if (!selectedAnimal) return;
    
    setLoading(true);
    try {
      const pedigree = await PedigreeAnalysisService.getCompletePedigree(selectedAnimal);
      if (pedigree) {
        const inbreeding = PedigreeAnalysisService.calculateInbreedingCoefficient(pedigree);
        const diversity = PedigreeAnalysisService.calculateGeneticDiversity(pedigree);
        
        setInbreedingAnalysis(inbreeding);
        setDiversityScore(diversity);
      }
    } catch (error) {
      console.error('Error analyzing animal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TreePine className="w-5 h-5" />
          Análisis de Pedigrí Individual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecciona un animal para analizar" />
            </SelectTrigger>
            <SelectContent>
              {animals.map((animal) => (
                <SelectItem key={animal.id} value={animal.id}>
                  {animal.name} ({animal.tag})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={analyzeAnimal} 
            disabled={!selectedAnimal || loading}
            className="flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            {loading ? 'Analizando...' : 'Analizar'}
          </Button>
        </div>

        {inbreedingAnalysis && diversityScore && (
          <PedigreeAnalysisResults 
            inbreedingAnalysis={inbreedingAnalysis}
            diversityScore={diversityScore}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default IndividualPedigreeAnalysis;
