
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity } from 'lucide-react';

interface HealthStatusFormProps {
  healthStatus: string;
  onHealthStatusChange: (value: string) => void;
}

const HealthStatusForm: React.FC<HealthStatusFormProps> = ({
  healthStatus,
  onHealthStatusChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Estado de Salud</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="healthStatus">Estado de Salud</Label>
          <Select value={healthStatus} onValueChange={onHealthStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado de salud" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="healthy">Saludable</SelectItem>
              <SelectItem value="sick">Enfermo</SelectItem>
              <SelectItem value="pregnant">Gestante</SelectItem>
              <SelectItem value="pregnant-healthy">Gestante Saludable</SelectItem>
              <SelectItem value="pregnant-sick">Gestante Enferma</SelectItem>
              <SelectItem value="treatment">En Tratamiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-gray-600">
          <p><strong>Estados disponibles:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Saludable:</strong> Animal en buen estado de salud</li>
            <li><strong>Enfermo:</strong> Animal con problemas de salud</li>
            <li><strong>Gestante:</strong> Animal embarazada (estado general)</li>
            <li><strong>Gestante Saludable:</strong> Animal embarazada sin complicaciones</li>
            <li><strong>Gestante Enferma:</strong> Animal embarazada con problemas de salud</li>
            <li><strong>En Tratamiento:</strong> Animal recibiendo tratamiento médico</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthStatusForm;
