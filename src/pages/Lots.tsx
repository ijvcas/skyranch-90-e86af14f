
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MapPin, Users, Activity, BarChart3, Calendar } from 'lucide-react';
import { useLotStore } from '@/stores/lotStore';
import LotForm from '@/components/lots/LotForm';
import LotDetail from '@/components/lots/LotDetail';
import LotMapView from '@/components/lots/LotMapView';
import LotAnalytics from '@/components/lots/LotAnalytics';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Lots = () => {
  const { lots, isLoading, loadLots } = useLotStore();
  const [showLotForm, setShowLotForm] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);

  useEffect(() => {
    loadLots();
  }, [loadLots]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'resting': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGrassConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-green-400';
      case 'fair': return 'bg-yellow-400';
      case 'poor': return 'bg-red-400';
      default: return 'bg-gray-400';
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

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
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
                <div className="text-2xl font-bold">
                  {lots.filter(l => l.status === 'active').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Animales Asignados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lots.reduce((sum, lot) => sum + (lot.currentAnimals || 0), 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {lots.reduce((sum, lot) => sum + (lot.capacity || 0), 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="text-gray-500">Cargando lotes...</div>
              </div>
            ) : lots.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="text-gray-500 mb-4">No hay lotes registrados</div>
                <Button onClick={() => setShowLotForm(true)}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Crear Primer Lote
                </Button>
              </div>
            ) : (
              lots.map((lot) => (
                <Card 
                  key={lot.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedLotId(lot.id)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{lot.name}</CardTitle>
                        {lot.description && (
                          <p className="text-sm text-gray-600 mt-1">{lot.description}</p>
                        )}
                      </div>
                      <Badge className={getStatusColor(lot.status)}>
                        {lot.status === 'active' ? 'Activo' : 
                         lot.status === 'resting' ? 'Descanso' : 'Mantenimiento'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {/* Grass Condition */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Condición del Pasto</span>
                        <div className="flex items-center">
                          <div 
                            className={`w-3 h-3 rounded-full mr-2 ${getGrassConditionColor(lot.grassCondition)}`}
                          />
                          <span className="text-sm capitalize">{lot.grassCondition}</span>
                        </div>
                      </div>
                      
                      {/* Capacity */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Ocupación</span>
                        <span className="text-sm">
                          {lot.currentAnimals || 0} / {lot.capacity || 0}
                        </span>
                      </div>
                      
                      {/* Size */}
                      {lot.sizeHectares && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Tamaño</span>
                          <span className="text-sm">{lot.sizeHectares} ha</span>
                        </div>
                      )}
                      
                      {/* Progress Bar */}
                      {lot.capacity && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{
                                width: `${Math.min(((lot.currentAnimals || 0) / lot.capacity) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
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
