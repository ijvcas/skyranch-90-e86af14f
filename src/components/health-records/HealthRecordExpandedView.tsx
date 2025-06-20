
import React from 'react';
import { User, DollarSign, Pill, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HealthRecord {
  id: string;
  animalId: string;
  recordType: string;
  title: string;
  description?: string;
  veterinarian?: string;
  medication?: string;
  dosage?: string;
  cost?: number;
  dateAdministered: string;
  nextDueDate?: string;
  notes?: string;
}

interface HealthRecordExpandedViewProps {
  record: HealthRecord;
}

const HealthRecordExpandedView: React.FC<HealthRecordExpandedViewProps> = ({ record }) => {
  return (
    <div className="space-y-3 border-t pt-3 mt-3">
      {/* Show next due date in expanded view with visual prominence */}
      {record.nextDueDate && (
        <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2 text-orange-700">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              Próximo vencimiento: {format(new Date(record.nextDueDate), 'dd/MM/yyyy', { locale: es })}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        {record.veterinarian && (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Veterinario:</span>
            <span className="font-medium">{record.veterinarian}</span>
          </div>
        )}

        {record.medication && (
          <div className="flex items-center space-x-2">
            <Pill className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Medicamento:</span>
            <span className="font-medium">{record.medication}</span>
          </div>
        )}

        {record.dosage && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Dosis:</span>
            <span className="font-medium">{record.dosage}</span>
          </div>
        )}

        {record.cost && (
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Costo:</span>
            <span className="font-medium">${record.cost}</span>
          </div>
        )}
      </div>

      {/* Notes are only shown once in expanded view */}
      {record.notes && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Notas:</strong> {record.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default HealthRecordExpandedView;
