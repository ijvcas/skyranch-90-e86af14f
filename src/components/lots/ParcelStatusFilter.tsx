
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ParcelStatus, PARCEL_STATUS_LABELS } from '@/utils/cadastral/types';

interface ParcelStatusFilterProps {
  selectedStatus: ParcelStatus | 'ALL';
  onStatusChange: (status: ParcelStatus | 'ALL') => void;
}

const ParcelStatusFilter: React.FC<ParcelStatusFilterProps> = ({
  selectedStatus,
  onStatusChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Estado
      </label>
      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos</SelectItem>
          {Object.entries(PARCEL_STATUS_LABELS).map(([status, label]) => (
            <SelectItem key={status} value={status}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ParcelStatusFilter;
