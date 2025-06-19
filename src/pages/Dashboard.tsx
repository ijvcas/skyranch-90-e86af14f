
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllAnimals } from '@/services/animalService';
import { checkPermission } from '@/services/permissionService';
import DashboardBanner from '@/components/dashboard/DashboardBanner';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardErrorState from '@/components/dashboard/DashboardErrorState';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Enhanced query with better error handling and permission checking
  const { data: allAnimals = [], isLoading, error, refetch } = useQuery({
    queryKey: ['animals', 'all-users'],
    queryFn: async () => {
      try {
        console.log('🔍 Checking animals_view permission before fetching...');
        
        // Check permission before fetching data
        try {
          await checkPermission('animals_view');
          console.log('✅ Permission granted for animals_view');
        } catch (permissionError) {
          console.log('❌ Permission denied for animals_view:', permissionError);
          // Return empty array instead of throwing to prevent app crash
          return [];
        }
        
        console.log('🔄 Fetching animals data...');
        const animals = await getAllAnimals();
        console.log('✅ Animals fetched successfully:', animals.length);
        return animals;
      } catch (error) {
        console.error('❌ Error fetching animals:', error);
        // Return empty array instead of throwing to prevent app crash
        return [];
      }
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    retry: (failureCount, error) => {
      // Only retry up to 2 times for certain errors
      if (failureCount >= 2) return false;
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnMount: true,
    refetchOnWindowFocus: false, // Disable to prevent excessive requests
  });

  // Force a complete refresh of all data
  const handleForceRefresh = () => {
    console.log('🔄 Force refreshing all data...');
    queryClient.clear();
    refetch();
    toast({
      title: "Actualizando datos",
      description: "Recargando todos los animales del sistema...",
    });
  };

  // Calculate all stats from the single query result
  const totalAnimals = allAnimals.length;
  const speciesCounts = allAnimals.reduce((counts, animal) => {
    counts[animal.species] = (counts[animal.species] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <DashboardLoadingState userEmail={user?.email} />;
  }

  if (error) {
    return (
      <DashboardErrorState 
        userEmail={user?.email}
        onForceRefresh={handleForceRefresh}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        <DashboardBanner />
        
        <DashboardHeader 
          userEmail={user?.email}
          totalAnimals={totalAnimals}
          onForceRefresh={handleForceRefresh}
        />

        <DashboardStats 
          totalAnimals={totalAnimals}
          speciesCounts={speciesCounts}
        />

        <DashboardQuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
