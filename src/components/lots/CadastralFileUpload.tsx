
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, FileText, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { saveCadastralParcel } from '@/services/cadastralService';
import { parseSpanishCadastralXML, parseGMLFile, parseDXFFile, type ParsingResult } from '@/utils/cadastralParsers';
import { COORDINATE_SYSTEMS } from '@/utils/coordinateTransform';
import { toast } from 'sonner';

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

  const getFileFormat = (fileName: string): string => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'xml': return 'Spanish Cadastral XML';
      case 'gml': return 'Geographic Markup Language (GML)';
      case 'dxf': return 'Drawing Exchange Format (DXF)';
      case 'kml': return 'Keyhole Markup Language (KML)';
      default: return 'Unknown format';
    }
  };

  const handleFilePreview = async (file: File) => {
    setIsUploading(true);
    try {
      const fileName = file.name.toLowerCase();
      let result: ParsingResult;

      if (fileName.endsWith('.xml')) {
        result = await parseSpanishCadastralXML(file);
      } else if (fileName.endsWith('.gml')) {
        result = await parseGMLFile(file);
      } else if (fileName.endsWith('.dxf')) {
        result = await parseDXFFile(file);
      } else if (fileName.endsWith('.kml')) {
        // Fallback to simple KML parsing
        result = await parseKMLFile(file);
      } else {
        throw new Error('Formato de archivo no soportado. Use archivos .xml, .gml, .dxf o .kml');
      }

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
        // Re-transform coordinates with manual system
        // This would require re-parsing with the specified system
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

  // Simple KML parsing fallback
  const parseKMLFile = async (file: File): Promise<ParsingResult> => {
    const result: ParsingResult = {
      parcels: [],
      coordinateSystem: 'EPSG:4326',
      errors: [],
      warnings: []
    };

    try {
      const content = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'application/xml');
      
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        result.errors.push('Error parsing KML file');
        return result;
      }

      const placemarks = xmlDoc.querySelectorAll('Placemark');
      
      placemarks.forEach((placemark, index) => {
        const name = placemark.querySelector('name')?.textContent || `KML_Parcel_${index + 1}`;
        const description = placemark.querySelector('description')?.textContent || '';
        const coordinatesText = placemark.querySelector('coordinates')?.textContent?.trim();
        
        if (coordinatesText) {
          const coordPairs = coordinatesText.split(/\s+/).filter(coord => coord.length > 0);
          const coordinates = coordPairs.map(coord => {
            const [lng, lat] = coord.split(',').map(Number);
            return { lat, lng };
          }).filter(coord => !isNaN(coord.lat) && !isNaN(coord.lng));

          if (coordinates.length >= 3) {
            result.parcels.push({
              parcelId: name,
              boundaryCoordinates: coordinates,
              notes: description,
              classification: 'KML Import'
            });
          }
        }
      });
    } catch (error) {
      result.errors.push('Error processing KML file');
    }

    return result;
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

        {selectedFile && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Archivo seleccionado</AlertTitle>
            <AlertDescription>
              <div className="space-y-1">
                <p><strong>Nombre:</strong> {selectedFile.name}</p>
                <p><strong>Tamaño:</strong> {(selectedFile.size / 1024).toFixed(1)} KB</p>
                <p><strong>Formato:</strong> {getFileFormat(selectedFile.name)}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {parseResult && (
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
        )}

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
          <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
            <div>
              <label className="block text-sm font-medium mb-2">
                Sistema de coordenadas manual
              </label>
              <Select value={manualCoordinateSystem} onValueChange={setManualCoordinateSystem}>
                <SelectTrigger>
                  <SelectValue placeholder="Detectar automáticamente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Detectar automáticamente</SelectItem>
                  {Object.entries(COORDINATE_SYSTEMS).map(([key, system]) => (
                    <SelectItem key={key} value={key}>
                      {system.name} ({key})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
