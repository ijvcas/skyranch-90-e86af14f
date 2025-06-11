
import React from 'react';
import SimpleGoogleMap from './SimpleGoogleMap';
import { type Lot } from '@/stores/lotStore';

interface LotMapViewProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const LotMapView = ({ lots, onLotSelect }: LotMapViewProps) => {
  return (
    <div className="w-full">
      <SimpleGoogleMap lots={lots} onLotSelect={onLotSelect} />
    </div>
  );
};

export default LotMapView;
