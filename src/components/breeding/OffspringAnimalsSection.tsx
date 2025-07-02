
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Baby, ExternalLink } from 'lucide-react';
import { getOffspringAnimalsForBreeding } from '@/services/breeding/offspringAnimalService';

interface OffspringAnimalsSectionProps {
  breedingRecordId: string;
  offspringCount: number;
  onViewAnimal?: (animalId: string) => void;
}

const OffspringAnimalsSection: React.FC<OffspringAnimalsSectionProps> = ({
  breedingRecordId,
  offspringCount,
  onViewAnimal
}) => {
  const [offspringAnimals, setOffspringAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffspringAnimals = async () => {
      try {
        const animals = await getOffspringAnimalsForBreeding(breedingRecordId);
        setOffspringAnimals(animals);
      } catch (error) {
        console.error('Error fetching offspring animals:', error);
      } finally {
        setLoading(false);
      }
    };

    if (offspringCount > 0) {
      fetchOffspringAnimals();
    } else {
      setLoading(false);
    }
  }, [breedingRecordId, offspringCount]);

  if (offspringCount === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Baby className="w-5 h-5" />
          Crías Registradas ({offspringAnimals.length}/{offspringCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-gray-500">Cargando información de las crías...</p>
        ) : offspringAnimals.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-2">
              No se han creado registros de animales para las crías aún.
            </p>
            <p className="text-sm text-gray-400">
              Los registros se crean automáticamente cuando se confirma el nacimiento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {offspringAnimals.map((offspring) => (
              <div
                key={offspring.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium">
                    {offspring.animals?.name || 'Cría sin nombre'}
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Etiqueta: {offspring.animals?.tag || 'N/A'}</p>
                    <p>Especie: {offspring.animals?.species || 'N/A'}</p>
                    {offspring.animals?.gender && (
                      <p>Sexo: {offspring.animals.gender}</p>
                    )}
                    {offspring.birth_weight && (
                      <p>Peso al nacer: {offspring.birth_weight} kg</p>
                    )}
                  </div>
                </div>
                {offspring.animal_id && onViewAnimal && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewAnimal(offspring.animal_id)}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Ver Animal
                  </Button>
                )}
              </div>
            ))}
            {offspringAnimals.length < offspringCount && (
              <div className="text-center py-2">
                <p className="text-sm text-orange-600">
                  Faltan {offspringCount - offspringAnimals.length} registro(s) de cría(s) por crear.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OffspringAnimalsSection;
