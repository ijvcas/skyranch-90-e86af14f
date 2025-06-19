
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ImageUpload
          currentImage={formData.image}
          onImageChange={onImageChange}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
};

export default PhotoUploadForm;
