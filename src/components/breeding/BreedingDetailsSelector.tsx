
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DatePickerField from '@/components/calendar/DatePickerField';

interface BreedingDetailsSelectorProps {
  breedingDate: string;
  breedingMethod: 'natural' | 'artificial_insemination' | 'embryo_transfer';
  status: 'planned' | 'failed' | 'birth_completed' | 'completed' | 'confirmed_pregnant' | 'not_pregnant';
  onDateChange: (field: string, value: string) => void;
  onMethodChange: (value: 'natural' | 'artificial_insemination' | 'embryo_transfer') => void;
  onStatusChange: (value: 'planned' | 'failed' | 'birth_completed' | 'completed' | 'confirmed_pregnant' | 'not_pregnant') => void;
}

const BreedingDetailsSelector: React.FC<BreedingDetailsSelectorProps> = ({
  breedingDate,
  breedingMethod,
  status,
  onDateChange,
  onMethodChange,
  onStatusChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <DatePickerField
          value={breedingDate}
          onChange={(date) => onDateChange('breedingDate', date)}
          label="Fecha de Apareamiento"
          placeholder="Seleccionar fecha"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="breedingMethod">Método de Apareamiento</Label>
        <Select value={breedingMethod} onValueChange={onMethodChange}>
          <SelectTrigger className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[60] bg-white border border-gray-200 shadow-lg">
            <SelectItem value="natural" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">Natural</SelectItem>
            <SelectItem value="artificial_insemination" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">Inseminación Artificial</SelectItem>
            <SelectItem value="embryo_transfer" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">Transferencia de Embriones</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[60] bg-white border border-gray-200 shadow-lg">
            <SelectItem value="planned" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">Planificado</SelectItem>
            <SelectItem value="confirmed_pregnant" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">Embarazo Confirmado</SelectItem>
            <SelectItem value="not_pregnant" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">No Embarazada</SelectItem>
            <SelectItem value="birth_completed" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">Parto Completado</SelectItem>
            <SelectItem value="failed" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">Fallido</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BreedingDetailsSelector;
