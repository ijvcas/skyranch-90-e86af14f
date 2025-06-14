
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

interface AnimalListHeaderProps {
  userEmail?: string;
  totalAnimals: number;
  onRefresh: () => void;
}

const AnimalListHeader = ({ userEmail, totalAnimals, onRefresh }: AnimalListHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Todos los Animales</h1>
          <p className="text-gray-600">
            Gestiona y visualiza todos los animales del sistema agrupados por especie
          </p>
          <div className="text-sm text-gray-500 mt-1">
            Usuario: {userEmail} | Total: {totalAnimals} animales
          </div>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
          <Button 
            onClick={() => navigate('/animals/new')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Animal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnimalListHeader;
