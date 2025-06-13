
import React from 'react';
import { useAppInfo } from '@/hooks/useAppInfo';
import AppInfoCard from '@/components/app-info/AppInfoCard';
import SupportCard from '@/components/app-info/SupportCard';

interface UnifiedAppInfoProps {
  isAdmin: boolean;
  showSupportCard?: boolean;
}

const UnifiedAppInfo = ({ isAdmin, showSupportCard = true }: UnifiedAppInfoProps) => {
  const { appInfo, supportInfo, isOnline } = useAppInfo();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AppInfoCard appInfo={appInfo} />
      
      {showSupportCard && (
        <SupportCard 
          supportInfo={supportInfo} 
          isAdmin={isAdmin} 
          isOnline={isOnline} 
        />
      )}
    </div>
  );
};

export default UnifiedAppInfo;
