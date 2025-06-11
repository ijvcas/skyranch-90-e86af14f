
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Users, MapPin, Activity, Calendar, Plus } from 'lucide-react';
import { useLotStore, type Lot } from '@/stores/lotStore';
import { useAnimalStore } from '@/stores/animalStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import LotForm from './LotForm';
import AnimalAssignmentForm from './AnimalAssignmentForm';

interface LotDetailProps {
  lot: Lot;
  onClose: () => void;
}

const LotDetail = ({ lot, onClose }: LotDetailProps) => {
  const { loadAssignments, assignments, removeAnimal } = useLotStore();
  const { animals, loadAnimals } = useAnimalStore();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);

  useEffect(() => {
    loadAssignments(lot.id);
    loadAnimals();
  }, [lot.id, loadAssignments, loadAnimals]);

  const activeAssignments = assignments.filter(a => !a.removedDate);
  const assignedAnimals = activeAssignments.map(assignment => {
    const animal = animals.find(a => a.id === assignment.animalId);
    return { ...assignment, animal };
  }).filter(item => item.animal);

  const handleRemoveAnimal = async (animalId: string) => {
    const success = await removeAnimal(animalId, lot.id);
    if (success) {
      loadAssignments(lot.id);
    }
  };

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

  return (
    <div className="container mx-auto px-4 py-8 mt-16 md:mt-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{lot.name}</h1>
            {lot.description && (
              <p className="text-gray-600 mt-1">{lot.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={showAssignForm} onOpenChange={setShowAssignForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Asignar Animal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Asignar Animal al Lote</DialogTitle>
              </DialogHeader>
              <AnimalAssignmentForm 
                lotId={lot.id} 
                onClose={() => setShowAssignForm(false)} 
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar Lote</DialogTitle>
              </DialogHeader>
              <LotForm 
                lot={lot} 
                onClose={() => setShowEditForm(false)}
                onSuccess={() => {
                  setShowEditForm(false);
                  // Trigger a reload of lot data if needed
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lot Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Información del Lote
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estado</span>
                <Badge className={getStatusColor(lot.status)}>
                  {lot.status === 'active' ? 'Activo' : 
                   lot.status === 'resting' ? 'Descanso' : 'Mantenimiento'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Condición del Pasto</span>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getGrassConditionColor(lot.grassCondition)}`} />
                  <span className="text-sm capitalize">{lot.grassCondition}</span>
                </div>
              </div>
              
              {lot.sizeHectares && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tamaño</span>
                  <span className="text-sm">{lot.sizeHectares.toFixed(2)} hectáreas</span>
                </div>
              )}
              
              {lot.capacity && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Capacidad</span>
                  <span className="text-sm">{lot.capacity} animales</span>
                </div>
              )}
              
              {lot.grassType && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tipo de Pasto</span>
                  <span className="text-sm">{lot.grassType}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Animales Actuales</span>
                <span className="text-sm">{assignedAnimals.length}</span>
              </div>
              
              {lot.capacity && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Ocupación</span>
                    <span>{Math.round((assignedAnimals.length / lot.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{
                        width: `${Math.min((assignedAnimals.length / lot.capacity) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Estadísticas Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Machos</span>
                <span className="text-sm">
                  {assignedAnimals.filter(a => a.animal?.gender === 'male').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hembras</span>
                <span className="text-sm">
                  {assignedAnimals.filter(a => a.animal?.gender === 'female').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Bovinos</span>
                <span className="text-sm">
                  {assignedAnimals.filter(a => a.animal?.species === 'bovine').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Equinos</span>
                <span className="text-sm">
                  {assignedAnimals.filter(a => a.animal?.species === 'equine').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Animals List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Animales en el Lote ({assignedAnimals.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedAnimals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay animales asignados a este lote</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowAssignForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Asignar Primer Animal
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedAnimals.map((assignment) => (
                    <div 
                      key={assignment.id} 
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{assignment.animal?.name}</h4>
                          <p className="text-sm text-gray-600">Tag: {assignment.animal?.tag}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveAnimal(assignment.animalId)}
                        >
                          Remover
                        </Button>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Especie:</span>
                          <span>{assignment.animal?.species}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Género:</span>
                          <span>{assignment.animal?.gender === 'male' ? 'Macho' : 'Hembra'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Asignado:</span>
                          <span>{new Date(assignment.assignedDate).toLocaleDateString()}</span>
                        </div>
                        {assignment.assignmentReason && (
                          <div className="mt-2">
                            <span className="text-gray-600 text-xs">Motivo: </span>
                            <span className="text-xs">{assignment.assignmentReason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LotDetail;
