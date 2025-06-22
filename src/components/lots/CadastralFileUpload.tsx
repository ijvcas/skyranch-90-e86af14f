
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, File, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { parseGMLFileRebuilt } from '@/utils/cadastral/gml/rebuiltGMLParser';
import { validateAndPreviewCoordinates } from '@/utils/cadastral/coordinateValidator';
import { bulkInsertCadastralParcels } from '@/services/cadastral/parcelDatabaseOps';
import CoordinatePreviewDialog from './CoordinatePreviewDialog';
import type { ParsedParcel, ParsingResult } from '@/utils/cadastral/types';
import type { CoordinateValidationResult } from '@/utils/cadastral/coordinateValidator';

interface CadastralFileUploadProps {
  propertyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CadastralFileUpload: React.FC<CadastralFileUploadProps> = ({
  propertyId,
  onSuccess,
  onCancel
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParsingResult | null>(null);
  const [validationResult, setValidationResult] = useState<CoordinateValidationResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    console.log('📁 Processing file:', file.name);
    setSelectedFile(file);
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Parse file with rebuilt parser
      setUploadProgress(25);
      const result = await parseGMLFileRebuilt(file);
      setParseResult(result);
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => toast.error(error));
        setIsProcessing(false);
        return;
      }

      if (result.parcels.length === 0) {
        toast.error('No se encontraron parcelas válidas en el archivo');
        setIsProcessing(false);
        return;
      }

      setUploadProgress(50);

      // Validate all coordinates
      const allCoordinates = result.parcels.flatMap(parcel => parcel.boundaryCoordinates);
      const validation = validateAndPreviewCoordinates(allCoordinates);
      setValidationResult(validation);

      setUploadProgress(75);

      // Show preview dialog
      setShowPreview(true);
      setUploadProgress(100);

    } catch (error) {
      console.error('❌ File processing error:', error);
      toast.error('Error procesando el archivo');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleConfirmImport = async () => {
    if (!parseResult || !propertyId) return;

    setIsProcessing(true);
    setShowPreview(false);

    try {
      console.log('💾 Saving parcels to database...');
      
      const success = await bulkInsertCadastralParcels(
        parseResult.parcels,
        propertyId,
        selectedFile?.name || 'imported_file'
      );

      if (success) {
        toast.success(`✅ ${parseResult.parcels.length} parcelas importadas correctamente en SkyRanch`);
        onSuccess();
      } else {
        toast.error('Error guardando las parcelas en la base de datos');
      }
    } catch (error) {
      console.error('❌ Database save error:', error);
      toast.error('Error inesperado guardando las parcelas');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setParseResult(null);
    setValidationResult(null);
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/xml': ['.xml', '.gml'],
      'application/vnd.google-earth.kml+xml': ['.kml']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra archivos GML/KML aquí'}
              </p>
              <p className="text-sm text-gray-500">
                O haz clic para seleccionar archivos (.xml, .gml, .kml)
              </p>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Procesando archivo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {parseResult && !isProcessing && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Archivo procesado: {parseResult.parcels.length} parcelas encontradas.
                  Sistema de coordenadas: {parseResult.coordinateSystem}
                </AlertDescription>
              </Alert>
            )}

            {parseResult && parseResult.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {parseResult.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onCancel}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CoordinatePreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        validationResult={validationResult}
        onConfirm={handleConfirmImport}
        onCancel={handleCancelPreview}
      />
    </>
  );
};

export default CadastralFileUpload;
