
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, Upload, QrCode, Database, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllAnimals as getSupabaseAnimals, addAnimal as addSupabaseAnimal } from '@/services/animalService';
import { addAnimal as addLocalAnimal } from '@/stores/animalStore';
import { Animal } from '@/stores/animalStore';
import * as QRCode from 'qrcode';

const DataImportExport = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>('');

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Get animals from Supabase
      const animals = await getSupabaseAnimals();
      
      if (animals.length === 0) {
        toast({
          title: "Sin datos",
          description: "No hay animales para exportar",
          variant: "destructive"
        });
        return;
      }

      const headers = [
        'ID', 'Nombre', 'Tag', 'Especie', 'Raza', 'Fecha de Nacimiento',
        'Género', 'Peso', 'Color', 'ID Madre', 'ID Padre', 'Estado de Salud', 'Notas'
      ];

      const csvContent = [
        headers.join(','),
        ...animals.map(animal => [
          animal.id,
          `"${animal.name}"`,
          animal.tag,
          animal.species,
          `"${animal.breed || ''}"`,
          animal.birthDate || '',
          animal.gender || '',
          animal.weight || '',
          `"${animal.color || ''}"`,
          animal.motherId || '',
          animal.fatherId || '',
          animal.healthStatus || 'healthy',
          `"${animal.notes || ''}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `animales_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportación exitosa",
        description: `Se exportaron ${animals.length} animales a CSV`
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "Error",
        description: "No se pudo exportar los datos",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      // Get animals from Supabase
      const animals = await getSupabaseAnimals();
      
      if (animals.length === 0) {
        toast({
          title: "Sin datos",
          description: "No hay animales para exportar",
          variant: "destructive"
        });
        return;
      }

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        animals: animals
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json;charset=utf-8;' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `backup_animales_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Backup creado",
        description: `Se exportaron ${animals.length} animales como backup`
      });
    } catch (error) {
      console.error('Error exporting JSON:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el backup",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const parseCSVRow = (row: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const handleImportCSV = async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('El archivo CSV debe tener al menos una fila de encabezados y una fila de datos');
      }

      const headers = parseCSVRow(lines[0]).map(h => h.toLowerCase().replace(/"/g, ''));
      const requiredHeaders = ['nombre', 'tag', 'especie'];
      
      const hasRequiredHeaders = requiredHeaders.every(header => 
        headers.some(h => h.includes(header))
      );

      if (!hasRequiredHeaders) {
        throw new Error('El archivo CSV debe contener al menos las columnas: Nombre, Tag, Especie');
      }

      let imported = 0;
      let errors = 0;

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCSVRow(lines[i]);
          
          if (values.length < 3) continue;

          const animal: Omit<Animal, 'id'> = {
            name: values[1]?.replace(/"/g, '') || `Animal ${i}`,
            tag: values[2] || `TAG${i}`,
            species: values[3] || 'bovino',
            breed: values[4]?.replace(/"/g, '') || '',
            birthDate: values[5] || '',
            gender: values[6] || '',
            weight: values[7] || '',
            color: values[8]?.replace(/"/g, '') || '',
            motherId: values[9] || '',
            fatherId: values[10] || '',
            healthStatus: values[11] || 'healthy',
            notes: values[12]?.replace(/"/g, '') || '',
            image: null
          };

          // Try to add to Supabase first, then fallback to local storage
          const supabaseResult = await addSupabaseAnimal(animal);
          if (supabaseResult.success) {
            imported++;
          } else {
            // Fallback to local storage
            const localAnimal: Animal = {
              id: `animal_${Date.now()}_${i}`,
              ...animal
            };
            const localResult = await addLocalAnimal(localAnimal);
            if (localResult) {
              imported++;
            } else {
              errors++;
            }
          }
        } catch (rowError) {
          console.error(`Error processing row ${i}:`, rowError);
          errors++;
        }
      }

      toast({
        title: "Importación completada",
        description: `Importados: ${imported} animales. Errores: ${errors}`
      });

    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({
        title: "Error de importación",
        description: error instanceof Error ? error.message : "No se pudo importar el archivo",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportJSON = async (file: File) => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      let animals: any[];
      
      if (data.animals && Array.isArray(data.animals)) {
        animals = data.animals;
      } else if (Array.isArray(data)) {
        animals = data;
      } else {
        throw new Error('Formato de archivo JSON no válido');
      }

      let imported = 0;
      let errors = 0;

      for (const animalData of animals) {
        try {
          const animal: Omit<Animal, 'id'> = {
            name: animalData.name || `Animal ${imported}`,
            tag: animalData.tag || `TAG${imported}`,
            species: animalData.species || 'bovino',
            breed: animalData.breed || '',
            birthDate: animalData.birthDate || '',
            gender: animalData.gender || '',
            weight: animalData.weight || '',
            color: animalData.color || '',
            motherId: animalData.motherId || '',
            fatherId: animalData.fatherId || '',
            healthStatus: animalData.healthStatus || 'healthy',
            notes: animalData.notes || '',
            image: animalData.image || null
          };

          // Try to add to Supabase first, then fallback to local storage
          const supabaseResult = await addSupabaseAnimal(animal);
          if (supabaseResult.success) {
            imported++;
          } else {
            // Fallback to local storage
            const localAnimal: Animal = {
              id: animalData.id || `animal_${Date.now()}_${imported}`,
              ...animal
            };
            const localResult = await addLocalAnimal(localAnimal);
            if (localResult) {
              imported++;
            } else {
              errors++;
            }
          }
        } catch (animalError) {
          console.error('Error processing animal:', animalError);
          errors++;
        }
      }

      toast({
        title: "Importación completada",
        description: `Importados: ${imported} animales. Errores: ${errors}`
      });

    } catch (error) {
      console.error('Error importing JSON:', error);
      toast({
        title: "Error de importación",
        description: error instanceof Error ? error.message : "No se pudo importar el archivo",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      handleImportCSV(file);
    } else if (fileExtension === 'json') {
      handleImportJSON(file);
    } else {
      toast({
        title: "Formato no válido",
        description: "Solo se admiten archivos CSV y JSON",
        variant: "destructive"
      });
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateQRCode = async () => {
    try {
      // Get animals from Supabase
      const animals = await getSupabaseAnimals();
      
      if (animals.length === 0) {
        toast({
          title: "Sin datos",
          description: "No hay animales para generar QR",
          variant: "destructive"
        });
        return;
      }

      const qrData = {
        farmInfo: {
          name: "SkyRanch",
          totalAnimals: animals.length,
          exportDate: new Date().toISOString()
        },
        animals: animals.slice(0, 10).map(animal => ({
          id: animal.id,
          name: animal.name,
          tag: animal.tag,
          species: animal.species
        }))
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeData(qrCodeDataURL);

      toast({
        title: "QR generado",
        description: "Código QR creado con información de la granja"
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el código QR",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Exportar Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleExportCSV}
              disabled={isExporting}
              className="h-16"
            >
              <FileText className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-semibold">Exportar CSV</div>
                <div className="text-xs opacity-80">Para Excel o análisis</div>
              </div>
            </Button>
            
            <Button 
              onClick={handleExportJSON}
              disabled={isExporting}
              variant="outline"
              className="h-16"
            >
              <Database className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-semibold">Crear Backup</div>
                <div className="text-xs opacity-80">Respaldo completo JSON</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Import Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Importar Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <div className="text-sm text-yellow-800">
              <strong>Importante:</strong> Los archivos CSV deben tener las columnas: Nombre, Tag, Especie (mínimo requerido)
            </div>
          </div>
          
          <div>
            <Label htmlFor="file-upload">Seleccionar archivo (CSV o JSON)</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              disabled={isImporting}
              ref={fileInputRef}
            />
          </div>
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full"
          >
            {isImporting ? "Importando..." : "Seleccionar archivo para importar"}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* QR Code Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="w-5 h-5 mr-2" />
            Código QR de la Granja
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Genera un código QR con información básica de tu granja para compartir o imprimir.
          </p>
          
          <Button onClick={generateQRCode} className="w-full">
            Generar Código QR
          </Button>
          
          {qrCodeData && (
            <div className="text-center">
              <img 
                src={qrCodeData} 
                alt="QR Code" 
                className="mx-auto border rounded-lg p-4 bg-white"
              />
              <p className="text-xs text-gray-500 mt-2">
                Código QR con información de la granja
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataImportExport;
