
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SupportInfoSettings from './SupportInfoSettings';
import TimezoneSettings from '@/components/TimezoneSettings';
import DatabaseVersionDisplay from '@/components/app-info/DatabaseVersionDisplay';

const SystemSettings = () => {
  const { user } = useAuth();
  const isAdmin = user?.email === 'jvcas@mac.com';

  return (
    <div className="space-y-6">
      {/* Support Info Panel at the top */}
      <SupportInfoSettings isAdmin={isAdmin} />
      
      {/* Timezone Settings */}
      <TimezoneSettings />
      
      {/* Database Version Display - manual version system with description field */}
      <DatabaseVersionDisplay />
    </div>
  );
};

export default SystemSettings;
