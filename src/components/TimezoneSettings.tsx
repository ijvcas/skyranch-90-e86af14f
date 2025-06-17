
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimezone } from '@/hooks/useTimezone';
import { Clock, Calendar } from 'lucide-react';

const TimezoneSettings = () => {
  const { timezone, setTimezone, dateFormat, setDateFormat } = useTimezone();

  const timezones = [
    { value: 'Europe/Madrid', label: 'Madrid (UTC+1)' },
    { value: 'America/Lima', label: 'Lima, Peru (UTC-5)' },
    { value: 'America/Mexico_City', label: 'Mexico City (UTC-6)' },
    { value: 'America/New_York', label: 'New York (UTC-5)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8)' },
    { value: 'Europe/London', label: 'London (UTC+0)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
    { value: 'Australia/Sydney', label: 'Sydney (UTC+10)' },
  ];

  const dateFormats = [
    { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY (Europeo)' },
    { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY (Americano)' },
    { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD (ISO)' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Configuración de Zona Horaria y Fechas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="timezone">Zona Horaria</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Seleccionar zona horaria" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dateFormat" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Formato de Fecha
          </Label>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Seleccionar formato de fecha" />
            </SelectTrigger>
            <SelectContent>
              {dateFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded space-y-1">
          <p><strong>Zona horaria actual:</strong> {timezone}</p>
          <p><strong>Formato de fecha:</strong> {dateFormat}</p>
          <p><strong>Hora local:</strong> {new Date().toLocaleString('es-ES', { timeZone: timezone })}</p>
          <p><strong>Ejemplo de fecha:</strong> {
            (() => {
              const today = new Date();
              const day = today.getDate().toString().padStart(2, '0');
              const month = (today.getMonth() + 1).toString().padStart(2, '0');
              const year = today.getFullYear();
              
              switch (dateFormat) {
                case 'dd/mm/yyyy':
                  return `${day}/${month}/${year}`;
                case 'mm/dd/yyyy':
                  return `${month}/${day}/${year}`;
                case 'yyyy-mm-dd':
                  return `${year}-${month}-${day}`;
                default:
                  return `${day}/${month}/${year}`;
              }
            })()
          }</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimezoneSettings;
