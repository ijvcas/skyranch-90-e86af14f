
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Activity, Calendar, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getHealthRecords } from '@/services/healthRecordService';
import HealthRecordForm from '@/components/HealthRecordForm';
import HealthRecordsListImproved from '@/components/HealthRecordsListImproved';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AnimalHealthRecordsProps {
  animalId: string;
  animalName: string;
}

const AnimalHealthRecords: React.FC<AnimalHealthRecordsProps> = ({ animalId, animalName }) => {
  const [showForm, setShowForm] = useState(false);

  const { data: healthRecords = [], isLoading } = useQuery({
    queryKey: ['health-records', animalId],
    queryFn: () => getHealthRecords(animalId)
  });

  const handleFormSuccess = () => {
    setShowForm(false);
  };

  // Get recent records (last 30 days)
  const recentRecords = healthRecords.filter(record => {
    const recordDate = new Date(record.dateAdministered);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return recordDate >= thirtyDaysAgo;
  });

  // Get upcoming vaccinations/treatments
  const upcomingRecords = healthRecords.filter(record => {
    if (!record.nextDueDate) return false;
    const dueDate = new Date(record.nextDueDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return dueDate <= thirtyDaysFromNow && dueDate >= new Date();
  });

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-500" />
              <span>Registros de Salud</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-500" />
            <span>Registros de Salud</span>
          </span>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nuevo Registro de Salud - {animalName}</DialogTitle>
              </DialogHeader>
              <HealthRecordForm 
                onSuccess={handleFormSuccess} 
                preSelectedAnimalId={animalId}
              />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total Registros</span>
            </div>
            <div className="text-xl font-bold text-blue-900">{healthRecords.length}</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Recientes</span>
            </div>
            <div className="text-xl font-bold text-green-900">{recentRecords.length}</div>
            <div className="text-xs text-green-700">Últimos 30 días</div>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Próximos</span>
            </div>
            <div className="text-xl font-bold text-orange-900">{upcomingRecords.length}</div>
            <div className="text-xs text-orange-700">Próximos 30 días</div>
          </div>
        </div>

        {/* Upcoming Records Alert */}
        {upcomingRecords.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">Próximos Vencimientos</h4>
            <div className="space-y-1">
              {upcomingRecords.slice(0, 3).map(record => (
                <div key={record.id} className="text-sm text-orange-700">
                  {record.title} - {format(new Date(record.nextDueDate!), 'dd/MM/yyyy', { locale: es })}
                </div>
              ))}
              {upcomingRecords.length > 3 && (
                <div className="text-sm text-orange-600">
                  +{upcomingRecords.length - 3} más...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Health Records List */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Historial de Eventos de Salud
          </h4>
          <HealthRecordsListImproved 
            records={healthRecords} 
            showSearch={false}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AnimalHealthRecords;
