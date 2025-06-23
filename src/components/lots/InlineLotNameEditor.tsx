
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Check, X } from 'lucide-react';
import { useLotStore } from '@/stores/lotStore';
import { toast } from 'sonner';

interface InlineLotNameEditorProps {
  lotId: string;
  lotName: string;
  onNameUpdate?: (newName: string) => void;
  className?: string;
  showEditIcon?: boolean;
}

const InlineLotNameEditor: React.FC<InlineLotNameEditorProps> = ({
  lotId,
  lotName,
  onNameUpdate,
  className = "",
  showEditIcon = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(lotName);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateLot, lots } = useLotStore();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(lotName);
  }, [lotName]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(lotName);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(lotName);
  };

  const handleSave = async () => {
    const trimmedValue = editValue.trim();
    
    if (!trimmedValue) {
      toast.error('El nombre del lote no puede estar vacío');
      return;
    }

    if (trimmedValue === lotName) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      const lot = lots.find(l => l.id === lotId);
      if (!lot) {
        toast.error('Lote no encontrado');
        return;
      }

      const success = await updateLot(lotId, {
        ...lot,
        name: trimmedValue
      });

      if (success) {
        toast.success('Nombre actualizado correctamente');
        setIsEditing(false);
        onNameUpdate?.(trimmedValue);
      } else {
        toast.error('Error al actualizar el nombre');
      }
    } catch (error) {
      console.error('Error updating lot name:', error);
      toast.error('Error al actualizar el nombre');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-6 text-sm py-1 px-2"
          disabled={isLoading}
        />
        <Button
          onClick={handleSave}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          disabled={isLoading}
        >
          <Check className="w-3 h-3 text-green-600" />
        </Button>
        <Button
          onClick={handleCancel}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          disabled={isLoading}
        >
          <X className="w-3 h-3 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 group ${className}`}>
      <span className="text-gray-700 truncate flex-1" title={lotName}>
        {lotName}
      </span>
      {showEditIcon && (
        <Button
          onClick={handleStartEdit}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

export default InlineLotNameEditor;
