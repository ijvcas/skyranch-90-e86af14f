
import { useMemo, useState } from 'react';
import type { Animal } from '@/stores/animalStore';

export const useAnimalFiltering = (animals: Animal[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const groupedAnimals = useMemo(() => {
    const filtered = animals.filter(animal => {
      const matchesSearch = 
        animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.tag.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecies = selectedSpecies === 'all' || animal.species === selectedSpecies;
      const matchesStatus = selectedStatus === 'all' || animal.healthStatus === selectedStatus;
      
      return matchesSearch && matchesSpecies && matchesStatus;
    });

    // Group by species
    const grouped = filtered.reduce((acc, animal) => {
      const species = animal.species || 'otros';
      if (!acc[species]) {
        acc[species] = [];
      }
      acc[species].push(animal);
      return acc;
    }, {} as Record<string, typeof animals>);

    // Sort animals within each species by name
    Object.keys(grouped).forEach(species => {
      grouped[species].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, [animals, searchTerm, selectedSpecies, selectedStatus]);

  return {
    searchTerm,
    setSearchTerm,
    selectedSpecies,
    setSelectedSpecies,
    selectedStatus,
    setSelectedStatus,
    groupedAnimals
  };
};
