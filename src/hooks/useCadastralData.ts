
import { useState, useEffect } from 'react';
import { getCadastralParcels } from '@/services/cadastralService';

export const useCadastralData = () => {
  const [propiedadParcelsCount, setPropiedadParcelsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadCadastralData = async () => {
    try {
      setIsLoading(true);
      const parcels = await getCadastralParcels();
      const propiedadCount = parcels.filter(p => p.status === 'PROPIEDAD').length;
      setPropiedadParcelsCount(propiedadCount);
    } catch (error) {
      console.error('Error loading cadastral data:', error);
      setPropiedadParcelsCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCadastralData();
  }, []);

  return {
    propiedadParcelsCount,
    isLoading,
    refresh: loadCadastralData
  };
};
