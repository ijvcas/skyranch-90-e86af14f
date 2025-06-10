
import React from 'react';
import LotSatelliteMap from './LotSatelliteMap';
import { type Lot } from '@/stores/lotStore';

interface LotMapViewProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const LotMapView = ({ lots, onLotSelect }: LotMapViewProps) => {
  return <LotSatelliteMap lots={lots} onLotSelect={onLotSelect} />;
};

export default LotMapView;
