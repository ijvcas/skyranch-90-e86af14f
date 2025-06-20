
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateHealthRecord } from '@/services/healthRecordService';
import { useToast } from '@/hooks/use-toast';
import BasicInfoSection from '@/components/health-records/BasicInfoSection';
import MedicalDetailsSection from '@/components/health-records/MedicalDetailsSection';
import FormActions from '@/components/health-records/FormActions';

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

interface HealthRecordEditFormProps {
  record: HealthRecord;
  onSuccess: () => void;
  onCancel: () => void;
}

const HealthRecordEditForm: React.FC<HealthRecordEditFormProps> = ({
  record,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    recordType: record.recordType,
    title: record.title,
    description: record.description || '',
    veterinarian: record.veterinarian || '',
    medication: record.medication || '',
    dosage: record.dosage || '',
    cost: record.cost?.toString() || '',
    dateAdministered: record.dateAdministered,
    nextDueDate: record.nextDueDate || '',
    notes: record.notes || ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateHealthRecord(record.id, {
      recordType: data.recordType as any,
      title: data.title,
      description: data.description || undefined,
      veterinarian: data.veterinarian || undefined,
      medication: data.medication || undefined,
      dosage: data.dosage || undefined,
      cost: data.cost ? parseFloat(data.cost) : undefined,
      dateAdministered: data.dateAdministered,
      nextDueDate: data.nextDueDate || undefined,
      notes: data.notes || undefined
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records'] });
      queryClient.invalidateQueries({ queryKey: ['all-health-records'] });
      toast({
        title: "Registro actualizado",
        description: "El registro de salud ha sido actualizado exitosamente.",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el registro de salud.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.recordType || !formData.dateAdministered) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInfoSection
        formData={formData}
        onInputChange={handleInputChange}
      />

      <MedicalDetailsSection
        formData={formData}
        onInputChange={handleInputChange}
      />

      <FormActions
        onCancel={onCancel}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </form>
  );
};

export default HealthRecordEditForm;
