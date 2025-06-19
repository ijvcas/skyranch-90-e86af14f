
import React from 'react';
import { Transform } from './hooks/useImageViewer';

interface ImageViewerIndicatorsProps {
  editMode: boolean;
  transform: Transform;
}

const ImageViewerIndicators: React.FC<ImageViewerIndicatorsProps> = ({
  editMode,
  transform
}) => {
  if (!editMode || transform.scale === 1) return null;

  return (
    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
      {Math.round(transform.scale * 100)}%
    </div>
  );
};

export default ImageViewerIndicators;
