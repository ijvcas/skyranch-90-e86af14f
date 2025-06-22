
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, X } from 'lucide-react';
import { saveCadastralParcel } from '@/services/cadastralService';
import { toast } from 'sonner';
import type { ParsingResult } from '@/utils/cadastralParsers';
import FilePreviewSection from './cadastral-upload/FilePreviewSection';
import ParseResultDisplay from './cadastral-upload/ParseResultDisplay';
import AdvancedOptionsSection from './cadastral-upload/AdvancedOptionsSection';
import { parseFileByType } from './cadastral-upload/FileParser';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parseResult, setParseResult] = useState<ParsingResult | null>(null);
  const [manualCoordinateSystem, setManualCoordinateSystem] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setParseResult(null);
      setManualCoordinateSystem('');
      
      // Auto-preview for small files
      if (file.size < 5 * 1024 * 1024) { // 5MB
        handleFilePreview(file);
      }
    }
  };

  const handleFilePreview = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await parseFileByType(file);
      setParseResult(result);

      if (result.errors.length > 0) {
        toast.error(`Errores en el archivo: ${result.errors.join(', ')}`);
      } else if (result.parcels.length > 0) {
        toast.success(`Vista previa: ${result.parcels.length} parcelas encontradas`);
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      setParseResult({
        parcels: [],
        coordinateSystem: 'EPSG:4326',
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        warnings: []
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !propertyId || !parseResult) return;

    setIsUploading(true);

    try {
      if (parseResult.errors.length > 0) {
        throw new Error('No se puede importar un archivo con errores');
      }

      if (parseResult.parcels.length === 0) {
        throw new Error('No se encontraron parcelas válidas en el archivo');
      }

      // Use manual coordinate system if specified
      let parcelsToSave = parseResult.parcels;
      if (manualCoordinateSystem && manualCoordinateSystem !== parseResult.coordinateSystem) {
        toast.info('Sistema de coordenadas manual aplicado');
      }

      // Save parcels to database
      let successCount = 0;
      for (const parcel of parcelsToSave) {
        const success = await saveCadastralParcel({
          propertyId,
          parcelId: parcel.parcelId,
          boundaryCoordinates: parcel.boundaryCoordinates,
          areaHectares: parcel.areaHectares,
          classification: parcel.classification,
          ownerInfo: parcel.ownerInfo,
          notes: parcel.notes,
          importedFromFile: selectedFile.name
        });

        if (success) successCount++;
      }

      toast.success(`${successCount} parcelas importadas correctamente`);
      onSuccess();

    } catch (error) {
      console.error('Error uploading cadastral file:', error);
      toast.error(error instanceof Error ? error.message : 'Error procesando el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Importar Datos Catastrales</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Archivo Catastral
          </label>
          <Input
            type="file"
            accept=".xml,.gml,.dxf,.kml"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Formatos soportados: XML (Catastro español), GML, DXF, KML
          </p>
        </div>

        {selectedFile && <FilePreviewSection selectedFile={selectedFile} />}

        {parseResult && <ParseResultDisplay parseResult={parseResult} />}

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            Opciones avanzadas
          </Button>
        </div>

        {showAdvancedOptions && (
          <AdvancedOptionsSection
            manualCoordinateSystem={manualCoordinateSystem}
            onManualCoordinateSystemChange={setManualCoordinateSystem}
          />
        )}

        <div className="flex space-x-2">
          {!parseResult && (
            <Button
              onClick={() => selectedFile && handleFilePreview(selectedFile)}
              disabled={!selectedFile || isUploading}
              variant="outline"
            >
              {isUploading ? 'Analizando...' : 'Vista previa'}
            </Button>
          )}
          
          <Button
            onClick={handleFileUpload}
            disabled={!selectedFile || isUploading || !parseResult || parseResult.parcels.length === 0}
            className="flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Importando...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Importar ({parseResult?.parcels.length || 0} parcelas)</span>
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={onCancel} disabled={isUploading}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CadastralFileUpload;
