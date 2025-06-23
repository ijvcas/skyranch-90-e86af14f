
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, AlertTriangle } from 'lucide-react';

interface InfrastructureSectionProps {
  onAddEntry: (entry: any) => void;
}

const InfrastructureSection = ({ onAddEntry }: InfrastructureSectionProps) => {
  const [infrastructureType, setInfrastructureType] = useState('');
  const [condition, setCondition] = useState('');
  const [priority, setPriority] = useState('');
  const [cost, setCost] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddEntry = () => {
    if (!infrastructureType || !condition) return;

    const entry = {
      entry_type: 'infrastructure',
      category: infrastructureType,
      title: `Infraestructura: ${infrastructureType}`,
      description: notes,
      cost: cost ? parseFloat(cost) : undefined,
      status: condition,
      metadata: {
        infrastructure_type: infrastructureType,
        condition,
        priority,
        location,
      },
    };

    onAddEntry(entry);
    
    // Reset form
    setInfrastructureType('');
    setCondition('');
    setPriority('');
    setCost('');
    setLocation('');
    setNotes('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wrench className="w-5 h-5 mr-2" />
          Infraestructura y Mantenimiento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="infrastructure-type">Tipo de Infraestructura</Label>
            <Select value={infrastructureType} onValueChange={setInfrastructureType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fence">Cercas</SelectItem>
                <SelectItem value="water_system">Sistema de Agua</SelectItem>
                <SelectItem value="feeding_equipment">Equipo de Alimentación</SelectItem>
                <SelectItem value="shelter">Refugio/Establo</SelectItem>
                <SelectItem value="gates">Puertas/Portones</SelectItem>
                <SelectItem value="roads">Caminos</SelectItem>
                <SelectItem value="equipment">Equipo/Maquinaria</SelectItem>
                <SelectItem value="facilities">Instalaciones</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="condition">Condición</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar condición" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excelente</SelectItem>
                <SelectItem value="good">Buena</SelectItem>
                <SelectItem value="fair">Regular</SelectItem>
                <SelectItem value="poor">Mala</SelectItem>
                <SelectItem value="needs_repair">Necesita Reparación</SelectItem>
                <SelectItem value="replacement_needed">Necesita Reemplazo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Prioridad</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="infra-cost">Costo Estimado (€)</Label>
            <Input
              id="infra-cost"
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="location">Ubicación/Lote</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lote 1, Zona Norte, etc."
            />
          </div>
        </div>

        <div>
          <Label htmlFor="infra-notes">Detalles y Observaciones</Label>
          <Textarea
            id="infra-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Descripción del problema, acciones requeridas, materiales necesarios..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handleAddEntry}
          disabled={!infrastructureType || !condition}
          className="w-full"
        >
          Agregar Entrada de Infraestructura
        </Button>
      </CardContent>
    </Card>
  );
};

export default InfrastructureSection;
