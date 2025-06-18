
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PregnancyQueryService } from './pregnancyQuery.ts';
import { UserService } from './userService.ts';
import { NotificationService } from './notificationService.ts';
import { ResponseBuilder } from './responseBuilder.ts';
import { BreedingRecord, Animal, User } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting daily pregnancy notifications check...');

    // Calculate date range - pregnancies due within 7 days OR overdue
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    const todayString = today.toISOString().split('T')[0];
    const sevenDaysString = sevenDaysFromNow.toISOString().split('T')[0];

    console.log(`📅 Today: ${todayString}`);
    console.log(`📅 Checking for pregnancies due from today up to: ${sevenDaysString}`);

    // Initialize services
    const pregnancyQueryService = new PregnancyQueryService(supabase);
    const userService = new UserService(supabase);
    const notificationService = new NotificationService(supabase);

    // Get pregnancies requiring notifications
    const { breedingRecords, error: breedingError } = await pregnancyQueryService
      .getPregnanciesRequiringNotifications(todayString, sevenDaysString);

    if (breedingError) {
      console.error('❌ Error fetching breeding records:', breedingError);
      throw breedingError;
    }

    console.log(`🔍 Query results: Found ${breedingRecords?.length || 0} breeding records to check`);
    console.log('📋 Breeding records details:', breedingRecords);

    if (!breedingRecords || breedingRecords.length === 0) {
      console.log('📋 No pregnancies requiring notifications found');
      
      // Debug info - check what pregnancies exist
      const { allPregnancies } = await pregnancyQueryService.getAllConfirmedPregnancies();
      console.log('🔍 Debug - All confirmed pregnancies in system:', allPregnancies);
      
      return ResponseBuilder.buildNoPregnanciesResponse(
        todayString, 
        sevenDaysString, 
        allPregnancies, 
        corsHeaders
      );
    }

    console.log(`🤰 Found ${breedingRecords.length} pregnancies requiring notifications`);

    // Get mother animal names
    const motherIds = breedingRecords.map(record => record.mother_id);
    const { mothers, error: mothersError } = await pregnancyQueryService.getMotherAnimals(motherIds);

    if (mothersError) {
      console.error('❌ Error fetching mother animals:', mothersError);
      throw mothersError;
    }

    // Create a map of mother IDs to names
    const motherMap = (mothers || []).reduce((acc: Record<string, string>, mother: Animal) => {
      acc[mother.id] = mother.name;
      return acc;
    }, {});

    // Get all active users
    const { users, error: usersError } = await userService.getActiveUsers();

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log('👥 No active users found');
      return ResponseBuilder.buildNoUsersResponse(corsHeaders);
    }

    console.log(`👥 Found ${users.length} active users`);

    // Send notifications
    const { notificationsSent, notificationsFailed } = await notificationService
      .sendNotificationsForPregnancies(breedingRecords, users, motherMap, today);

    console.log(`📊 Notifications sent: ${notificationsSent}, failed: ${notificationsFailed}`);

    return ResponseBuilder.buildSuccessResponse(
      breedingRecords,
      notificationsSent,
      notificationsFailed,
      todayString,
      sevenDaysString,
      motherMap,
      corsHeaders
    );

  } catch (error: any) {
    console.error('❌ Error in daily pregnancy notifications:', error);
    return ResponseBuilder.buildErrorResponse(error, corsHeaders);
  }
};

serve(handler);
