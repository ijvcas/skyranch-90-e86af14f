
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SupportInfoSettings from './SupportInfoSettings';
import UnifiedAppInfo from '@/components/UnifiedAppInfo';
import TimezoneSettings from '@/components/TimezoneSettings';

const SystemSettings = () => {
  const { user } = useAuth();
  const isAdmin = user?.email === 'jvcas@mac.com';

  return (
    <div className="space-y-6">
      {/* Support Info Panel at the top */}
      <SupportInfoSettings isAdmin={isAdmin} />
      
      {/* Timezone Settings */}
      <TimezoneSettings />
      
      {/* App Info below */}
      <UnifiedAppInfo isAdmin={isAdmin} showSupportCard={false} />
    </div>
  );
};

export default SystemSettings;
