
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface AnimalListFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSpecies: string;
  onSpeciesChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
}

const AnimalListFilters = ({
  searchTerm,
  onSearchChange,
  selectedSpecies,
  onSpeciesChange,
  selectedStatus,
  onStatusChange
}: AnimalListFiltersProps) => {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre o etiqueta..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={selectedSpecies} onValueChange={onSpeciesChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Especie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las especies</SelectItem>
                <SelectItem value="bovino">Bovino</SelectItem>
                <SelectItem value="ovino">Ovino</SelectItem>
                <SelectItem value="caprino">Caprino</SelectItem>
                <SelectItem value="porcino">Porcino</SelectItem>
                <SelectItem value="equino">Equino</SelectItem>
                <SelectItem value="aviar">Aviar</SelectItem>
                <SelectItem value="canine">Canino</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="healthy">Saludable</SelectItem>
                <SelectItem value="sick">Enfermo</SelectItem>
                <SelectItem value="pregnant">Gestante</SelectItem>
                <SelectItem value="pregnant-healthy">Gestante Saludable</SelectItem>
                <SelectItem value="pregnant-sick">Gestante Enferma</SelectItem>
                <SelectItem value="treatment">En Tratamiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnimalListFilters;
