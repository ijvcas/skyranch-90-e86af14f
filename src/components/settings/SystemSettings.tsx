
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SupportInfoSettings from './SupportInfoSettings';
import TimezoneSettings from '@/components/TimezoneSettings';
import DeploymentVersionDisplay from '@/components/app-info/DeploymentVersionDisplay';

const SystemSettings = () => {
  const { user } = useAuth();
  const isAdmin = user?.email === 'jvcas@mac.com';

  return (
    <div className="space-y-6">
      {/* Support Info Panel at the top */}
      <SupportInfoSettings isAdmin={isAdmin} />
      
      {/* Timezone Settings */}
      <TimezoneSettings />
      
      {/* Deployment Version Display - this is the one that should work with Publish Update */}
      <DeploymentVersionDisplay />
    </div>
  );
};

export default SystemSettings;
