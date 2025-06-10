
import { useState } from 'react';
import { mapStorage, type LotPolygon } from '../utils/mapStorage';

export const usePolygonStorage = () => {
  const [lotPolygons, setLotPolygons] = useState<LotPolygon[]>(() => mapStorage.getPolygons());

  const savePolygons = (polygons: LotPolygon[]) => {
    console.log('💾 Saving polygons to localStorage:', polygons.length);
    mapStorage.savePolygons(polygons);
    setLotPolygons(polygons);
  };

  const updatePolygonForLot = (lotId: string, updates: Partial<LotPolygon>) => {
    const newPolygons = lotPolygons.map(p => 
      p.lotId === lotId ? { ...p, ...updates } : p
    );
    savePolygons(newPolygons);
  };

  const deletePolygonForLot = (lotId: string) => {
    const newPolygons = lotPolygons.filter(p => p.lotId !== lotId);
    savePolygons(newPolygons);
  };

  const addPolygonForLot = (lotPolygon: LotPolygon) => {
    const newPolygons = lotPolygons.filter(p => p.lotId !== lotPolygon.lotId);
    newPolygons.push(lotPolygon);
    savePolygons(newPolygons);
  };

  return {
    lotPolygons,
    savePolygons,
    updatePolygonForLot,
    deletePolygonForLot,
    addPolygonForLot
  };
};
