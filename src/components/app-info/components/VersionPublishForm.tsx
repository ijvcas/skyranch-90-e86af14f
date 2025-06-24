
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Plus } from 'lucide-react';

interface VersionPublishFormProps {
  onPublish: (notes: string) => Promise<void>;
  isPublishing: boolean;
}

const VersionPublishForm: React.FC<VersionPublishFormProps> = ({ onPublish, isPublishing }) => {
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    await onPublish(notes);
    setNotes('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Publicar Nueva Versión
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="version-notes">Notas de la versión (opcional)</Label>
          <Input
            id="version-notes"
            placeholder="Ej: Corrección de errores, nuevas funcionalidades..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={handleSubmit}
          disabled={isPublishing}
          className="w-full"
        >
          {isPublishing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Publicando...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Publicar Nueva Versión
            </>
          )}
        </Button>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Instrucciones:</strong> Después de hacer "Publish Update" en Lovable, 
            usa el botón "Publicar Nueva Versión" para incrementar automáticamente la versión 
            del sistema.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VersionPublishForm;
