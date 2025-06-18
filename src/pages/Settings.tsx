
import React, { useState } from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import UserSettings from '@/components/settings/UserSettings';
import BackupSettings from '@/components/settings/BackupSettings';
import PermissionsSettings from '@/components/settings/PermissionsSettings';
import SystemSettings from '@/components/settings/SystemSettings';
import { TabsContent } from '@/components/ui/tabs';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <TabsContent value="users">
        <UserSettings />
      </TabsContent>
      
      <TabsContent value="backup">
        <BackupSettings />
      </TabsContent>
      
      <TabsContent value="permissions">
        <PermissionsSettings />
      </TabsContent>
      
      <TabsContent value="system">
        <SystemSettings />
      </TabsContent>
    </SettingsLayout>
  );
};

export default Settings;
