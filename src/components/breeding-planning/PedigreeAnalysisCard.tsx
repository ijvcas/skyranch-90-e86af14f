
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreePine, Heart, AlertTriangle, Star, Dna, Calculator } from 'lucide-react';
import { PedigreeAnalysisService, type InbreedingAnalysis, type GeneticDiversityScore, type BreedingRecommendation } from '@/services/pedigreeAnalysisService';
import { getAllAnimals } from '@/services/animal/animalQueries';
import type { Animal } from '@/stores/animalStore';

const PedigreeAnalysisCard = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<string>('');
  const [inbreedingAnalysis, setInbreedingAnalysis] = useState<InbreedingAnalysis | null>(null);
  const [diversityScore, setDiversityScore] = useState<GeneticDiversityScore | null>(null);
  const [breedingRecommendations, setBreedingRecommendations] = useState<BreedingRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  useEffect(() => {
    loadAnimals();
    loadBreedingRecommendations();
  }, []);

  const loadAnimals = async () => {
    try {
      const animalsData = await getAllAnimals();
      setAnimals(animalsData);
    } catch (error) {
      console.error('Error loading animals:', error);
    }
  };

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

  const getRiskColor = (riskLevel: 'low' | 'moderate' | 'high') => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Pedigree Analysis Section */}
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

          {/* Analysis Results */}
          {inbreedingAnalysis && diversityScore && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Inbreeding Analysis */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Análisis de Consanguinidad
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Coeficiente:</span>
                    <Badge className={getRiskColor(inbreedingAnalysis.riskLevel)}>
                      {(inbreedingAnalysis.coefficient * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    {inbreedingAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="text-gray-600">{rec}</div>
                    ))}
                  </div>
                  {inbreedingAnalysis.commonAncestors.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Ancestros comunes: {inbreedingAnalysis.commonAncestors.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Genetic Diversity */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Dna className="w-4 h-4" />
                  Diversidad Genética
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Puntuación:</span>
                    <span className={`font-bold ${getScoreColor(diversityScore.score)}`}>
                      {diversityScore.score}/100
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completitud:</span>
                    <span className={getScoreColor(diversityScore.completeness)}>
                      {diversityScore.completeness}%
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>Ancestros únicos: {diversityScore.diversityFactors.uniqueAncestors}</div>
                    <div>Profundidad: {diversityScore.diversityFactors.generationDepth} generaciones</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Breeding Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Recomendaciones de Apareamiento Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendationsLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Generando recomendaciones basadas en análisis genético...</div>
            </div>
          ) : breedingRecommendations.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay suficientes animales
              </h3>
              <p className="text-gray-500">
                Necesitas al menos un macho y una hembra registrados para generar recomendaciones.
              </p>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PedigreeAnalysisCard;
