
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Dna } from 'lucide-react';
import type { InbreedingAnalysis, GeneticDiversityScore } from '@/services/pedigreeAnalysisService';

interface PedigreeAnalysisResultsProps {
  inbreedingAnalysis: InbreedingAnalysis;
  diversityScore: GeneticDiversityScore;
}

const PedigreeAnalysisResults: React.FC<PedigreeAnalysisResultsProps> = ({
  inbreedingAnalysis,
  diversityScore
}) => {
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

  return (
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
  );
};

export default PedigreeAnalysisResults;
