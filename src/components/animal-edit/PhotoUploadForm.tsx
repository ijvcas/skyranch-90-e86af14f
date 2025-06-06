
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from '@/components/ImageUpload';

interface PhotoUploadFormProps {
  formData: any;
  onImageChange: (imageUrl: string | null) => void;
  disabled?: boolean;
}

const PhotoUploadForm = ({ formData, onImageChange, disabled = false }: PhotoUploadFormProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Fotografía</CardTitle>
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
