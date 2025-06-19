
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import ImageEditorDialog from '@/components/image-editor/ImageEditorDialog';

interface PhotoUploadFormProps {
  formData: any;
  onImageChange: (imageUrl: string | null) => void;
  disabled?: boolean;
}

const PhotoUploadForm = ({ formData, onImageChange, disabled = false }: PhotoUploadFormProps) => {
  const handleImageEdit = (editedImageData: string) => {
    onImageChange(editedImageData);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 flex items-center justify-between">
          Fotografía
          {formData.image && !disabled && (
            <ImageEditorDialog
              src={formData.image}
              alt={`Foto de animal`}
              onSave={handleImageEdit}
              trigger={
                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4" />
                </Button>
              }
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ImageUpload
            currentImage={formData.image}
            onImageChange={onImageChange}
            disabled={disabled}
          />
          {formData.image && (
            <div className="flex justify-center">
              <div className="relative inline-block max-w-full">
                <img
                  src={formData.image}
                  alt="Vista previa"
                  className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUploadForm;
