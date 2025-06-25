
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Plus } from 'lucide-react';
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
      const newVersion = await unifiedVersionManager.publishNewVersion(
        versionType,
        notes.trim(),
        'Usuario'
      );

      if (newVersion) {
        toast({
          title: "¡Versión publicada exitosamente!",
          description: `Nueva versión v${newVersion.version} publicada en la base de datos`,
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
              <SelectItem value="patch">Patch (corrección, v2.5.0 → v2.5.1)</SelectItem>
              <SelectItem value="minor">Minor (nueva funcionalidad, v2.5.0 → v2.6.0)</SelectItem>
              <SelectItem value="major">Major (cambios importantes, v2.5.0 → v3.0.0)</SelectItem>
            </SelectContent>
          </Select>
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
                Publicando en BD...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Publicar en Base de Datos
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

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Base de Datos Integrada:</strong> Las versiones ahora se guardan directamente 
            en la base de datos y se mantienen persistentes entre sesiones. No más resets automáticos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VersionPublishForm;
