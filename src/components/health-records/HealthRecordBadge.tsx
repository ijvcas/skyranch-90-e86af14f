
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface HealthRecordBadgeProps {
  recordType: string;
}

const HealthRecordBadge: React.FC<HealthRecordBadgeProps> = ({ recordType }) => {
  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'vaccination':
        return 'bg-blue-100 text-blue-800';
      case 'treatment':
        return 'bg-red-100 text-red-800';
      case 'checkup':
        return 'bg-green-100 text-green-800';
      case 'illness':
        return 'bg-orange-100 text-orange-800';
      case 'injury':
        return 'bg-purple-100 text-purple-800';
      case 'medication':
        return 'bg-yellow-100 text-yellow-800';
      case 'surgery':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecordTypeText = (type: string) => {
    switch (type) {
      case 'vaccination':
        return 'Vacunación';
      case 'treatment':
        return 'Tratamiento';
      case 'checkup':
        return 'Revisión';
      case 'illness':
        return 'Enfermedad';
      case 'injury':
        return 'Lesión';
      case 'medication':
        return 'Medicamento';
      case 'surgery':
        return 'Cirugía';
      default:
        return type;
    }
  };

  return (
    <Badge className={getRecordTypeColor(recordType)}>
      {getRecordTypeText(recordType)}
    </Badge>
  );
};

export default HealthRecordBadge;
