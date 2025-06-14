
import React, { useState } from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import UserSettings from '@/components/settings/UserSettings';
import BackupSettings from '@/components/settings/BackupSettings';
import PermissionsSettings from '@/components/settings/PermissionsSettings';
import SystemSettings from '@/components/settings/SystemSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <UserSettings />
      <BackupSettings />
      <PermissionsSettings />
      <SystemSettings />
    </SettingsLayout>
  );
};

export default Settings;
