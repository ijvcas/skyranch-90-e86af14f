
import React, { useState } from 'react';
import SettingsLayout from '@/components/settings/SettingsLayout';
import UserSettings from '@/components/settings/UserSettings';
import BackupSettings from '@/components/settings/BackupSettings';
import PermissionsSettings from '@/components/settings/PermissionsSettings';
import SystemSettings from '@/components/settings/SystemSettings';
import PermissionGuard from '@/components/PermissionGuard';
import { TabsContent } from '@/components/ui/tabs';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <TabsContent value="users">
        <PermissionGuard permission="users_manage">
          <UserSettings />
        </PermissionGuard>
      </TabsContent>
      
      <TabsContent value="backup">
        <PermissionGuard permission="system_settings">
          <BackupSettings />
        </PermissionGuard>
      </TabsContent>
      
      <TabsContent value="permissions">
        <PermissionGuard permission="system_settings">
          <PermissionsSettings />
        </PermissionGuard>
      </TabsContent>
      
      <TabsContent value="system">
        <PermissionGuard permission="system_settings">
          <SystemSettings />
        </PermissionGuard>
      </TabsContent>
    </SettingsLayout>
  );
};

export default Settings;
