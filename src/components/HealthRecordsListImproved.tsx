
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteHealthRecord } from '@/services/healthRecordService';
import { useToast } from '@/hooks/use-toast';
import HealthRecordEditForm from '@/components/HealthRecordEditForm';
import HealthRecordsSearch from '@/components/health-records/HealthRecordsSearch';
import HealthRecordCard from '@/components/health-records/HealthRecordCard';
import HealthRecordsEmptyState from '@/components/health-records/HealthRecordsEmptyState';
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
    return <HealthRecordsEmptyState />;
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
        {filteredRecords.map((record) => (
          <HealthRecordCard
            key={record.id}
            record={record}
            isExpanded={expandedRecords.has(record.id)}
            onToggleExpanded={toggleExpanded}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
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
