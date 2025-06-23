
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, DollarSign, FileText } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { CadastralParcel } from '@/services/cadastralService';
import { ParcelStatus, PARCEL_STATUS_LABELS } from '@/utils/cadastral/types';

interface ParcelAcquisitionFormProps {
  parcel: CadastralParcel;
  onSave: (parcelId: string, updates: Partial<CadastralParcel>) => void;
  onCancel: () => void;
}

const ParcelAcquisitionForm: React.FC<ParcelAcquisitionFormProps> = ({
  parcel,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    status: (parcel.status as ParcelStatus) || 'SHOPPING_LIST',
    lotNumber: parcel.lotNumber || '',
    totalCost: parcel.totalCost?.toString() || '',
    costPerSquareMeter: parcel.costPerSquareMeter?.toString() || '',
    sellerName: parcel.sellerName || '',
    acquisitionDate: parcel.acquisitionDate ? new Date(parcel.acquisitionDate) : undefined,
    acquisitionNotes: parcel.acquisitionNotes || '',
    contractReference: parcel.contractReference || '',
    notes: parcel.notes || ''
  });

  const [showCalendar, setShowCalendar] = useState(false);

  const calculateCostPerSquareMeter = (totalCost: string) => {
    if (!totalCost || !parcel.areaHectares) return '';
    const cost = parseFloat(totalCost);
    const areaSquareMeters = parcel.areaHectares * 10000; // Convert hectares to square meters
    return (cost / areaSquareMeters).toFixed(2);
  };

  const calculateTotalCost = (costPerSqm: string) => {
    if (!costPerSqm || !parcel.areaHectares) return '';
    const cost = parseFloat(costPerSqm);
    const areaSquareMeters = parcel.areaHectares * 10000;
    return (cost * areaSquareMeters).toFixed(2);
  };

  const handleTotalCostChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      totalCost: value,
      costPerSquareMeter: calculateCostPerSquareMeter(value)
    }));
  };

  const handleCostPerSqmChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      costPerSquareMeter: value,
      totalCost: calculateTotalCost(value)
    }));
  };

  const handleSave = () => {
    const updates: Partial<CadastralParcel> = {
      status: formData.status,
      lotNumber: formData.lotNumber,
      totalCost: formData.totalCost ? parseFloat(formData.totalCost) : undefined,
      costPerSquareMeter: formData.costPerSquareMeter ? parseFloat(formData.costPerSquareMeter) : undefined,
      sellerName: formData.sellerName,
      acquisitionDate: formData.acquisitionDate?.toISOString().split('T')[0],
      acquisitionNotes: formData.acquisitionNotes,
      contractReference: formData.contractReference,
      notes: formData.notes
    };

    onSave(parcel.id, updates);
  };

  const isPropiedad = formData.status === 'PROPIEDAD';

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Información Detallada de Parcela - {parcel.parcelId}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value: ParcelStatus) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
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

          <div>
            <Label htmlFor="lotNumber">Número de Lote</Label>
            <Input
              id="lotNumber"
              value={formData.lotNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, lotNumber: e.target.value }))}
              placeholder="7, 15, 41..."
            />
          </div>
        </div>

        {/* Area Information */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Información del Área</h3>
          <p className="text-sm text-gray-600">
            Área: {parcel.areaHectares ? `${parcel.areaHectares.toFixed(4)} hectáreas (${(parcel.areaHectares * 10000).toFixed(0)} m²)` : 'Sin calcular'}
          </p>
        </div>

        {/* Financial Information - Show for all but emphasize for PROPIEDAD */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-gray-900">Información Financiera</h3>
            {!isPropiedad && (
              <span className="text-xs text-gray-500">(Opcional para planificación)</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalCost">Costo Total</Label>
              <Input
                id="totalCost"
                type="number"
                value={formData.totalCost}
                onChange={(e) => handleTotalCostChange(e.target.value)}
                placeholder="0.00"
                className={isPropiedad ? 'border-green-300' : ''}
              />
            </div>

            <div>
              <Label htmlFor="costPerSqm">Costo por m²</Label>
              <Input
                id="costPerSqm"
                type="number"
                value={formData.costPerSquareMeter}
                onChange={(e) => handleCostPerSqmChange(e.target.value)}
                placeholder="0.00"
                className={isPropiedad ? 'border-green-300' : ''}
              />
            </div>
          </div>
        </div>

        {/* Acquisition Details - Show for PROPIEDAD status */}
        {isPropiedad && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium text-gray-900">Detalles de Adquisición</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sellerName">Nombre del Vendedor</Label>
                <Input
                  id="sellerName"
                  value={formData.sellerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, sellerName: e.target.value }))}
                  placeholder="Nombre completo del vendedor"
                />
              </div>

              <div>
                <Label htmlFor="acquisitionDate">Fecha de Adquisición</Label>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.acquisitionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.acquisitionDate ? format(formData.acquisitionDate, "PPP") : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.acquisitionDate}
                      onSelect={(date) => {
                        setFormData(prev => ({ ...prev, acquisitionDate: date }));
                        setShowCalendar(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="contractReference">Referencia de Contrato/Escritura</Label>
                <Input
                  id="contractReference"
                  value={formData.contractReference}
                  onChange={(e) => setFormData(prev => ({ ...prev, contractReference: e.target.value }))}
                  placeholder="Número de escritura, contrato, etc."
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="acquisitionNotes">Notas de Adquisición</Label>
                <Textarea
                  id="acquisitionNotes"
                  value={formData.acquisitionNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, acquisitionNotes: e.target.value }))}
                  placeholder="Detalles adicionales sobre la transacción..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* General Notes */}
        <div>
          <Label htmlFor="notes">Notas Generales</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Observaciones generales sobre la parcela..."
            rows={2}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            Guardar Cambios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParcelAcquisitionForm;
