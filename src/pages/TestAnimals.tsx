import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllAnimals } from '@/services/animal/animalQueries';
import { mockAnimals } from '@/data/mockAnimals';
import { networkDiagnostics } from '@/utils/networkDiagnostics';

const TestAnimals = () => {
  const { data: animals = [], isLoading, error } = useQuery({
    queryKey: ['animals', 'test'],
    queryFn: async () => {
      const { network, supabase } = await networkDiagnostics.runDiagnostics();
      
      if (!network || !supabase) {
        console.warn('Using mock data due to network issues');
        return mockAnimals;
      }
      
      try {
        const result = await getAllAnimals();
        return result;
      } catch (error) {
        console.error('Failed to load animals, using mock data:', error);
        return mockAnimals;
      }
    },
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Testing Animals - Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Testing Animals Data</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error.message}
        </div>
      )}
      
      <div className="mb-4">
        <p className="text-gray-600">Total animals found: {animals.length}</p>
      </div>
      
      <div className="grid gap-4">
        {animals.map((animal) => (
          <div key={animal.id} className="border rounded-lg p-4">
            <h3 className="font-semibold">{animal.name}</h3>
            <p className="text-gray-600">{animal.species} - {animal.tag}</p>
            <p className="text-sm text-gray-500">
              {animal.breed} | {animal.gender} | {animal.color}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <a href="/animals" className="text-blue-600 hover:underline">
          Go to full Animals page (requires login)
        </a>
      </div>
    </div>
  );
};

export default TestAnimals;