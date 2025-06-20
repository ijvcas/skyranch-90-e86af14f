
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BasicInformationForm from '@/components/animal-edit/BasicInformationForm';
import HealthStatusForm from '@/components/animal-edit/HealthStatusForm';
import PedigreeForm from '@/components/animal-edit/PedigreeForm';
import PhotoUploadForm from '@/components/animal-edit/PhotoUploadForm';
import NotesForm from '@/components/animal-edit/NotesForm';

interface AnimalEditFormContainerProps {
  animal: any;
  formData: any;
  updateMutation: any;
  onInputChange: (field: string, value: string) => void;
  onImageChange: (imageUrl: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const AnimalEditFormContainer: React.FC<AnimalEditFormContainerProps> = ({
  animal,
  formData,
  updateMutation,
  onInputChange,
  onImageChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="page-with-logo">
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Animal</h1>
            <p className="text-gray-500">Modifica la información de {animal.name}</p>
          </div>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <BasicInformationForm 
            formData={formData} 
            onInputChange={onInputChange} 
          />
          
          <HealthStatusForm 
            formData={formData} 
            onInputChange={onInputChange} 
          />
          
          <PedigreeForm 
            formData={formData} 
            onInputChange={onInputChange} 
          />
          
          <PhotoUploadForm 
            formData={formData} 
            onImageChange={onImageChange} 
          />

          <NotesForm 
            formData={formData} 
            onInputChange={onInputChange} 
          />

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Confirmar Cambios</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending || !formData.name || !formData.species || !formData.tag}
              >
                {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Animal'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default AnimalEditFormContainer;
