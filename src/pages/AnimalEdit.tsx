
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft } from 'lucide-react';
import { useAnimalEdit } from '@/hooks/useAnimalEdit';
import BasicInformationForm from '@/components/animal-edit/BasicInformationForm';
import PedigreeForm from '@/components/animal-edit/PedigreeForm';
import HealthStatusForm from '@/components/animal-edit/HealthStatusForm';
import PhotoUploadForm from '@/components/animal-edit/PhotoUploadForm';
import NotesForm from '@/components/animal-edit/NotesForm';

const AnimalEdit = () => {
  const {
    id,
    animal,
    isLoadingAnimal,
    formData,
    updateMutation,
    handleSubmit,
    handleInputChange,
    handleImageChange,
    navigate
  } = useAnimalEdit();

  if (!id) {
    return null;
  }

  if (isLoadingAnimal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando animal...</div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Animal no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 pb-20 md:pb-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/animals')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Animales
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Editar Animal: {formData.name}
          </h1>
          <p className="text-gray-600">Modifica la información del animal</p>
        </div>

        {/* Invisible password fields for complete autofill prevention */}
        <div style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          visibility: 'hidden'
        }}>
          <input 
            type="text" 
            name="fake_username_remembered" 
            autoComplete="username" 
            tabIndex={-1}
            readOnly
          />
          <input 
            type="password" 
            name="fake_password_remembered" 
            autoComplete="current-password" 
            tabIndex={-1}
            readOnly
          />
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="space-y-6" 
          autoComplete="new-password"
          data-lpignore="true"
          data-1p-ignore="true"
          data-bitwarden-ignore="true"
          data-dashlane-ignore="true"
          data-keeper-ignore="true"
          data-lastpass-ignore="true"
          data-roboform-ignore="true"
          data-form="animal-edit-form"
          role="form"
          noValidate
        >
          
          <BasicInformationForm
            formData={formData}
            onInputChange={handleInputChange}
            disabled={updateMutation.isPending}
          />

          <PedigreeForm
            formData={formData}
            onInputChange={handleInputChange}
            disabled={updateMutation.isPending}
          />

          <HealthStatusForm
            formData={formData}
            onInputChange={handleInputChange}
            disabled={updateMutation.isPending}
          />

          <PhotoUploadForm
            formData={formData}
            onImageChange={handleImageChange}
            disabled={updateMutation.isPending}
          />

          <NotesForm
            formData={formData}
            onInputChange={handleInputChange}
            disabled={updateMutation.isPending}
          />

          {/* Submit Buttons */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/animals')}
              className="flex-1"
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnimalEdit;
