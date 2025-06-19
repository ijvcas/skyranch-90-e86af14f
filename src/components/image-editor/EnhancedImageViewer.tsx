
import React from 'react';
import { useImageViewer, Transform } from './hooks/useImageViewer';
import ImageViewerControls from './ImageViewerControls';
import ImageViewerCanvas from './ImageViewerCanvas';
import ImageViewerIndicators from './ImageViewerIndicators';

interface EnhancedImageViewerProps {
  src: string;
  alt: string;
  className?: string;
  editMode?: boolean;
  onTransformChange?: (transform: Transform) => void;
  initialTransform?: Transform | null;
}

const EnhancedImageViewer: React.FC<EnhancedImageViewerProps> = ({
  src,
  alt,
  className = '',
  editMode = false,
  onTransformChange,
  initialTransform
}) => {
  const {
    transform,
    isDragging,
    containerRef,
    imageRef,
    handleZoomIn,
    handleZoomOut,
    handleRotateLeft,
    handleRotateRight,
    handleReset,
    handleMouseDown,
    handleWheel
  } = useImageViewer({ editMode, onTransformChange, initialTransform });

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <ImageViewerCanvas
        src={src}
        alt={alt}
        transform={transform}
        isDragging={isDragging}
        editMode={editMode}
        containerRef={containerRef}
        imageRef={imageRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      />
      
      {editMode && (
        <ImageViewerControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRotateLeft={handleRotateLeft}
          onRotateRight={handleRotateRight}
          onReset={handleReset}
        />
      )}

      <ImageViewerIndicators editMode={editMode} transform={transform} />
    </div>
  );
};

export default EnhancedImageViewer;
