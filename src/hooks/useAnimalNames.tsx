
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllAnimals } from '@/services/animalService';

export const useAnimalNames = () => {
  const { data: allAnimals = [] } = useQuery({
    queryKey: ['animals', 'all-users'],
    queryFn: getAllAnimals,
  });

  // Create a simple map of registered animal IDs to their display names
  const animalNamesMap = React.useMemo(() => {
    const nameMap: Record<string, string> = {};
    allAnimals.forEach(animal => {
      nameMap[animal.id] = `${animal.name} (${animal.tag})`;
    });
    return nameMap;
  }, [allAnimals]);

  // Simple function to get display name - if it's a UUID and registered, show the name, otherwise show as-is
  const getDisplayName = (parentId: string | undefined): string | null => {
    if (!parentId) return null;
    
    // Check if it's a registered animal
    if (animalNamesMap[parentId]) {
      return animalNamesMap[parentId];
    }
    
    // Otherwise, it's a text name, return as-is
    return parentId;
  };

  return {
    getDisplayName,
    animalNamesMap
  };
};
