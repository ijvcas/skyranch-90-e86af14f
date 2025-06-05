import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Plus, Calendar, Heart, Baby } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getBreedingRecords, deleteBreedingRecord, BreedingRecord } from '@/services/breedingService';
import { getAllAnimals, Animal } from '@/services/animalService';
import BreedingForm from './BreedingForm';

const BreedingRecordsList: React.FC = () => {
  const [records, setRecords] = useState<BreedingRecord[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<BreedingRecord | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [breedingRecords, allAnimals] = await Promise.all([
        getBreedingRecords(),
        getAllAnimals()
      ]);
      setRecords(breedingRecords);
      setAnimals(allAnimals);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los registros de breeding');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteBreedingRecord(id);
      if (success) {
        toast.success('Registro de breeding eliminado');
        fetchData();
      } else {
        toast.error('Error al eliminar el registro de breeding');
      }
    } catch (error) {
      console.error('Error deleting breeding record:', error);
      toast.error('Error al eliminar el registro de breeding');
    }
  };

  const getAnimalName = (animalId: string) => {
    const animal = animals.find(a => a.id === animalId);
    return animal ? `${animal.name} (${animal.tag})` : 'Animal no encontrado';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planned: { label: 'Planeado', variant: 'secondary' as const },
      completed: { label: 'Completado', variant: 'default' as const },
      confirmed_pregnant: { label: 'Preñez Confirmada', variant: 'default' as const },
      not_pregnant: { label: 'No Preñada', variant: 'destructive' as const },
      birth_completed: { label: 'Parto Completado', variant: 'default' as const },
      failed: { label: 'Fallido', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getMethodLabel = (method: string) => {
    const methods = {
      natural: 'Natural',
      artificial_insemination: 'Inseminación Artificial',
      embryo_transfer: 'Transferencia de Embrión'
    };
    return methods[method as keyof typeof methods] || method;
  };

  if (loading) {
    return <div className="text-center py-4">Cargando registros de breeding...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Registros de Breeding</h2>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedRecord(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Breeding
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedRecord ? 'Editar Registro de Breeding' : 'Nuevo Breeding'}
              </DialogTitle>
            </DialogHeader>
            <BreedingForm
              record={selectedRecord || undefined}
              onSuccess={() => {
                setShowForm(false);
                fetchData();
              }}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No hay registros de breeding aún.</p>
            <p className="text-sm text-gray-400 mt-2">
              Haz clic en "Nuevo Breeding" para empezar a registrar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">
                      {getAnimalName(record.motherId)} × {getAnimalName(record.fatherId)}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(record.breedingDate), 'dd/MM/yyyy', { locale: es })}
                      </div>
                      <div>{getMethodLabel(record.breedingMethod)}</div>
                      {record.offspringCount > 0 && (
                        <div className="flex items-center">
                          <Baby className="w-4 h-4 mr-1" />
                          {record.offspringCount} crías
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(record.status)}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Registro de Breeding</DialogTitle>
                        </DialogHeader>
                        <BreedingForm
                          record={selectedRecord || undefined}
                          onSuccess={() => {
                            setSelectedRecord(null);
                            fetchData();
                          }}
                          onCancel={() => setSelectedRecord(null)}
                        />
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar Registro</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro de que quieres eliminar este registro de breeding? Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(record.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {record.expectedDueDate && (
                    <div>
                      <span className="font-medium">Fecha Esperada de Parto:</span>
                      <br />
                      {format(new Date(record.expectedDueDate), 'dd/MM/yyyy', { locale: es })}
                    </div>
                  )}
                  {record.actualBirthDate && (
                    <div>
                      <span className="font-medium">Fecha Real de Parto:</span>
                      <br />
                      {format(new Date(record.actualBirthDate), 'dd/MM/yyyy', { locale: es })}
                    </div>
                  )}
                  {record.pregnancyConfirmed && (
                    <div>
                      <span className="font-medium">Preñez Confirmada:</span>
                      <br />
                      {record.pregnancyConfirmationDate && 
                        format(new Date(record.pregnancyConfirmationDate), 'dd/MM/yyyy', { locale: es })
                      }
                      {record.pregnancyMethod && ` (${record.pregnancyMethod})`}
                    </div>
                  )}
                  {record.gestationLength && (
                    <div>
                      <span className="font-medium">Duración de Gestación:</span>
                      <br />
                      {record.gestationLength} días
                    </div>
                  )}
                  {record.veterinarian && (
                    <div>
                      <span className="font-medium">Veterinario:</span>
                      <br />
                      {record.veterinarian}
                    </div>
                  )}
                  {record.cost && (
                    <div>
                      <span className="font-medium">Costo:</span>
                      <br />
                      ${record.cost}
                    </div>
                  )}
                </div>
                {record.breedingNotes && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="font-medium">Notas:</span>
                    <p className="text-sm text-gray-600 mt-1">{record.breedingNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BreedingRecordsList;
