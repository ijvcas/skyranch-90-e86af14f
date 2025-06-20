
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface HealthRecordsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  recordTypeFilter: string;
  onRecordTypeChange: (value: string) => void;
  dateRangeFilter: string;
  onDateRangeChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const HealthRecordsSearch: React.FC<HealthRecordsSearchProps> = ({
  searchTerm,
  onSearchChange,
  recordTypeFilter,
  onRecordTypeChange,
  dateRangeFilter,
  onDateRangeChange,
  onClearFilters,
  hasActiveFilters
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por título, medicamento, veterinario..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Record Type Filter */}
          <Select value={recordTypeFilter} onValueChange={onRecordTypeChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Tipo de registro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="vaccination">Vacunación</SelectItem>
              <SelectItem value="treatment">Tratamiento</SelectItem>
              <SelectItem value="checkup">Revisión</SelectItem>
              <SelectItem value="illness">Enfermedad</SelectItem>
              <SelectItem value="injury">Lesión</SelectItem>
              <SelectItem value="medication">Medicamento</SelectItem>
              <SelectItem value="surgery">Cirugía</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <Select value={dateRangeFilter} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Rango de fecha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fechas</SelectItem>
              <SelectItem value="last-30">Últimos 30 días</SelectItem>
              <SelectItem value="last-90">Últimos 3 meses</SelectItem>
              <SelectItem value="last-180">Últimos 6 meses</SelectItem>
              <SelectItem value="last-365">Último año</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="whitespace-nowrap"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthRecordsSearch;
