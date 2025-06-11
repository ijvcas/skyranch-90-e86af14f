
import React, { useEffect, useState } from 'react';
import { useLotStore, type Lot } from '@/stores/lotStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LotDetail from '@/components/lots/LotDetail';
import LotForm from '@/components/lots/LotForm';
import LotMapView from '@/components/lots/LotMapView';
import LotsOverview from '@/components/lots/LotsOverview';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getPolygonDataForLots, syncAllLotAreasWithPolygons } from '@/services/lotPolygonService';

const Lots = () => {
  const { lots, loadLots, deleteLot, isLoading, setSelectedLot } = useLotStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [polygonData, setPolygonData] = useState<Array<{lotId: string; areaHectares?: number}>>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lotToDelete, setLotToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load lots and polygon data
  useEffect(() => {
    loadLots();
    loadPolygonData();
    
    // Sync polygon areas with lot sizes to ensure consistency
    syncAllLotAreasWithPolygons().then(success => {
      if (success) {
        console.log('Successfully synchronized all lot areas with polygons');
      }
    });
  }, [loadLots]);

  const loadPolygonData = async () => {
    try {
      const data = await getPolygonDataForLots();
      setPolygonData(data);
    } catch (error) {
      console.error('Error loading polygon data:', error);
    }
  };

  const handleLotSelect = (lotId: string) => {
    const lot = lots.find(l => l.id === lotId);
    if (lot) {
      setSelectedLotId(lotId);
      setActiveTab('detail');
      setSelectedLot(lot);
    }
  };

  const handleCreateLot = () => {
    setShowCreateForm(true);
  };

  const handleDeleteLot = (lotId: string) => {
    setLotToDelete(lotId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteLot = async () => {
    if (lotToDelete) {
      const success = await deleteLot(lotToDelete);
      if (success) {
        toast.success('Lote eliminado correctamente');
        setShowDeleteDialog(false);
        setLotToDelete(null);
        
        // If we were viewing the deleted lot, go back to overview
        if (selectedLotId === lotToDelete) {
          setSelectedLotId(null);
          setActiveTab('overview');
        }
      } else {
        toast.error('Error al eliminar el lote');
      }
    }
  };

  const handleFormSubmit = () => {
    setShowCreateForm(false);
    loadLots();
    toast.success('Lote creado correctamente');
  };

  // Reload polygon data when active tab changes to overview or map
  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'map') {
      loadPolygonData();
    }
  }, [activeTab]);

  // Get the selected lot object
  const selectedLot = selectedLotId ? lots.find(l => l.id === selectedLotId) : null;

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Lotes</h1>
          <p className="text-gray-500">Administra los lotes de tu finca</p>
        </div>
        <Button onClick={handleCreateLot} className="mt-4 md:mt-0">
          Crear Lote
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="map">Mapa</TabsTrigger>
          {selectedLotId && <TabsTrigger value="detail">Detalle</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="overview">
          <LotsOverview 
            lots={lots}
            isLoading={isLoading}
            onLotSelect={handleLotSelect}
            onCreateLot={handleCreateLot}
            onDeleteLot={handleDeleteLot}
            polygonData={polygonData}
          />
        </TabsContent>
        
        <TabsContent value="map">
          <LotMapView 
            lots={lots}
            onLotSelect={handleLotSelect}
          />
        </TabsContent>
        
        <TabsContent value="detail">
          {selectedLot && (
            <LotDetail 
              lot={selectedLot}
              onClose={() => {
                setActiveTab('overview');
                setSelectedLotId(null);
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Create Lot Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Lote</DialogTitle>
          </DialogHeader>
          <LotForm 
            onClose={() => setShowCreateForm(false)}
            onSuccess={handleFormSubmit} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Advertencia</AlertTitle>
            <AlertDescription>
              ¿Estás seguro de que deseas eliminar este lote? Esta acción no se puede deshacer.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteLot}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Lots;
