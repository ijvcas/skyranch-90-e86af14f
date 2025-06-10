
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const MapLoadingState = () => {
  return (
    <div className="w-full h-full">
      <Skeleton className="w-full h-full rounded-lg" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando mapa satelital...</div>
      </div>
    </div>
  );
};
