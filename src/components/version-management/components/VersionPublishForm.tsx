
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Plus, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { unifiedVersionManager } from '@/services/version-management';

interface VersionPublishFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const VersionPublishForm: React.FC<VersionPublishFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [versionType, setVersionType] = useState<'major' | 'minor' | 'patch'>('patch');
  const [isPublishing, setIsPublishing] = useState(false);
  const [nextVersionPreview, setNextVersionPreview] = useState('');

  // Update version preview when type changes
  useEffect(() => {
    const updatePreview = async () => {
      const preview = await unifiedVersionManager.getNextVersionPreview(versionType);
      setNextVersionPreview(preview);
    };
    updatePreview();
  }, [versionType]);

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast({
        title: "Notas requeridas",
        description: "Por favor ingresa las notas de la versión",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);
    
    try {
      console.log(`🚀 Publishing ${versionType} version with preview: ${nextVersionPreview}`);
      
      const newVersion = await unifiedVersionManager.publishNewVersion(
        versionType,
        notes.trim(),
        'Usuario'
      );

      if (newVersion) {
        toast({
          title: `¡Versión ${versionType.toUpperCase()} publicada exitosamente!`,
          description: `Nueva versión v${newVersion.version} (Build #${newVersion.buildNumber}) publicada en la base de datos`,
        });
        
        setNotes('');
        onSuccess();
      } else {
        throw new Error('Failed to publish version');
      }
    } catch (error) {
      console.error('Error publishing version:', error);
      toast({
        title: "Error al publicar versión",
        description: "No se pudo publicar la versión en la base de datos",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Publicar Nueva Versión en Base de Datos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="version-type">Tipo de versión</Label>
          <Select value={versionType} onValueChange={(value: 'major' | 'minor' | 'patch') => setVersionType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="patch">Patch (corrección, v2.3.21 → v2.3.22)</SelectItem>
              <SelectItem value="minor">Minor (nueva funcionalidad, v2.3.21 → v2.4.0)</SelectItem>
              <SelectItem value="major">Major (cambios importantes, v2.3.21 → v3.0.0)</SelectItem>
            </SelectContent>
          </Select>
          
          {nextVersionPreview && (
            <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-800">
                <strong>Próxima versión:</strong> {nextVersionPreview}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="version-notes">Notas de la versión *</Label>
          <Input
            id="version-notes"
            placeholder="Ej: Corrección de errores, nuevas funcionalidades..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isPublishing}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit}
            disabled={isPublishing || !notes.trim()}
            className="flex-1"
          >
            {isPublishing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Publicando {versionType.toUpperCase()}...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Publicar {versionType.toUpperCase()} en BD
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isPublishing}
          >
            Cancelar
          </Button>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Tipos de versión:</strong><br/>
            • <strong>PATCH:</strong> Correcciones y mejoras menores<br/>
            • <strong>MINOR:</strong> Nuevas funcionalidades compatibles<br/>
            • <strong>MAJOR:</strong> Cambios importantes o incompatibles
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VersionPublishForm;
