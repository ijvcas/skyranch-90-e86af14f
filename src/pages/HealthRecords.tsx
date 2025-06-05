
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Activity } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAnimal } from '@/services/animalService';
import { getHealthRecords, deleteHealthRecord } from '@/services/healthRecordService';
import HealthRecordForm from '@/components/HealthRecordForm';
import HealthRecordsList from '@/components/HealthRecordsList';
import { useToast } from '@/hooks/use-toast';

const HealthRecords = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: animal, isLoading: animalLoading } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => getAnimal(id!),
    enabled: !!id
  });

  const { data: healthRecords = [], isLoading: recordsLoading, refetch } = useQuery({
    queryKey: ['healthRecords', id],
    queryFn: () => getHealthRecords(id!),
    enabled: !!id
  });

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro de salud?')) {
      return;
    }

    try {
      const success = await deleteHealthRecord(recordId);
      if (success) {
        toast({
          title: "Éxito",
          description: "Registro de salud eliminado correctamente"
        });
        refetch();
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el registro de salud",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting health record:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el registro",
        variant: "destructive"
      });
    }
  };

  if (!id) {
    return null;
  }

  if (animalLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-5">
          <img 
            src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-lg text-gray-600 relative z-10">Cargando información...</div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-5">
          <img 
            src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center relative z-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Animal no encontrado</h2>
          <Button onClick={() => navigate('/animals')}>
            Volver a Animales
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden p-4">
      <div className="absolute inset-0 opacity-5">
        <img 
          src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/animals/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a {animal.name}
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Activity className="w-8 h-8 mr-3 text-green-600" />
                Registros de Salud
              </h1>
              <p className="text-gray-600">
                Historial médico y veterinario de <span className="font-medium">{animal.name}</span> (#{animal.tag})
              </p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white mt-4 md:mt-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Registro
            </Button>
          </div>
        </div>

        {/* Content */}
        {showForm ? (
          <HealthRecordForm
            animalId={id}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              refetch();
              setShowForm(false);
            }}
          />
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Registros</p>
                      <p className="text-2xl font-bold text-gray-900">{healthRecords.length}</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Vacunaciones</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {healthRecords.filter(r => r.recordType === 'vaccination').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tratamientos</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {healthRecords.filter(r => r.recordType === 'treatment').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Revisiones</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {healthRecords.filter(r => r.recordType === 'checkup').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Records List */}
            <Card>
              <CardHeader>
                <CardTitle>Historial Médico</CardTitle>
              </CardHeader>
              <CardContent>
                {recordsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-600">Cargando registros...</div>
                  </div>
                ) : (
                  <HealthRecordsList
                    records={healthRecords}
                    onDelete={handleDeleteRecord}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthRecords;
