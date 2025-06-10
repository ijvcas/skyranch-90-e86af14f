
import React from 'react';
import { useDraggable } from '@/hooks/useDraggable';

export const SkyRanchLabel = () => {
  const { position, dragRef, handleMouseDown, isDragging } = useDraggable({ x: 0, y: 0 });

  return (
    <div 
      ref={dragRef}
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20"
      style={{ 
        transform: `translate(${position.x - 50}%, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-white/95 backdrop-blur-sm border border-gray-300 rounded-lg px-4 py-2 shadow-lg">
        <div className="text-sm font-semibold text-gray-800">SkyRanch</div>
        <div className="text-xs text-gray-600">40°19'3.52"N, 4°28'27.47"W</div>
      </div>
    </div>
  );
};
