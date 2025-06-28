
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText } from 'lucide-react';
import type { CadastralParcel } from '@/services/cadastralService';
import ParcelAcquisitionForm from '../ParcelAcquisitionForm';

interface ParcelDetailDialogProps {
  parcel: CadastralParcel | null;
  open: boolean;
  onClose: () => void;
  onSave: (parcelId: string, updates: Partial<CadastralParcel>) => void;
}

export const ParcelDetailDialog: React.FC<ParcelDetailDialogProps> = ({
  parcel,
  open,
  onClose,
  onSave
}) => {
  const handleSave = (parcelId: string, updates: Partial<CadastralParcel>) => {
    onSave(parcelId, updates);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Edición Completa de Parcela
            </div>
          </DialogTitle>
        </DialogHeader>
        {parcel && (
          <ParcelAcquisitionForm
            parcel={parcel}
            onSave={handleSave}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
