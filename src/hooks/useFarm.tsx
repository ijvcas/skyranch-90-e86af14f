import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useFarm = () => {
  const { user } = useAuth();
  
  const { data: userFarms = [], isLoading: isLoadingFarms, error } = useQuery({
    queryKey: ['user-farms', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('farm_members')
        .select(`
          farm_id,
          role,
          joined_at,
          farms:farm_id (
            id,
            name,
            description,
            farm_type,
            location,
            created_at
          )
        `)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching user farms:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const currentFarm = userFarms?.[0]?.farms;
  const hasFarm = userFarms && userFarms.length > 0;
  const isOwner = userFarms?.[0]?.role === 'owner';

  return {
    userFarms,
    currentFarm,
    hasFarm,
    isOwner,
    isLoadingFarms,
    error
  };
};