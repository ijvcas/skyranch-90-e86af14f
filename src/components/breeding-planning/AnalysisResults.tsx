
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { UniversalPedigreeAnalysis } from '@/services/universal-breeding/types';

interface AnalysisResultsProps {
  analysis: UniversalPedigreeAnalysis;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis }) => {
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
  );
};

export default AnalysisResults;
