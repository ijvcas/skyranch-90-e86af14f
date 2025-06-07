
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimezone } from '@/hooks/useTimezone';

const TimezoneSettings = () => {
  const { timezone, setTimezone } = useTimezone();

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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Configuración de Zona Horaria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
        
        <div className="text-sm text-gray-600">
          <p>Zona horaria actual: {timezone}</p>
          <p>Hora local: {new Date().toLocaleString('es-ES', { timeZone: timezone })}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimezoneSettings;
