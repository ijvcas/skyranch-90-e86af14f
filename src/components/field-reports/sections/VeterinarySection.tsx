
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, DollarSign } from 'lucide-react';

interface VeterinarySectionProps {
  onAddEntry: (entry: any) => void;
  animals: Array<{ id: string; name: string }>;
}

const VeterinarySection = ({ onAddEntry, animals }: VeterinarySectionProps) => {
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [cost, setCost] = useState('');
  const [veterinarian, setVeterinarian] = useState('');
  const [medication, setMedication] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddEntry = () => {
    if (!selectedAnimal || !serviceType) return;

    const entry = {
      animal_id: selectedAnimal,
      entry_type: 'veterinary',
      category: serviceType,
      title: `Servicio veterinario: ${serviceType}`,
      description: notes,
      cost: cost ? parseFloat(cost) : undefined,
      due_date: nextDate || undefined,
      metadata: {
        service_type: serviceType,
        veterinarian,
        medication,
        next_appointment: nextDate,
      },
    };

    onAddEntry(entry);
    
    // Reset form
    setSelectedAnimal('');
    setServiceType('');
    setCost('');
    setVeterinarian('');
    setMedication('');
    setNextDate('');
    setNotes('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Stethoscope className="w-5 h-5 mr-2" />
          Servicios Veterinarios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vet-animal">Animal</Label>
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
            <Label htmlFor="service">Tipo de Servicio</Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vaccination">Vacunación</SelectItem>
                <SelectItem value="deworming">Desparasitación</SelectItem>
                <SelectItem value="checkup">Revisión General</SelectItem>
                <SelectItem value="treatment">Tratamiento</SelectItem>
                <SelectItem value="surgery">Cirugía</SelectItem>
                <SelectItem value="emergency">Emergencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="vet-cost">Costo (€)</Label>
            <Input
              id="vet-cost"
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="veterinarian">Veterinario</Label>
            <Input
              id="veterinarian"
              value={veterinarian}
              onChange={(e) => setVeterinarian(e.target.value)}
              placeholder="Nombre del veterinario"
            />
          </div>

          <div>
            <Label htmlFor="medication">Medicación</Label>
            <Input
              id="medication"
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              placeholder="Medicamentos administrados"
            />
          </div>

          <div>
            <Label htmlFor="next-appointment">Próxima Cita</Label>
            <Input
              id="next-appointment"
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="vet-notes">Observaciones del Tratamiento</Label>
          <Textarea
            id="vet-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detalles del servicio, resultados, recomendaciones..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handleAddEntry}
          disabled={!selectedAnimal || !serviceType}
          className="w-full"
        >
          Agregar Entrada Veterinaria
        </Button>
      </CardContent>
    </Card>
  );
};

export default VeterinarySection;
