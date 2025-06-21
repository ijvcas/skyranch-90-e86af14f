
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import AnimalSelectionWithStatus from './AnimalSelectionWithStatus';
import type { Animal } from '@/stores/animalStore';

interface BreedingAnalysisFormProps {
  filteredMales: Animal[];
  filteredFemales: Animal[];
  selectedMaleId: string;
  selectedFemaleId: string;
  onMaleSelect: (id: string) => void;
  onFemaleSelect: (id: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const BreedingAnalysisForm: React.FC<BreedingAnalysisFormProps> = ({
  filteredMales,
  filteredFemales,
  selectedMaleId,
  selectedFemaleId,
  onMaleSelect,
  onFemaleSelect,
  onAnalyze,
  isAnalyzing
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Male Selection */}
        <AnimalSelectionWithStatus
          animals={filteredMales}
          selectedAnimalId={selectedMaleId}
          onAnimalSelect={onMaleSelect}
          placeholder="Seleccionar macho"
          label="Macho"
        />

        {/* Female Selection */}
        <AnimalSelectionWithStatus
          animals={filteredFemales}
          selectedAnimalId={selectedFemaleId}
          onAnimalSelect={onFemaleSelect}
          placeholder="Seleccionar hembra"
          label="Hembra"
        />
      </div>

      <Button 
        onClick={onAnalyze} 
        disabled={!selectedMaleId || !selectedFemaleId || isAnalyzing}
        className="w-full"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analizando...
          </>
        ) : (
          'Analizar Compatibilidad'
        )}
      </Button>
    </div>
  );
};

export default BreedingAnalysisForm;
