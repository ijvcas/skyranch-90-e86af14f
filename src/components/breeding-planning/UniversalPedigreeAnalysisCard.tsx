import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreePine, Heart, AlertTriangle, Star, Dna, Calculator, Info } from 'lucide-react';
import { UniversalBreedingAnalysisService, type UniversalPedigreeAnalysis, type UniversalBreedingRecommendation } from '@/services/universal-breeding/universalBreedingAnalysisService';
import { SpeciesConfigService } from '@/services/species/speciesConfig';
import type { Animal } from '@/stores/animalStore';

const UniversalPedigreeAnalysisCard = () => {
  const [animalsBySpecies, setAnimalsBySpecies] = useState<Record<string, { males: Animal[], females: Animal[] }>>({});
  const [selectedSpecies, setSelectedSpecies] = useState<string>('');
  const [selectedMale, setSelectedMale] = useState<string>('');
  const [selectedFemale, setSelectedFemale] = useState<string>('');
  const [pedigreeAnalysis, setPedigreeAnalysis] = useState<UniversalPedigreeAnalysis | null>(null);
  const [breedingRecommendations, setBreedingRecommendations] = useState<UniversalBreedingRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  useEffect(() => {
    loadAllSpeciesData();
    loadBreedingRecommendations();
  }, []);

  const loadAllSpeciesData = async () => {
    try {
      const allSpecies = SpeciesConfigService.getAllSpecies();
      const speciesData: Record<string, { males: Animal[], females: Animal[] }> = {};

      for (const speciesConfig of allSpecies) {
        const pairs = await UniversalBreedingAnalysisService.getBreedingPairsBySpecies(speciesConfig.id);
        if (pairs.males.length > 0 || pairs.females.length > 0) {
          speciesData[speciesConfig.id] = pairs;
        }
      }

      setAnimalsBySpecies(speciesData);

      // Auto-select species with animals
      const firstSpeciesWithAnimals = Object.keys(speciesData)[0];
      if (firstSpeciesWithAnimals) {
        setSelectedSpecies(firstSpeciesWithAnimals);
        
        // Auto-select special breeds if available
        const speciesAnimals = speciesData[firstSpeciesWithAnimals];
        const specialMale = speciesAnimals.males.find(m => 
          m.name.toLowerCase().includes('lascaux') || m.breed?.toLowerCase().includes('baudet')
        );
        const specialFemale = speciesAnimals.females.find(f => 
          f.name.toLowerCase().includes('luna') || f.breed?.toLowerCase().includes('baudet') ||
          f.breed?.toLowerCase().includes('nez noir')
        );
        
        if (specialMale) setSelectedMale(specialMale.id);
        if (specialFemale) setSelectedFemale(specialFemale.id);
      }
    } catch (error) {
      console.error('Error loading species data:', error);
    }
  };

  const loadBreedingRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
      const recommendations = await UniversalBreedingAnalysisService.generateUniversalBreedingRecommendations();
      setBreedingRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading breeding recommendations:', error);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const analyzePair = async () => {
    if (!selectedMale || !selectedFemale || !selectedSpecies) return;
    
    setLoading(true);
    try {
      const animals = animalsBySpecies[selectedSpecies];
      const male = animals.males.find(m => m.id === selectedMale);
      const female = animals.females.find(f => f.id === selectedFemale);
      
      if (male && female) {
        const analysis = await UniversalBreedingAnalysisService.analyzeUniversalPair(male, female);
        setPedigreeAnalysis(analysis);
      }
    } catch (error) {
      console.error('Error analyzing pair:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeciesChange = (species: string) => {
    setSelectedSpecies(species);
    setSelectedMale('');
    setSelectedFemale('');
    setPedigreeAnalysis(null);
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

  const getSpeciesIcon = (species: string) => {
    const icons: Record<string, string> = {
      equino: '🐴',
      bovino: '🐄',
      ovino: '🐑',
      caprino: '🐐',
      porcino: '🐷'
    };
    return icons[species] || '🐾';
  };

  const currentAnimals = selectedSpecies ? animalsBySpecies[selectedSpecies] : null;
  const speciesConfig = selectedSpecies ? SpeciesConfigService.getSpeciesConfig(selectedSpecies) : null;

  return (
    <div className="space-y-6">
      {/* Universal Species Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="w-5 h-5" />
            Sistema Universal de Análisis Genético
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Species Selection */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedSpecies} onValueChange={handleSpeciesChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona especie" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(animalsBySpecies).map((species) => {
                  const config = SpeciesConfigService.getSpeciesConfig(species);
                  return (
                    <SelectItem key={species} value={species}>
                      {getSpeciesIcon(species)} {config?.name || species}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {currentAnimals && (
              <>
                <Select value={selectedMale} onValueChange={setSelectedMale}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona macho" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentAnimals.males.map((male) => (
                      <SelectItem key={male.id} value={male.id}>
                        {male.name} ({male.tag})
                        {male.breed && <span className="text-xs text-gray-500"> - {male.breed}</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedFemale} onValueChange={setSelectedFemale}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona hembra" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentAnimals.females.map((female) => (
                      <SelectItem key={female.id} value={female.id}>
                        {female.name} ({female.tag})
                        {female.breed && <span className="text-xs text-gray-500"> - {female.breed}</span>}
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
                  {loading ? 'Analizando...' : 'Analizar'}
                </Button>
              </>
            )}
          </div>

          {/* Species Information */}
          {speciesConfig && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                {getSpeciesIcon(selectedSpecies)} Información de {speciesConfig.name}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Gestación:</span> {speciesConfig.gestationDays} días
                </div>
                <div>
                  <span className="font-medium">Época óptima:</span> {speciesConfig.optimalBreedingMonths.join(', ')}
                </div>
                <div>
                  <span className="font-medium">Animales:</span> {currentAnimals?.males.length || 0}♂ / {currentAnimals?.females.length || 0}♀
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {pedigreeAnalysis && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">
                    {getSpeciesIcon(pedigreeAnalysis.species)} {pedigreeAnalysis.maleName} × {pedigreeAnalysis.femaleName}
                  </h3>
                  {pedigreeAnalysis.breedInfo?.isSpecialBreed && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-purple-100 text-purple-800">
                        <Star className="w-3 h-3 mr-1" />
                        Raza Especial
                      </Badge>
                      {pedigreeAnalysis.breedInfo.specialBreedInfo?.website && (
                        <a 
                          href={pedigreeAnalysis.breedInfo.specialBreedInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Info className="w-3 h-3" />
                          Más info
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${getCompatibilityColor(pedigreeAnalysis.compatibilityScore)}`}
                  />
                  <span className="font-semibold">
                    {pedigreeAnalysis.compatibilityScore}% compatibilidad
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  </div>
                </div>

                {/* Species Info */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">
                    {getSpeciesIcon(pedigreeAnalysis.species)} {speciesConfig?.name}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div>Gestación: {pedigreeAnalysis.expectedGestationDays} días</div>
                    <div>Época: {pedigreeAnalysis.optimalBreedingWindow}</div>
                  </div>
                </div>

                {/* Common Ancestors */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Ancestros Comunes</h4>
                  <div className="space-y-1 text-sm">
                    {pedigreeAnalysis.commonAncestors.length > 0 ? (
                      <div className="text-orange-600">
                        {pedigreeAnalysis.commonAncestors.length} detectados
                      </div>
                    ) : (
                      <div className="text-green-600">
                        Ninguno detectado
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Recomendaciones Genéticas</h4>
                  <div className="space-y-1 text-sm">
                    {pedigreeAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="text-gray-700">{rec}</div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">Consejos Específicos</h4>
                  <div className="space-y-1 text-sm">
                    {pedigreeAnalysis.speciesSpecificAdvice.map((advice, index) => (
                      <div key={index} className="text-gray-700">{advice}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Universal Breeding Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Recomendaciones Universales de Apareamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendationsLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Generando recomendaciones para todas las especies...</div>
            </div>
          ) : breedingRecommendations.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay animales reproductores disponibles
              </h3>
              <p className="text-gray-500">
                Registra animales de cualquier especie para generar recomendaciones de apareamiento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {breedingRecommendations.slice(0, 6).map((recommendation, index) => (
                <div key={recommendation.pairId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium flex items-center gap-2">
                        {getSpeciesIcon(recommendation.species)} {recommendation.maleName} × {recommendation.femaleName}
                        {recommendation.breed && (
                          <Badge variant="outline" className="text-xs">
                            {recommendation.breed}
                          </Badge>
                        )}
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
                            Mejor Pareja
                          </Badge>
                        )}
                        {recommendation.isSpecialBreed && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <Star className="w-3 h-3 mr-1" />
                            Raza Especial
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Ventana de Apareamiento:</h5>
                      <p className="text-gray-600">{recommendation.breedingWindow}</p>
                      <p className="text-xs text-gray-500 mt-1">Gestación: {recommendation.gestationDays} días</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Beneficios:</h5>
                      <div className="text-gray-600 space-y-1">
                        {recommendation.geneticBenefits.slice(0, 2).map((benefit, idx) => (
                          <div key={idx}>{benefit}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-1">Consideraciones:</h5>
                      <div className="text-gray-600 space-y-1">
                        {recommendation.considerations.slice(0, 2).map((consideration, idx) => (
                          <div key={idx}>{consideration}</div>
                        ))}
                      </div>
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

export default UniversalPedigreeAnalysisCard;
