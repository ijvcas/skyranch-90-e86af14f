
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, DollarSign, Edit, Trash2, User, Baby, Heart, Clock, ArrowLeft } from 'lucide-react';
import { BreedingRecord } from '@/services/breedingService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { calculateActualGestationDuration } from '@/services/gestationService';
import BreedingEditForm from '@/components/BreedingEditForm';

interface BreedingDetailProps {
  record: BreedingRecord;
  animalNames: Record<string, string>;
  onEdit?: (record: BreedingRecord) => void;
  onDelete?: (id: string) => void;
  onBack: () => void;
}

const BreedingDetail: React.FC<BreedingDetailProps> = ({ 
  record, 
  animalNames, 
  onEdit, 
  onDelete,
  onBack
}) => {
  const [showEditForm, setShowEditForm] = useState(false);

  const getStatusLabel = (status: BreedingRecord['status']) => {
    const labels = {
      planned: 'Planeado',
      completed: 'Completado',
      confirmed_pregnant: 'Embarazo Confirmado',
      not_pregnant: 'No Embarazada',
      birth_completed: 'Parto Completado',
      failed: 'Fallido'
    };
    return labels[status];
  };

  const getStatusColor = (status: BreedingRecord['status']) => {
    const colors = {
      planned: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      confirmed_pregnant: 'bg-purple-100 text-purple-800',
      not_pregnant: 'bg-gray-100 text-gray-800',
      birth_completed: 'bg-emerald-100 text-emerald-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getMethodLabel = (method: BreedingRecord['breedingMethod']) => {
    const labels = {
      natural: 'Natural',
      artificial_insemination: 'Inseminación Artificial',
      embryo_transfer: 'Transferencia de Embriones'
    };
    return labels[method];
  };

  const gestationDuration = record.breedingDate && record.actualBirthDate 
    ? calculateActualGestationDuration(record.breedingDate, record.actualBirthDate)
    : null;

  const handleEditFormSuccess = () => {
    setShowEditForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with back button and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {animalNames[record.motherId] || 'Madre'} × {animalNames[record.fatherId] || 'Padre'}
            </h2>
            <p className="text-gray-500">
              Registro de apareamiento - {format(new Date(record.breedingDate), 'dd/MM/yyyy', { locale: es })}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <Button onClick={() => setShowEditForm(true)} className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Editar</span>
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="destructive" 
              onClick={() => onDelete(record.id)}
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-4">
        <Badge className={getStatusColor(record.status)} className="text-base px-3 py-1">
          {getStatusLabel(record.status)}
        </Badge>
        <div className="flex items-center text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          <span>Fecha de apareamiento: {format(new Date(record.breedingDate), 'dd/MM/yyyy', { locale: es })}</span>
        </div>
      </div>

      {/* Main information cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span>Información Básica</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Madre</label>
                <p className="font-medium">{animalNames[record.motherId] || 'Desconocida'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Padre</label>
                <p className="font-medium">{animalNames[record.fatherId] || 'Desconocido'}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Método de Apareamiento</label>
              <p className="font-medium">{getMethodLabel(record.breedingMethod)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Pregnancy Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Baby className="w-5 h-5" />
              <span>Información del Embarazo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Embarazo Confirmado</label>
              <p className="font-medium">{record.pregnancyConfirmed ? 'Sí' : 'No'}</p>
            </div>
            {record.pregnancyConfirmed && record.pregnancyConfirmationDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Confirmación</label>
                <p className="font-medium">
                  {format(new Date(record.pregnancyConfirmationDate), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>
            )}
            {record.offspringCount > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">Número de Crías</label>
                <p className="font-medium text-blue-600">{record.offspringCount}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Date Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Fechas Importantes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {record.expectedDueDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha Esperada de Parto</label>
                <p className="font-medium text-blue-600">
                  {format(new Date(record.expectedDueDate), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>
            )}
            {record.actualBirthDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha Real de Parto</label>
                <p className="font-medium text-purple-600">
                  {format(new Date(record.actualBirthDate), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>
            )}
            {gestationDuration && (
              <div>
                <label className="text-sm font-medium text-gray-500">Duración de Gestación</label>
                <p className="font-medium text-green-600">{gestationDuration} días</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Información Adicional</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {record.veterinarian && (
              <div>
                <label className="text-sm font-medium text-gray-500">Veterinario</label>
                <p className="font-medium">{record.veterinarian}</p>
              </div>
            )}
            {record.cost && (
              <div>
                <label className="text-sm font-medium text-gray-500">Costo</label>
                <p className="font-medium">${record.cost}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes section */}
      {record.breedingNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{record.breedingNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Registro de Apareamiento</DialogTitle>
          </DialogHeader>
          <BreedingEditForm 
            record={record}
            onSuccess={handleEditFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BreedingDetail;
