
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, FileText, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { saveCadastralParcel } from '@/services/cadastralService';
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
  const [parseError, setParseError] = useState<string>('');
  const [parsedData, setParsedData] = useState<any[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setParseError('');
      setParsedData([]);
    }
  };

  const parseKMLFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(content, 'application/xml');
          
          // Check for parsing errors
          const parseError = xmlDoc.querySelector('parsererror');
          if (parseError) {
            throw new Error('Error parsing XML/KML file');
          }

          // Extract placemarks (parcels)
          const placemarks = xmlDoc.querySelectorAll('Placemark');
          const parcels: any[] = [];

          placemarks.forEach((placemark, index) => {
            const name = placemark.querySelector('name')?.textContent || `Parcel_${index + 1}`;
            const description = placemark.querySelector('description')?.textContent || '';
            
            // Extract coordinates from Polygon or LinearRing
            const coordinatesText = placemark.querySelector('coordinates')?.textContent?.trim();
            
            if (coordinatesText) {
              // Parse coordinates (format: lng,lat,alt lng,lat,alt ...)
              const coordPairs = coordinatesText.split(/\s+/).filter(coord => coord.length > 0);
              const coordinates = coordPairs.map(coord => {
                const [lng, lat] = coord.split(',').map(Number);
                return { lat, lng };
              }).filter(coord => !isNaN(coord.lat) && !isNaN(coord.lng));

              if (coordinates.length >= 3) { // At least 3 points for a polygon
                parcels.push({
                  parcelId: name,
                  boundaryCoordinates: coordinates,
                  notes: description,
                  classification: 'Imported from KML'
                });
              }
            }
          });

          resolve(parcels);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  };

  const parseXMLFile = async (file: File): Promise<any[]> => {
    // Similar to KML but for other XML cadastral formats
    // This is a simplified version - you might need to adapt based on your specific XML format
    return parseKMLFile(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !propertyId) return;

    setIsUploading(true);
    setParseError('');

    try {
      let parsedParcels: any[] = [];

      // Determine file type and parse accordingly
      const fileName = selectedFile.name.toLowerCase();
      if (fileName.endsWith('.kml')) {
        parsedParcels = await parseKMLFile(selectedFile);
      } else if (fileName.endsWith('.xml')) {
        parsedParcels = await parseXMLFile(selectedFile);
      } else {
        throw new Error('Formato de archivo no soportado. Use archivos .kml o .xml');
      }

      if (parsedParcels.length === 0) {
        throw new Error('No se encontraron parcelas válidas en el archivo');
      }

      setParsedData(parsedParcels);
      
      // Save parcels to database
      let successCount = 0;
      for (const parcel of parsedParcels) {
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
      setParseError(error instanceof Error ? error.message : 'Error procesando el archivo');
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
            Archivo Catastral (XML/KML)
          </label>
          <Input
            type="file"
            accept=".xml,.kml"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Formatos soportados: .xml, .kml (datos catastrales oficiales)
          </p>
        </div>

        {parseError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}

        {parsedData.length > 0 && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Archivo procesado correctamente. Se encontraron {parsedData.length} parcelas.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex space-x-2">
          <Button
            onClick={handleFileUpload}
            disabled={!selectedFile || isUploading}
            className="flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Importar</span>
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
