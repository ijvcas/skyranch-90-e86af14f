
import React from 'react';
import { useBreedingForm } from '@/hooks/useBreedingForm';
import BreedingBasicInfo from '@/components/breeding/BreedingBasicInfo';
import BreedingPregnancyInfo from '@/components/breeding/BreedingPregnancyInfo';
import BreedingAdditionalInfo from '@/components/breeding/BreedingAdditionalInfo';
import BreedingFormActions from '@/components/breeding/BreedingFormActions';

interface BreedingFormProps {
  onSuccess: () => void;
}

const BreedingForm: React.FC<BreedingFormProps> = ({ onSuccess }) => {
  const {
    formData,
    animals,
    motherSpecies,
    isSubmitting,
    handleInputChange,
    submitForm
  } = useBreedingForm(onSuccess);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitting) {
      submitForm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BreedingBasicInfo
        formData={formData}
        animals={animals}
        onInputChange={handleInputChange}
      />

      <BreedingPregnancyInfo
        formData={formData}
        motherSpecies={motherSpecies}
        onInputChange={handleInputChange}
      />

      <BreedingAdditionalInfo
        formData={formData}
        onInputChange={handleInputChange}
      />

      <BreedingFormActions
        isSubmitting={isSubmitting}
        onSubmit={submitForm}
      />
    </form>
  );
};

export default BreedingForm;
