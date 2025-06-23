
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fieldReportService, CreateFieldReportData } from '@/services/fieldReportService';
import { toast } from 'sonner';

export const useFieldReports = () => {
  return useQuery({
    queryKey: ['field-reports'],
    queryFn: fieldReportService.getFieldReports,
  });
};

export const useFieldReport = (reportId: string) => {
  return useQuery({
    queryKey: ['field-report', reportId],
    queryFn: () => fieldReportService.getFieldReportWithEntries(reportId),
    enabled: !!reportId,
  });
};

export const useCreateFieldReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFieldReportData) => fieldReportService.createFieldReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-reports'] });
      toast.success('Reporte de campo creado exitosamente');
    },
    onError: (error) => {
      console.error('Error creating field report:', error);
      toast.error('Error al crear el reporte de campo');
    },
  });
};

export const useUpdateFieldReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: string }) =>
      fieldReportService.updateFieldReportStatus(reportId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-reports'] });
      toast.success('Estado del reporte actualizado');
    },
    onError: (error) => {
      console.error('Error updating field report status:', error);
      toast.error('Error al actualizar el estado del reporte');
    },
  });
};
