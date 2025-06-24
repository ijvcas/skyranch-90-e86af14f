
import React from 'react';
import VersionControlPanel from '@/components/version-management/VersionControlPanel';
import VersionHistoryPanel from '@/components/version-management/VersionHistoryPanel';

const VersionSettings = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VersionControlPanel />
        <VersionHistoryPanel />
      </div>
    </div>
  );
};

export default VersionSettings;
