
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ParcelStatus, PARCEL_STATUS_LABELS } from '@/utils/cadastral/types';

interface ParcelEditFormProps {
  editValues: {
    status: ParcelStatus;
    lotNumber: string;
  };
  onEditValuesChange: (values: { status: ParcelStatus; lotNumber: string }) => void;
  onStopPropagation: (e: React.MouseEvent) => void;
}

export const ParcelEditForm: React.FC<ParcelEditFormProps> = ({
  editValues,
  onEditValuesChange,
  onStopPropagation
}) => {
  return (
    <>
      <div>
        <label className="text-xs text-gray-500 uppercase tracking-wide block">Número</label>
        <Input
          value={editValues.lotNumber}
          onChange={(e) => onEditValuesChange({
            ...editValues,
            lotNumber: e.target.value
          })}
          onClick={onStopPropagation}
          className="mt-1 h-6 text-xs"
          placeholder="7, 15, 41..."
        />
      </div>

      <div className="col-span-2">
        <label className="text-xs text-gray-500 uppercase tracking-wide block">Estado</label>
        <div className="mt-1">
          <Select
            value={editValues.status}
            onValueChange={(value: ParcelStatus) => onEditValuesChange({
              ...editValues,
              status: value
            })}
          >
            <SelectTrigger 
              className="w-full h-6 text-xs"
              onClick={onStopPropagation}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PARCEL_STATUS_LABELS).map(([status, label]) => (
                <SelectItem key={status} value={status}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};
