
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { BreedingRecord } from '@/services/breedingService';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface BreedingCalendarViewProps {
  records: BreedingRecord[];
  animalNames: Record<string, string>;
}

const BreedingCalendarView: React.FC<BreedingCalendarViewProps> = ({ records, animalNames }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getRecordsForDate = (date: Date) => {
    return records.filter(record => {
      const breedingDate = new Date(record.breedingDate);
      const expectedDueDate = record.expectedDueDate ? new Date(record.expectedDueDate) : null;
      const actualBirthDate = record.actualBirthDate ? new Date(record.actualBirthDate) : null;
      
      return (
        isSameDay(breedingDate, date) ||
        (expectedDueDate && isSameDay(expectedDueDate, date)) ||
        (actualBirthDate && isSameDay(actualBirthDate, date))
      );
    });
  };

  const getEventType = (record: BreedingRecord, date: Date) => {
    const breedingDate = new Date(record.breedingDate);
    const expectedDueDate = record.expectedDueDate ? new Date(record.expectedDueDate) : null;
    const actualBirthDate = record.actualBirthDate ? new Date(record.actualBirthDate) : null;

    if (isSameDay(breedingDate, date)) return 'breeding';
    if (expectedDueDate && isSameDay(expectedDueDate, date)) return 'expected';
    if (actualBirthDate && isSameDay(actualBirthDate, date)) return 'birth';
    return 'other';
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'breeding':
        return 'bg-blue-100 text-blue-800';
      case 'expected':
        return 'bg-yellow-100 text-yellow-800';
      case 'birth':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'breeding':
        return 'Apareamiento';
      case 'expected':
        return 'Parto Esperado';
      case 'birth':
        return 'Parto';
      default:
        return 'Evento';
    }
  };

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>{format(currentDate, 'MMMM yyyy', { locale: es })}</span>
        </h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-600 bg-gray-50 rounded">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {monthDays.map(day => {
          const dayRecords = getRecordsForDate(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <Card key={day.toISOString()} className={`min-h-[100px] ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
              <CardContent className="p-2">
                <div className="font-medium text-sm mb-1">
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayRecords.map(record => {
                    const eventType = getEventType(record, day);
                    return (
                      <div key={`${record.id}-${eventType}`}>
                        <Badge 
                          className={`${getEventColor(eventType)} text-xs px-1 py-0.5 w-full justify-center`}
                          variant="secondary"
                        >
                          {getEventLabel(eventType)}
                        </Badge>
                        <div className="text-xs text-gray-600 truncate">
                          {animalNames[record.motherId]} × {animalNames[record.fatherId]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800">Apareamiento</Badge>
              <span className="text-sm text-gray-600">Fecha de apareamiento</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-yellow-100 text-yellow-800">Parto Esperado</Badge>
              <span className="text-sm text-gray-600">Fecha esperada de parto</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">Parto</Badge>
              <span className="text-sm text-gray-600">Fecha real de parto</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BreedingCalendarView;
