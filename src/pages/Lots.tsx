
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar } from 'lucide-react';
import { useLotStore } from '@/stores/lotStore';
import LotForm from '@/components/lots/LotForm';
import LotDetail from '@/components/lots/LotDetail';
import LotMapView from '@/components/lots/LotMapView';
import LotAnalytics from '@/components/lots/LotAnalytics';
import LotsOverview from '@/components/lots/LotsOverview';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const Lots = () => {
  const { lots, isLoading, loadLots, deleteLot } = useLotStore();
  const [showLotForm, setShowLotForm] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [polygonData, setPolygonData] = useState<Array<{lotId: string; areaHectares?: number}>>([]);

  useEffect(() => {
    loadLots();
    // Load polygon data from localStorage
    const saved = localStorage.getItem('lotPolygons');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPolygonData(data.map((item: any) => ({
          lotId: item.lotId,
          areaHectares: item.areaHectares
        })));
      } catch (error) {
        console.error('Error loading polygon data:', error);
      }
    }
  }, [loadLots]);

  const handleDeleteLot = async (lotId: string) => {
    try {
      const success = await deleteLot(lotId);
      if (success) {
        toast.success('Lote eliminado correctamente');
        // Remove polygon data for this lot
        const saved = localStorage.getItem('lotPolygons');
        if (saved) {
          try {
            const data = JSON.parse(saved);
            const filteredData = data.filter((item: any) => item.lotId !== lotId);
            localStorage.setItem('lotPolygons', JSON.stringify(filteredData));
            setPolygonData(filteredData.map((item: any) => ({
              lotId: item.lotId,
              areaHectares: item.areaHectares
            })));
          } catch (error) {
            console.error('Error updating polygon data:', error);
          }
        }
      } else {
        toast.error('Error al eliminar el lote');
      }
    } catch (error) {
      console.error('Error deleting lot:', error);
      toast.error('Error al eliminar el lote');
    }
  };

  if (selectedLotId) {
    const selectedLot = lots.find(l => l.id === selectedLotId);
    if (selectedLot) {
      return (
        <LotDetail 
          lot={selectedLot} 
          onBack={() => setSelectedLotId(null)} 
        />
      );
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16 md:mt-16">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Lotes</h1>
          <p className="text-gray-600 mt-2">Administra los lotes donde pastan tus animales</p>
        </div>
        
        <Dialog open={showLotForm} onOpenChange={setShowLotForm}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <PlusCircle className="w-4 h-4 mr-2" />
              Nuevo Lote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Lote</DialogTitle>
            </DialogHeader>
            <LotForm onClose={() => setShowLotForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="map">Mapa</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
          <TabsTrigger value="rotations">Rotaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <LotsOverview
            lots={lots}
            isLoading={isLoading}
            onLotSelect={setSelectedLotId}
            onCreateLot={() => setShowLotForm(true)}
            onDeleteLot={handleDeleteLot}
            polygonData={polygonData}
          />
        </TabsContent>

        <TabsContent value="map">
          <LotMapView lots={lots} onLotSelect={setSelectedLotId} />
        </TabsContent>

        <TabsContent value="analytics">
          <LotAnalytics lots={lots} />
        </TabsContent>

        <TabsContent value="rotations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Gestión de Rotaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Funcionalidad de rotaciones próximamente</p>
                <p className="text-sm mt-2">
                  Podrás planificar y gestionar las rotaciones de animales entre lotes
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Lots;
