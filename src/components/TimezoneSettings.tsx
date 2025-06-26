
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimezone } from '@/hooks/useTimezone';
import { Clock, Calendar } from 'lucide-react';
import { euro } from 'lucide-react';

const TimezoneSettings = () => {
  const { timezone, setTimezone, dateFormat, setDateFormat, currency, setCurrency } = useTimezone();

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

  const currencies = [
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'USD', label: 'Dólar Americano ($)', symbol: '$' },
    { value: 'COP', label: 'Peso Colombiano (COP)', symbol: '$' },
    { value: 'MXN', label: 'Peso Mexicano (MX$)', symbol: '$' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Configuración Regional
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

        <div>
          <Label htmlFor="currency" className="flex items-center gap-2">
            <euro className="w-4 h-4" />
            Moneda
          </Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Seleccionar moneda" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                <SelectItem key={curr.value} value={curr.value}>
                  {curr.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded space-y-1">
          <p><strong>Zona horaria actual:</strong> {timezone}</p>
          <p><strong>Formato de fecha:</strong> {dateFormat}</p>
          <p><strong>Moneda:</strong> {currencies.find(c => c.value === currency)?.label || 'Euro (€)'}</p>
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
          <p><strong>Ejemplo de moneda:</strong> {currencies.find(c => c.value === currency)?.symbol || '€'}1.234,56</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimezoneSettings;
