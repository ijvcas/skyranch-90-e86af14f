
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BasicInfoSectionProps {
  formData: {
    recordType: string;
    title: string;
    description: string;
    dateAdministered: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Básica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recordType">Tipo de Registro *</Label>
            <Select value={formData.recordType} onValueChange={(value) => onInputChange('recordType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vaccination">Vacunación</SelectItem>
                <SelectItem value="treatment">Tratamiento</SelectItem>
                <SelectItem value="checkup">Revisión</SelectItem>
                <SelectItem value="illness">Enfermedad</SelectItem>
                <SelectItem value="injury">Lesión</SelectItem>
                <SelectItem value="medication">Medicamento</SelectItem>
                <SelectItem value="surgery">Cirugía</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dateAdministered">Fecha *</Label>
            <Input
              id="dateAdministered"
              type="date"
              value={formData.dateAdministered}
              onChange={(e) => onInputChange('dateAdministered', e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            placeholder="Ej: Vacuna antirrábica, Desparasitación, etc."
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Descripción detallada del procedimiento..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;
