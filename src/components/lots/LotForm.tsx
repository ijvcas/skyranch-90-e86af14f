
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLotStore } from '@/stores/lotStore';
import { toast } from 'sonner';

interface LotFormProps {
  onClose: () => void;
  lot?: any;
}

const LotForm = ({ onClose, lot }: LotFormProps) => {
  const { addLot, updateLot } = useLotStore();
  const isEditing = !!lot;

  const [formData, setFormData] = useState({
    name: lot?.name || '',
    description: lot?.description || '',
    sizeHectares: lot?.sizeHectares?.toString() || '',
    capacity: lot?.capacity?.toString() || '',
    grassType: lot?.grassType || '',
    locationCoordinates: lot?.locationCoordinates || '',
    status: lot?.status || 'active',
    grassCondition: lot?.grassCondition || 'good',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const lotData = {
        name: formData.name,
        description: formData.description || undefined,
        sizeHectares: formData.sizeHectares ? parseFloat(formData.sizeHectares) : undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        grassType: formData.grassType || undefined,
        locationCoordinates: formData.locationCoordinates || undefined,
        status: formData.status,
        grassCondition: formData.grassCondition,
      };

      const success = isEditing 
        ? await updateLot(lot.id, lotData)
        : await addLot(lotData);

      if (success) {
        toast.success(isEditing ? 'Lote actualizado exitosamente' : 'Lote creado exitosamente');
        onClose();
      } else {
        toast.error('Error al guardar el lote');
      }
    } catch (error) {
      console.error('Error saving lot:', error);
      toast.error('Error al guardar el lote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre del Lote *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Ej: Lote Norte"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="status">Estado</Label>
          <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="resting">En Descanso</SelectItem>
              <SelectItem value="maintenance">Mantenimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Descripción del lote..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="sizeHectares">Tamaño (hectáreas)</Label>
          <Input
            id="sizeHectares"
            type="number"
            step="0.1"
            value={formData.sizeHectares}
            onChange={(e) => handleInputChange('sizeHectares', e.target.value)}
            placeholder="10.5"
          />
        </div>
        
        <div>
          <Label htmlFor="capacity">Capacidad (animales)</Label>
          <Input
            id="capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => handleInputChange('capacity', e.target.value)}
            placeholder="50"
          />
        </div>
        
        <div>
          <Label htmlFor="grassCondition">Condición del Pasto</Label>
          <Select value={formData.grassCondition} onValueChange={(value) => handleInputChange('grassCondition', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excelente</SelectItem>
              <SelectItem value="good">Buena</SelectItem>
              <SelectItem value="fair">Regular</SelectItem>
              <SelectItem value="poor">Pobre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="grassType">Tipo de Pasto</Label>
          <Input
            id="grassType"
            value={formData.grassType}
            onChange={(e) => handleInputChange('grassType', e.target.value)}
            placeholder="Ej: Brachiaria, Guinea, etc."
          />
        </div>
        
        <div>
          <Label htmlFor="locationCoordinates">Coordenadas</Label>
          <Input
            id="locationCoordinates"
            value={formData.locationCoordinates}
            onChange={(e) => handleInputChange('locationCoordinates', e.target.value)}
            placeholder="Lat, Lng"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.name}>
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Lote'}
        </Button>
      </div>
    </form>
  );
};

export default LotForm;
