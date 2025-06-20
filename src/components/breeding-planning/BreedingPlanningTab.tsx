
import React from 'react';
import BreedingPlanningHeader from './BreedingPlanningHeader';
import BreedingPlanningTabs from './BreedingPlanningTabs';

const BreedingPlanningTab = () => {
  return (
    <div className="space-y-6">
      <BreedingPlanningHeader />
      <BreedingPlanningTabs />
    </div>
  );
};

export default BreedingPlanningTab;
