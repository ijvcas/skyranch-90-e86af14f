
import React from 'react';
import GoogleMapComponent from './GoogleMapComponent';
import { type Lot } from '@/stores/lotStore';

interface LotMapViewProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const LotMapView = ({ lots, onLotSelect }: LotMapViewProps) => {
  return (
    <div className="w-full">
      <GoogleMapComponent lots={lots} onLotSelect={onLotSelect} />
    </div>
  );
};

export default LotMapView;
