
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Circle, Trash2 } from 'lucide-react';
import { type Lot } from '@/stores/lotStore';

interface PolygonListProps {
  lots: Lot[];
  lotPolygons: Array<{ lotId: string; polygon: google.maps.Polygon; color: string }>;
  onDeletePolygon: (lotId: string) => void;
}

const PolygonList = ({ lots, lotPolygons, onDeletePolygon }: PolygonListProps) => {
  if (lotPolygons.length === 0) return null;

  return (
    <Card className="absolute bottom-4 right-4 w-64 z-20 shadow-lg max-h-48 overflow-y-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Polígonos ({lotPolygons.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {lotPolygons.map((lp) => {
          const lot = lots.find(l => l.id === lp.lotId);
          return lot ? (
            <div key={lp.lotId} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
              <div className="flex items-center">
                <Circle 
                  className="w-3 h-3 mr-2" 
                  style={{ fill: lp.color }} 
                />
                <span>{lot.name}</span>
              </div>
              <Button
                onClick={() => onDeletePolygon(lp.lotId)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ) : null;
        })}
      </CardContent>
    </Card>
  );
};

export default PolygonList;
