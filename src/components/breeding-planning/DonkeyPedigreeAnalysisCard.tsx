
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreePine, Heart, AlertTriangle, Star, Dna, Calculator } from 'lucide-react';
import { DonkeyBreedingAnalysisService, type DonkeyPedigreeAnalysis, type DonkeyBreedingRecommendation } from '@/services/donkeyBreedingAnalysisService';
import type { Animal } from '@/stores/animalStore';

const DonkeyPedigreeAnalysisCard = () => {
  const [donkeyPairs, setDonkeyPairs] = useState<{ males: Animal[], females: Animal[] }>({ males: [], females: [] });
  const [selectedMale, setSelectedMale] = useState<string>('');
  const [selectedFemale, setSelectedFemale] = useState<string>('');
  const [pedigreeAnalysis, setPedigreeAnalysis] = useState<DonkeyPedigreeAnalysis | null>(null);
  const [breedingRecommendations, setBreedingRecommendations] = useState<DonkeyBreedingRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  useEffect(() => {
    loadDonkeyPairs();
    loadBreedingRecommendations();
  }, []);

  const loadDonkeyPairs = async () => {
    try {
      const pairs = await DonkeyBreedingAnalysisService.getDonkeyPairs();
      setDonkeyPairs(pairs);
      
      // Auto-select LUNA and LASCAUX if available
      const luna = pairs.females.find(f => f.name.toUpperCase().includes('LUNA'));
      const lascaux = pairs.males.find(m => m.name.toUpperCase().includes('LASCAUX'));
      
      if (luna) setSelectedFemale(luna.id);
      if (lascaux) setSelectedMale(lascaux.id);
    } catch (error) {
      console.error('Error loading donkey pairs:', error);
    }
  };

  const loadBreedingRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
      const recommendations = await DonkeyBreedingAnalysisService.generateDonkeyBreedingRecommendations();
      setBreedingRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading breeding recommendations:', error);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const analyzePair = async () => {
    if (!selectedMale || !selectedFemale) return;
    
    setLoading(true);
    try {
      const male = donkeyPairs.males.find(m => m.id === selectedMale);
      const female = donkeyPairs.females.find(f => f.id === selectedFemale);
      
      if (male && female) {
        const analysis = await DonkeyBreedingAnalysisService.analyzeDonkeyPair(male, female);
        setPedigreeAnalysis(analysis);
      }
    } catch (error) {
      console.error('Error analyzing donkey pair:', error);
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
      {/* Donkey Pair Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="w-5 h-5" />
            Análisis de Pedigrí de Burros Franceses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedMale} onValueChange={setSelectedMale}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el macho" />
              </SelectTrigger>
              <SelectContent>
                {donkeyPairs.males.map((male) => (
                  <SelectItem key={male.id} value={male.id}>
                    {male.name} ({male.tag})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedFemale} onValueChange={setSelectedFemale}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la hembra" />
              </SelectTrigger>
              <SelectContent>
                {donkeyPairs.females.map((female) => (
                  <SelectItem key={female.id} value={female.id}>
                    {female.name} ({female.tag})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={analyzePair} 
              disabled={!selectedMale || !selectedFemale || loading}
              className="flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              {loading ? 'Analizando...' : 'Analizar Pareja'}
            </Button>
          </div>

          {/* Analysis Results */}
          {pedigreeAnalysis && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">
                  {pedigreeAnalysis.maleName} × {pedigreeAnalysis.femaleName}
                </h3>
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${getCompatibilityColor(pedigreeAnalysis.compatibilityScore)}`}
                  />
                  <span className="font-semibold">
                    {pedigreeAnalysis.compatibilityScore}% compatibilidad
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Inbreeding Analysis */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Consanguinidad
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Coeficiente:</span>
                      <Badge className={getRiskColor(pedigreeAnalysis.riskLevel)}>
                        {(pedigreeAnalysis.inbreedingCoefficient * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Riesgo: {pedigreeAnalysis.riskLevel === 'low' ? 'Bajo' : 
                              pedigreeAnalysis.riskLevel === 'moderate' ? 'Moderado' : 'Alto'}
                    </div>
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
                      <span className={`font-bold ${getScoreColor(pedigreeAnalysis.geneticDiversityScore)}`}>
                        {pedigreeAnalysis.geneticDiversityScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Linaje: {pedigreeAnalysis.frenchLineageAnalysis.lineageDiversity.toFixed(1)}% único
                    </div>
                  </div>
                </div>

                {/* French Lineage */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">🇫🇷 Linaje Francés</h4>
                  <div className="space-y-1 text-sm">
                    <div>Macho: {pedigreeAnalysis.frenchLineageAnalysis.maleLineage.length} ancestros</div>
                    <div>Hembra: {pedigreeAnalysis.frenchLineageAnalysis.femaleLineage.length} ancestros</div>
                    {pedigreeAnalysis.commonAncestors.length > 0 && (
                      <div className="text-orange-600">
                        {pedigreeAnalysis.commonAncestors.length} ancestros comunes
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Recomendaciones Específicas para Burros</h4>
                <div className="space-y-1">
                  {pedigreeAnalysis.recommendations.map((rec, index) => (
                    <div key={index} className="text-sm text-gray-700">{rec}</div>
                  ))}
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
            Recomendaciones de Apareamiento para Burros Franceses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendationsLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Generando recomendaciones específicas para burros...</div>
            </div>
          ) : breedingRecommendations.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay parejas de burros disponibles
              </h3>
              <p className="text-gray-500">
                Registra al menos un macho y una hembra de especie equina para generar recomendaciones.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {breedingRecommendations.slice(0, 3).map((recommendation, index) => (
                <div key={recommendation.pairId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">
                        🐴 {recommendation.maleName} × {recommendation.femaleName}
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
                        {index === 0 && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Pareja Recomendada
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Ventana de Apareamiento:</h5>
                      <p className="text-sm text-gray-600">{recommendation.breedingWindow}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Beneficios Genéticos:</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        {recommendation.geneticBenefits.slice(0, 2).map((benefit, idx) => (
                          <div key={idx}>{benefit}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Consideraciones:</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      {recommendation.considerations.slice(0, 2).map((consideration, idx) => (
                        <div key={idx}>{consideration}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                onClick={loadBreedingRecommendations}
                variant="outline"
                className="w-full mt-4"
              >
                Actualizar Recomendaciones
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DonkeyPedigreeAnalysisCard;
