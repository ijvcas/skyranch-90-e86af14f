
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Activity, BarChart3 } from 'lucide-react';
import { type Lot } from '@/stores/lotStore';

interface PolygonData {
  lotId: string;
  areaHectares?: number;
}

interface LotStatisticsProps {
  lots: Lot[];
  polygonData?: PolygonData[];
}

const LotStatistics = ({ lots, polygonData = [] }: LotStatisticsProps) => {
  // Console log for debugging mobile deployment
  console.log('LotStatistics component loaded - Mobile deployment check:', new Date().toISOString());
  console.log('Build version: v2.0 - Fixed mobile issues');
  
  const totalAnimals = lots.reduce((sum, lot) => sum + (lot.currentAnimals || 0), 0);
  const totalCapacity = lots.reduce((sum, lot) => sum + (lot.capacity || 0), 0);
  const activeLots = lots.filter(l => l.status === 'active').length;
  const totalCalculatedArea = polygonData.reduce((sum, p) => sum + (p.areaHectares || 0), 0);

  const formatArea = (areaHectares: number): string => {
    if (areaHectares < 0.01) {
      return `${(areaHectares * 10000).toFixed(0)} m²`;
    }
    // Fixed: Always use 2 decimals for consistency
    return `${areaHectares.toFixed(2)} ha`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Lotes</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lots.length}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lotes Activos</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeLots}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Animales Asignados</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAnimals}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {totalCalculatedArea > 0 ? 'Área Calculada' : 'Capacidad Total'}
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalCalculatedArea > 0 ? formatArea(totalCalculatedArea) : totalCapacity}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LotStatistics;
