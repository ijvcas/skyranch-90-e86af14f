
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Rocket, GitBranch, Clock, Plus, History, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { unifiedVersionManager, type UnifiedVersionInfo } from '@/services/unifiedVersionManager';

const VersionControlPanel = () => {
  const { toast } = useToast();
  const [currentVersion, setCurrentVersion] = useState<UnifiedVersionInfo | null>(null);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [versionType, setVersionType] = useState<'major' | 'minor' | 'patch'>('patch');
  const [notes, setNotes] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const loadCurrentVersion = () => {
      const version = unifiedVersionManager.getCurrentVersion();
      setCurrentVersion(version);
    };

    loadCurrentVersion();

    const handleVersionUpdate = (event: CustomEvent) => {
      setCurrentVersion(event.detail);
    };

    window.addEventListener('unified-version-updated', handleVersionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('unified-version-updated', handleVersionUpdate as EventListener);
    };
  }, []);

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
      setShowPublishForm(false);
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

  const getVersionTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'bg-red-100 text-red-800';
      case 'minor': return 'bg-blue-100 text-blue-800';
      case 'patch': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVersionTypeIcon = (type: string) => {
    switch (type) {
      case 'major': return <AlertCircle className="w-4 h-4" />;
      case 'minor': return <Plus className="w-4 h-4" />;
      case 'patch': return <CheckCircle className="w-4 h-4" />;
      default: return <GitBranch className="w-4 h-4" />;
    }
  };

  const criteria = unifiedVersionManager.getVersionCriteria();
  const suggestion = unifiedVersionManager.getIncrementSuggestion();
  const nextVersionPreview = unifiedVersionManager.getNextVersionPreview(versionType);

  if (!currentVersion) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Cargando información de versiones...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Rocket className="w-5 h-5 mr-2" />
            Control de Versiones Unificado
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPublishForm(!showPublishForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showPublishForm ? 'Cancelar' : 'Publicar Versión'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Versión Actual:</span>
          <Badge variant="outline" className="font-mono text-lg">
            v{currentVersion.version}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Número de Build:</span>
          <Badge variant="secondary">
            #{currentVersion.buildNumber}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tipo de Versión:</span>
          <Badge className={getVersionTypeColor(currentVersion.versionType)}>
            <div className="flex items-center gap-1">
              {getVersionTypeIcon(currentVersion.versionType)}
              {currentVersion.versionType.toUpperCase()}
            </div>
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>Fecha de Publicación:</span>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            {new Date(currentVersion.releaseDate).toLocaleString('es-ES')}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <GitBranch className="w-4 h-4 mr-2" />
            <span>Notas de la Versión:</span>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            {currentVersion.notes}
          </p>
        </div>

        {currentVersion.publishedBy && (
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <span>Publicado por:</span>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              {currentVersion.publishedBy}
            </p>
          </div>
        )}

        {showPublishForm && (
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
            
            <Button 
              onClick={handlePublishVersion}
              disabled={isPublishing || !notes.trim()}
              className="w-full"
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
          </div>
        )}

        <div className="bg-amber-50 p-3 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Sistema Unificado:</strong> Este panel controla todas las versiones del sistema. 
            Los incrementos siguen la convención semántica: MAJOR.MINOR.PATCH.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VersionControlPanel;
