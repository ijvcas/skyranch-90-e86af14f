
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import type { CoordinateValidationResult } from '@/utils/cadastral/coordinateValidator';

interface CoordinatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validationResult: CoordinateValidationResult | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const CoordinatePreviewDialog: React.FC<CoordinatePreviewDialogProps> = ({
  open,
  onOpenChange,
  validationResult,
  onConfirm,
  onCancel
}) => {
  if (!validationResult) return null;

  const { isValid, errors, warnings, previewData } = validationResult;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Vista Previa de Coordenadas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Coordenadas</p>
              <p className="text-gray-600">{previewData.coordinateCount}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Distancia de SkyRanch</p>
              <p className="text-gray-600">{Math.round(previewData.distanceFromSkyRanch)}m</p>
            </div>
          </div>

          <div>
            <p className="font-medium text-gray-700 mb-1">Centroide Final</p>
            <p className="text-sm text-gray-600 font-mono">
              {previewData.finalCentroid.lat.toFixed(6)}, {previewData.finalCentroid.lng.toFixed(6)}
            </p>
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {isValid && errors.length === 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Las coordenadas son válidas y se posicionarán correctamente en SkyRanch.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={!isValid && errors.length > 0}
          >
            Confirmar Importación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CoordinatePreviewDialog;
