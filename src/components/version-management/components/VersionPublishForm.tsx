
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Rocket, AlertCircle, Plus, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { unifiedVersionManager } from '@/services/version-management';

interface VersionPublishFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const VersionPublishForm: React.FC<VersionPublishFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [versionType, setVersionType] = useState<'major' | 'minor' | 'patch'>('patch');
  const [notes, setNotes] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishVersion = async () => {
    if (!notes.trim()) {
      toast({
        title: "Notas requeridas",
        description: "Por favor agrega una descripción de los cambios.",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);
    try {
      const newVersion = unifiedVersionManager.publishNewVersion(versionType, notes);
      setNotes('');
      onSuccess();
      toast({
        title: "Versión publicada exitosamente",
        description: `Nueva versión: v${newVersion.version} (Build #${newVersion.buildNumber})`,
      });
    } catch (error) {
      toast({
        title: "Error al publicar versión",
        description: "No se pudo publicar la nueva versión. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const criteria = unifiedVersionManager.getVersionCriteria();
  const suggestion = unifiedVersionManager.getIncrementSuggestion();
  const nextVersionPreview = unifiedVersionManager.getNextVersionPreview(versionType);

  return (
    <div className="border-t pt-6 space-y-4">
      <h4 className="font-medium">Publicar Nueva Versión</h4>
      
      <div className="space-y-2">
        <Label htmlFor="version-type">Tipo de Versión</Label>
        <Select value={versionType} onValueChange={(value: 'major' | 'minor' | 'patch') => setVersionType(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="patch">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>PATCH - Correcciones</span>
                {suggestion === 'patch' && <Badge variant="outline" className="text-xs">Sugerido</Badge>}
              </div>
            </SelectItem>
            <SelectItem value="minor">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>MINOR - Nuevas Funcionalidades</span>
                {suggestion === 'minor' && <Badge variant="outline" className="text-xs">Sugerido</Badge>}
              </div>
            </SelectItem>
            <SelectItem value="major">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>MAJOR - Cambios Importantes</span>
                {suggestion === 'major' && <Badge variant="outline" className="text-xs">Sugerido</Badge>}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="version-notes">Notas de la Versión</Label>
        <Textarea
          id="version-notes"
          placeholder="Describe los cambios realizados en esta versión..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Criterio para {versionType.toUpperCase()}:</strong> {criteria[versionType]}
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={handlePublishVersion}
          disabled={isPublishing || !notes.trim()}
          className="flex-1"
        >
          {isPublishing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Publicando...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              Publicar {nextVersionPreview}
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default VersionPublishForm;
