
import React from 'react';
import { FileText } from 'lucide-react';

const HealthRecordsEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros de salud</h3>
      <p className="text-gray-500">No se han registrado eventos de salud para este animal.</p>
    </div>
  );
};

export default HealthRecordsEmptyState;
