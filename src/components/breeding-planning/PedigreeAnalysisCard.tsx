
import React, { useState, useEffect } from 'react';
import { getAllAnimals } from '@/services/animal/animalQueries';
import type { Animal } from '@/stores/animalStore';
import IndividualPedigreeAnalysis from './IndividualPedigreeAnalysis';
import BreedingRecommendationsList from './BreedingRecommendationsList';

const PedigreeAnalysisCard = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    try {
      const animalsData = await getAllAnimals();
      setAnimals(animalsData);
    } catch (error) {
      console.error('Error loading animals:', error);
    }
  };

  return (
    <div className="space-y-6">
      <IndividualPedigreeAnalysis animals={animals} />
      <BreedingRecommendationsList />
    </div>
  );
};

export default PedigreeAnalysisCard;
