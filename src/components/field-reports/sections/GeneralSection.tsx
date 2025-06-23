
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Users } from 'lucide-react';

interface GeneralSectionProps {
  onAddEntry: (entry: any) => void;
  animals: Array<{ id: string; name: string }>;
}

const GeneralSection = ({ onAddEntry, animals }: GeneralSectionProps) => {
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [activityType, setActivityType] = useState('');
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('');
  const [status, setStatus] = useState('completed');
  const [notes, setNotes] = useState('');

  const handleAddEntry = () => {
    if (!activityType || !title) return;

    const entry = {
      animal_id: selectedAnimal || undefined,
      entry_type: 'general',
      category: activityType,
      title,
      description: notes,
      quantity: quantity ? parseInt(quantity) : undefined,
      status,
      metadata: {
        activity_type: activityType,
      },
    };

    onAddEntry(entry);
    
    // Reset form
    setSelectedAnimal('');
    setActivityType('');
    setTitle('');
    setQuantity('');
    setStatus('completed');
    setNotes('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Actividades Generales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="general-animal">Animal (Opcional)</Label>
            <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar animal o dejar vacío" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguno - Actividad General</SelectItem>
                {animals.map((animal) => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="activity-type">Tipo de Actividad</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar actividad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feeding">Alimentación</SelectItem>
                <SelectItem value="cleaning">Limpieza</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="monitoring">Monitoreo</SelectItem>
                <SelectItem value="breeding">Reproducción</SelectItem>
                <SelectItem value="transport">Transporte</SelectItem>
                <SelectItem value="training">Entrenamiento</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="activity-title">Título de la Actividad</Label>
            <Input
              id="activity-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Alimentación matutina, Limpieza de establos"
            />
          </div>

          <div>
            <Label htmlFor="quantity">Cantidad/Duración</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ej: 2 (horas), 10 (kg de alimento)"
            />
          </div>

          <div>
            <Label htmlFor="general-status">Estado</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="general-notes">Descripción y Observaciones</Label>
          <Textarea
            id="general-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detalles de la actividad, resultados, observaciones..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handleAddEntry}
          disabled={!activityType || !title}
          className="w-full"
        >
          Agregar Actividad General
        </Button>
      </CardContent>
    </Card>
  );
};

export default GeneralSection;
