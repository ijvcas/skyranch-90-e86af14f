
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, TrendingUp } from 'lucide-react';

interface HealthObservationsSectionProps {
  onAddEntry: (entry: any) => void;
  animals: Array<{ id: string; name: string }>;
}

const HealthObservationsSection = ({ onAddEntry, animals }: HealthObservationsSectionProps) => {
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyCondition, setBodyCondition] = useState('');
  const [behavior, setBehavior] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddEntry = () => {
    if (!selectedAnimal || !healthStatus) return;

    const entry = {
      animal_id: selectedAnimal,
      entry_type: 'health',
      category: healthStatus,
      title: `Observación de salud: ${healthStatus}`,
      description: notes,
      metadata: {
        health_status: healthStatus,
        weight: weight ? parseFloat(weight) : undefined,
        body_condition: bodyCondition,
        behavior,
      },
    };

    onAddEntry(entry);
    
    // Reset form
    setSelectedAnimal('');
    setHealthStatus('');
    setWeight('');
    setBodyCondition('');
    setBehavior('');
    setNotes('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="w-5 h-5 mr-2" />
          Observaciones de Salud
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="health-animal">Animal</Label>
            <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar animal" />
              </SelectTrigger>
              <SelectContent>
                {animals.map((animal) => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="health-status">Estado de Salud</Label>
            <Select value={healthStatus} onValueChange={setHealthStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excelente</SelectItem>
                <SelectItem value="good">Bueno</SelectItem>
                <SelectItem value="fair">Regular</SelectItem>
                <SelectItem value="poor">Malo</SelectItem>
                <SelectItem value="sick">Enfermo</SelectItem>
                <SelectItem value="injured">Lesionado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
            />
          </div>

          <div>
            <Label htmlFor="body-condition">Condición Corporal</Label>
            <Select value={bodyCondition} onValueChange={setBodyCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar condición" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Muy Delgado</SelectItem>
                <SelectItem value="2">2 - Delgado</SelectItem>
                <SelectItem value="3">3 - Normal</SelectItem>
                <SelectItem value="4">4 - Robusto</SelectItem>
                <SelectItem value="5">5 - Obeso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="behavior">Comportamiento Observado</Label>
            <Input
              id="behavior"
              value={behavior}
              onChange={(e) => setBehavior(e.target.value)}
              placeholder="Activo, letárgico, agresivo, normal..."
            />
          </div>
        </div>

        <div>
          <Label htmlFor="health-notes">Observaciones Detalladas</Label>
          <Textarea
            id="health-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detalles del estado de salud, síntomas, cambios observados..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handleAddEntry}
          disabled={!selectedAnimal || !healthStatus}
          className="w-full"
        >
          Agregar Observación de Salud
        </Button>
      </CardContent>
    </Card>
  );
};

export default HealthObservationsSection;
