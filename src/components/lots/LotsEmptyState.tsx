
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';

interface LotsEmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

const LotsEmptyState: React.FC<LotsEmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="text-center py-12">
      <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      <Button onClick={onAction} className="flex items-center space-x-2">
        <Plus className="w-4 h-4" />
        <span>{actionLabel}</span>
      </Button>
    </div>
  );
};

export default LotsEmptyState;
