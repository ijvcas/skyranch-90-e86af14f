
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, Calendar, User, DollarSign, Pill, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteHealthRecord } from '@/services/healthRecordService';
import { useToast } from '@/hooks/use-toast';
import HealthRecordEditForm from '@/components/HealthRecordEditForm';
import HealthRecordsSearch from '@/components/health-records/HealthRecordsSearch';
import { useHealthRecordsFilter } from '@/hooks/useHealthRecordsFilter';

interface HealthRecord {
  id: string;
  animalId: string;
  recordType: string;
  title: string;
  description?: string;
  veterinarian?: string;
  medication?: string;
  dosage?: string;
  cost?: number;
  dateAdministered: string;
  nextDueDate?: string;
  notes?: string;
}

interface HealthRecordsListImprovedProps {
  records: HealthRecord[];
  showAnimalName?: boolean;
  showSearch?: boolean;
}

const HealthRecordsListImproved: React.FC<HealthRecordsListImprovedProps> = ({ 
  records, 
  showAnimalName = false,
  showSearch = true
}) => {
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    searchTerm,
    setSearchTerm,
    recordTypeFilter,
    setRecordTypeFilter,
    dateRangeFilter,
    setDateRangeFilter,
    filteredRecords,
    hasActiveFilters,
    clearFilters
  } = useHealthRecordsFilter(records);

  const deleteRecordMutation = useMutation({
    mutationFn: deleteHealthRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records'] });
      queryClient.invalidateQueries({ queryKey: ['all-health-records'] });
      toast({
        title: "Registro eliminado",
        description: "El registro de salud ha sido eliminado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro de salud.",
        variant: "destructive"
      });
    }
  });

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'vaccination':
        return 'bg-blue-100 text-blue-800';
      case 'treatment':
        return 'bg-red-100 text-red-800';
      case 'checkup':
        return 'bg-green-100 text-green-800';
      case 'illness':
        return 'bg-orange-100 text-orange-800';
      case 'injury':
        return 'bg-purple-100 text-purple-800';
      case 'medication':
        return 'bg-yellow-100 text-yellow-800';
      case 'surgery':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecordTypeText = (type: string) => {
    switch (type) {
      case 'vaccination':
        return 'Vacunación';
      case 'treatment':
        return 'Tratamiento';
      case 'checkup':
        return 'Revisión';
      case 'illness':
        return 'Enfermedad';
      case 'injury':
        return 'Lesión';
      case 'medication':
        return 'Medicamento';
      case 'surgery':
        return 'Cirugía';
      default:
        return type;
    }
  };

  const handleEdit = (record: HealthRecord) => {
    setEditingRecord(record);
    setShowEditDialog(true);
  };

  const handleDelete = (record: HealthRecord) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro de salud?')) {
      deleteRecordMutation.mutate(record.id);
    }
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setEditingRecord(null);
  };

  const toggleExpanded = (recordId: string) => {
    const newExpanded = new Set(expandedRecords);
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId);
    } else {
      newExpanded.add(recordId);
    }
    setExpandedRecords(newExpanded);
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros de salud</h3>
        <p className="text-gray-500">No se han registrado eventos de salud para este animal.</p>
      </div>
    );
  }

  return (
    <>
      {/* Search and Filters */}
      {showSearch && (
        <HealthRecordsSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          recordTypeFilter={recordTypeFilter}
          onRecordTypeChange={setRecordTypeFilter}
          dateRangeFilter={dateRangeFilter}
          onDateRangeChange={setDateRangeFilter}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Results Summary */}
      {showSearch && (
        <div className="mb-4 text-sm text-gray-600">
          Mostrando {filteredRecords.length} de {records.length} registros
          {hasActiveFilters && ' (filtrados)'}
        </div>
      )}

      <div className="space-y-4">
        {filteredRecords.map((record) => {
          const isExpanded = expandedRecords.has(record.id);
          
          return (
            <Card key={record.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <Badge className={getRecordTypeColor(record.recordType)}>
                      {getRecordTypeText(record.recordType)}
                    </Badge>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {format(new Date(record.dateAdministered), 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpanded(record.id)}
                      className="h-8 w-8 p-0"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(record)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(record)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <h4 className="font-semibold text-lg text-gray-900 mb-2">{record.title}</h4>
                
                {/* Always show basic description */}
                {record.description && (
                  <p className="text-gray-700 mb-3 leading-relaxed line-clamp-2">
                    {record.description}
                  </p>
                )}

                {/* Expanded view */}
                {isExpanded && (
                  <div className="space-y-3 border-t pt-3 mt-3">
                    {record.description && (
                      <p className="text-gray-700 leading-relaxed">{record.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {record.veterinarian && (
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Veterinario:</span>
                          <span className="font-medium">{record.veterinarian}</span>
                        </div>
                      )}

                      {record.medication && (
                        <div className="flex items-center space-x-2">
                          <Pill className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Medicamento:</span>
                          <span className="font-medium">{record.medication}</span>
                        </div>
                      )}

                      {record.dosage && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">Dosis:</span>
                          <span className="font-medium">{record.dosage}</span>
                        </div>
                      )}

                      {record.cost && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Costo:</span>
                          <span className="font-medium">${record.cost}</span>
                        </div>
                      )}
                    </div>

                    {record.nextDueDate && (
                      <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-orange-700">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Próximo vencimiento: {format(new Date(record.nextDueDate), 'dd/MM/yyyy', { locale: es })}
                          </span>
                        </div>
                      </div>
                    )}

                    {record.notes && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Notas:</strong> {record.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Collapsed view - show key info */}
                {!isExpanded && (
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {record.veterinarian && (
                      <span>Dr. {record.veterinarian}</span>
                    )}
                    {record.medication && (
                      <span>{record.medication}</span>
                    )}
                    {record.cost && (
                      <span>${record.cost}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Registro de Salud</DialogTitle>
          </DialogHeader>
          {editingRecord && (
            <HealthRecordEditForm 
              record={editingRecord}
              onSuccess={handleEditSuccess}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HealthRecordsListImproved;
