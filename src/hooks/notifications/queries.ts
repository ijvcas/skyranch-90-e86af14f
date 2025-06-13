
import { useRealNotificationQueries } from './realQueries';

export const useNotificationQueries = () => {
  // Switch to real queries instead of mock
  return useRealNotificationQueries();
};
