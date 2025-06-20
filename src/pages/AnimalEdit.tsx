
import React from 'react';
import PermissionGuard from '@/components/PermissionGuard';
import AnimalEditStates from '@/components/animal-edit/AnimalEditStates';
import AnimalEditFormContainer from '@/components/animal-edit/AnimalEditFormContainer';
import { useAnimalEditLogic } from '@/hooks/animal-edit/useAnimalEditLogic';

const AnimalEdit = () => {
  const {
    id,
    animal,
    isLoading,
    error,
    formData,
    permissionError,
    updateMutation,
    handleInputChange,
    handleImageChange,
    handleSubmit,
    navigate
  } = useAnimalEditLogic();

  const handleCancel = () => navigate(`/animals/${id}`);
  const handleNavigateBack = () => navigate('/animals');

  // Handle loading, error, and permission states
  const stateComponent = (
    <AnimalEditStates
      isLoading={isLoading}
      error={error}
      animal={animal}
      permissionError={permissionError}
      onNavigateBack={handleNavigateBack}
    />
  );

  if (stateComponent) {
    return stateComponent;
  }

  return (
    <PermissionGuard permission="animals_edit">
      <AnimalEditFormContainer
        animal={animal}
        formData={formData}
        updateMutation={updateMutation}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </PermissionGuard>
  );
};

export default AnimalEdit;
