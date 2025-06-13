
import { useRealNotificationMutations } from './realMutations';

export const useNotificationMutations = () => {
  // Switch to real mutations instead of mock
  return useRealNotificationMutations();
};
