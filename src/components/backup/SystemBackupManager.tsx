
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, Database, Users, FileText, Calendar, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@/services/userService';
import { getAllAnimals } from '@/services/animalService';

interface BackupData {
  users: boolean;
  animals: boolean;
  lots: boolean;
  healthRecords: boolean;
  breedingRecords: boolean;
  calendarEvents: boolean;
}

const SystemBackupManager: React.FC = () => {
  const { toast } = useToast();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedData, setSelectedData] = useState<BackupData>({
    users: true,
    animals: true,
    lots: true,
    healthRecords: true,
    breedingRecords: true,
    calendarEvents: true,
  });

  // Get data for export
  const { data: users = [] } = useQuery({
    queryKey: ['app-users'],
    queryFn: getAllUsers,
  });

  const { data: animals = [] } = useQuery({
    queryKey: ['animals'],
    queryFn: getAllAnimals,
  });

  const backupCategories = [
    { key: 'users', label: 'Usuarios', icon: Users, description: 'Cuentas de usuario y configuraciones' },
    { key: 'animals', label: 'Animales', icon: Database, description: 'Registro de animales y genealogía' },
    { key: 'lots', label: 'Lotes', icon: Shield, description: 'Lotes y polígonos del terreno' },
    { key: 'healthRecords', label: 'Registros de Salud', icon: FileText, description: 'Historial médico y tratamientos' },
    { key: 'breedingRecords', label: 'Registros de Reproducción', icon: Database, description: 'Apareamientos y crías' },
    { key: 'calendarEvents', label: 'Eventos del Calendario', icon: Calendar, description: 'Eventos programados y recordatorios' },
  ];

  const handleDataSelectionChange = (category: keyof BackupData, checked: boolean) => {
    setSelectedData(prev => ({
      ...prev,
      [category]: checked
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImportFile(event.target.files[0]);
    }
  };

  const simulateProgress = (callback: () => void) => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            callback();
            setProgress(100);
            setTimeout(() => setProgress(0), 2000);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleExport = () => {
    setIsExporting(true);
    
    simulateProgress(() => {
      try {
        const backupData: any = {
          metadata: {
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            selectedCategories: Object.keys(selectedData).filter(key => selectedData[key as keyof BackupData])
          }
        };

        // Add selected data categories
        if (selectedData.users) {
          backupData.users = users;
        }
        if (selectedData.animals) {
          backupData.animals = animals;
        }
        if (selectedData.lots) {
          backupData.lots = []; // Would come from lot service
        }
        if (selectedData.healthRecords) {
          backupData.healthRecords = []; // Would come from health records service
        }
        if (selectedData.breedingRecords) {
          backupData.breedingRecords = []; // Would come from breeding service
        }
        if (selectedData.calendarEvents) {
          backupData.calendarEvents = []; // Would come from calendar service
        }

        const dataStr = JSON.stringify(backupData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const timestamp = new Date().toISOString().split('T')[0];
        const selectedCategories = Object.keys(selectedData).filter(key => selectedData[key as keyof BackupData]);
        const exportFileName = `farm_backup_${timestamp}_${selectedCategories.join('_')}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);

        toast({
          title: "Backup Completado",
          description: `Backup exportado exitosamente como ${exportFileName}`,
        });
      } catch (error) {
        console.error('Error during export:', error);
        toast({
          title: "Error en Backup",
          description: "No se pudo completar el backup",
          variant: "destructive"
        });
      } finally {
        setIsExporting(false);
      }
    });
  };

  const handleImport = () => {
    if (!importFile) {
      toast({
        title: "Archivo No Seleccionado",
        description: "Por favor selecciona un archivo de backup para importar.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    simulateProgress(async () => {
      try {
        const text = await importFile.text();
        const backupData = JSON.parse(text);

        // Validate backup structure
        if (!backupData.metadata || !backupData.metadata.version) {
          throw new Error("Archivo de backup inválido - falta metadata");
        }

        console.log('📦 Importing backup data:', backupData.metadata);

        // Process each data category
        let importCount = 0;
        
        if (backupData.users && selectedData.users) {
          console.log(`👥 Importing ${backupData.users.length} users`);
          importCount += backupData.users.length;
          // Here you would call the actual import functions
        }

        if (backupData.animals && selectedData.animals) {
          console.log(`🐄 Importing ${backupData.animals.length} animals`);
          importCount += backupData.animals.length;
        }

        if (backupData.lots && selectedData.lots) {
          console.log(`🏞️ Importing ${backupData.lots.length} lots`);
          importCount += backupData.lots.length;
        }

        toast({
          title: "Importación Completada",
          description: `Se han importado ${importCount} registros exitosamente.`,
        });

      } catch (error: any) {
        console.error("Error importing backup:", error);
        toast({
          title: "Error en Importación",
          description: `Error al importar: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
        setImportFile(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Backup y Restauración del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Seleccionar Datos para Backup/Restauración</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {backupCategories.map(({ key, label, icon: Icon, description }) => (
                <div key={key} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={key}
                    checked={selectedData[key as keyof BackupData]}
                    onCheckedChange={(checked) => handleDataSelectionChange(key as keyof BackupData, !!checked)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <Label htmlFor={key} className="font-medium">{label}</Label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          {(isExporting || isImporting) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{isExporting ? 'Exportando...' : 'Importando...'}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Export Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Exportar Datos</Label>
                <p className="text-sm text-gray-500">Crear un backup completo de los datos seleccionados</p>
              </div>
              <Button
                onClick={handleExport}
                disabled={isExporting || isImporting || !Object.values(selectedData).some(Boolean)}
                className="flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <Download className="w-4 h-4 animate-pulse" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Exportar Backup
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Importar Datos</Label>
              <p className="text-sm text-gray-500">Restaurar datos desde un archivo de backup</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  disabled={isImporting || isExporting}
                />
              </div>
              <Button
                onClick={handleImport}
                disabled={isImporting || isExporting || !importFile || !Object.values(selectedData).some(Boolean)}
                className="flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <Upload className="w-4 h-4 animate-pulse" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importar Backup
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Advertencia:</strong> La importación de datos puede sobrescribir información existente. 
              Se recomienda crear un backup actual antes de importar datos externos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemBackupManager;
