
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import FieldReportDialog from './FieldReportDialog';

const FieldReportButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
      >
        <FileText className="w-5 h-5 mr-2" />
        Reporte de Campo
        <Plus className="w-4 h-4 ml-2" />
      </Button>
      
      <FieldReportDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </>
  );
};

export default FieldReportButton;
