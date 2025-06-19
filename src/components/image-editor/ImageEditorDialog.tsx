
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X } from 'lucide-react';
import EnhancedImageViewer from './EnhancedImageViewer';

interface Transform {
  scale: number;
  translateX: number;
  translateY: number;
  rotation: number;
}

interface ImageEditorDialogProps {
  src: string;
  alt: string;
  onSave?: (transformedImageData: string) => void;
  trigger?: React.ReactNode;
}

const ImageEditorDialog: React.FC<ImageEditorDialogProps> = ({
  src,
  alt,
  onSave,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTransform, setCurrentTransform] = useState<Transform>({
    scale: 1,
    translateX: 0,
    translateY: 0,
    rotation: 0
  });

  const handleTransformChange = (transform: Transform) => {
    setCurrentTransform(transform);
  };

  const handleSave = async () => {
    // In a real implementation, you would apply the transforms to the image
    // and generate a new image data URL. For now, we'll just call onSave with the original src
    onSave?.(src);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset transform when closing
    setCurrentTransform({ scale: 1, translateX: 0, translateY: 0, rotation: 0 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Image
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          <EnhancedImageViewer
            src={src}
            alt={alt}
            className="w-full h-full"
            onTransformChange={handleTransformChange}
          />
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-600">
            Use mouse wheel to zoom, drag to pan when zoomed in
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditorDialog;
