
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SpeciesSelectorProps {
  selectedSpecies: string;
  onSpeciesChange: (species: string) => void;
  availableSpecies: string[];
}

const SpeciesSelector: React.FC<SpeciesSelectorProps> = ({
  selectedSpecies,
  onSpeciesChange,
  availableSpecies
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Especie (opcional)</label>
      <Select value={selectedSpecies} onValueChange={onSpeciesChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todas las especies" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL_SPECIES">Todas las especies</SelectItem>
          {availableSpecies.map((species) => (
            <SelectItem key={species} value={species}>
              {species}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SpeciesSelector;
