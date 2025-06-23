
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Baby } from 'lucide-react';

interface PregnancyBirthSectionProps {
  onAddEntry: (entry: any) => void;
  animals: Array<{ id: string; name: string }>;
}

const PregnancyBirthSection = ({ onAddEntry, animals }: PregnancyBirthSectionProps) => {
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [pregnancyStatus, setPregnancyStatus] = useState('');
  const [offspringCount, setOffspringCount] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddEntry = () => {
    if (!selectedAnimal || !pregnancyStatus) return;

    const entry = {
      animal_id: selectedAnimal,
      entry_type: 'pregnancy',
      category: pregnancyStatus,
      title: `Estado de embarazo: ${pregnancyStatus}`,
      description: notes,
      quantity: offspringCount ? parseInt(offspringCount) : undefined,
      completion_date: birthDate || undefined,
      metadata: {
        pregnancy_status: pregnancyStatus,
        offspring_count: offspringCount ? parseInt(offspringCount) : undefined,
        birth_date: birthDate,
      },
    };

    onAddEntry(entry);
    
    // Reset form
    setSelectedAnimal('');
    setPregnancyStatus('');
    setOffspringCount('');
    setBirthDate('');
    setNotes('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Baby className="w-5 h-5 mr-2" />
          Embarazo y Nacimientos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="animal">Animal</Label>
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
            <Label htmlFor="status">Estado del Embarazo</Label>
            <Select value={pregnancyStatus} onValueChange={setPregnancyStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Embarazo Confirmado</SelectItem>
                <SelectItem value="suspected">Embarazo Sospechoso</SelectItem>
                <SelectItem value="birth">Nacimiento</SelectItem>
                <SelectItem value="miscarriage">Aborto</SelectItem>
                <SelectItem value="not_pregnant">No Embarazada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="offspring">Número de Crías</Label>
            <Input
              id="offspring"
              type="number"
              value={offspringCount}
              onChange={(e) => setOffspringCount(e.target.value)}
              placeholder="1"
            />
          </div>

          <div>
            <Label htmlFor="birth-date">Fecha de Nacimiento</Label>
            <Input
              id="birth-date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="pregnancy-notes">Observaciones</Label>
          <Textarea
            id="pregnancy-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detalles del embarazo, complicaciones, observaciones del nacimiento..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handleAddEntry}
          disabled={!selectedAnimal || !pregnancyStatus}
          className="w-full"
        >
          Agregar Entrada de Embarazo
        </Button>
      </CardContent>
    </Card>
  );
};

export default PregnancyBirthSection;
