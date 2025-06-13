
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardStatsProps {
  totalAnimals: number;
  speciesCounts: Record<string, number>;
}

const DashboardStats = ({ totalAnimals, speciesCounts }: DashboardStatsProps) => {
  const getSpeciesDisplayName = (species: string) => {
    const speciesMap = {
      'bovino': 'Bovinos',
      'ovino': 'Ovinos',
      'equino': 'Equinos',
      'caprino': 'Caprinos',
      'porcino': 'Porcinos',
      'aviar': 'Aves',
      'canino': 'Caninos'
    };
    return speciesMap[species as keyof typeof speciesMap] || species.charAt(0).toUpperCase() + species.slice(1);
  };

  const getSpeciesColor = (species: string) => {
    const colorMap = {
      'equino': 'bg-blue-100 text-blue-800',
      'bovino': 'bg-yellow-100 text-yellow-800',
      'ovino': 'bg-purple-100 text-purple-800',
      'caprino': 'bg-red-100 text-red-800',
      'porcino': 'bg-pink-100 text-pink-800',
      'aviar': 'bg-orange-100 text-orange-800',
      'canino': 'bg-indigo-100 text-indigo-800'
    };
    return colorMap[species as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-4 md:p-6">
          <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
            Total de Animales
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900">{totalAnimals}</div>
        </CardContent>
      </Card>

      {Object.entries(speciesCounts).map(([species, count]) => (
        <Card key={species} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-4 md:p-6">
            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getSpeciesColor(species)}`}>
              {getSpeciesDisplayName(species)}
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{count}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
