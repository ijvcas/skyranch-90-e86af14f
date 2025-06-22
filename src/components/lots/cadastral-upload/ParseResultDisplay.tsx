
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { ParsingResult } from '@/utils/cadastralParsers';

interface ParseResultDisplayProps {
  parseResult: ParsingResult;
}

const ParseResultDisplay: React.FC<ParseResultDisplayProps> = ({ parseResult }) => {
  return (
    <div className="space-y-3">
      {parseResult.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Errores encontrados</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside">
              {parseResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {parseResult.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Advertencias</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside">
              {parseResult.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {parseResult.parcels.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Archivo procesado correctamente</AlertTitle>
          <AlertDescription>
            <div className="space-y-1">
              <p><strong>Parcelas encontradas:</strong> {parseResult.parcels.length}</p>
              <p><strong>Sistema de coordenadas:</strong> {parseResult.coordinateSystem}</p>
              {parseResult.parcels[0]?.areaHectares && (
                <p><strong>Área total:</strong> {parseResult.parcels.reduce((sum, p) => sum + (p.areaHectares || 0), 0).toFixed(2)} ha</p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ParseResultDisplay;
