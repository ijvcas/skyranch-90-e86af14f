
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface BreedingRecord {
  id: string;
  expected_due_date: string;
  mother_id: string;
  pregnancy_confirmed: boolean;
  status: string;
}

interface Animal {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting daily pregnancy notifications check...');

    // Calculate date range for next 7 days
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    const todayString = today.toISOString().split('T')[0];
    const sevenDaysString = sevenDaysFromNow.toISOString().split('T')[0];

    console.log(`📅 Today: ${todayString}`);
    console.log(`📅 Checking for due dates between today and: ${sevenDaysString}`);

    // Get confirmed pregnancies with due dates within the next 7 days that haven't given birth yet
    const { data: breedingRecords, error: breedingError } = await supabase
      .from('breeding_records')
      .select('id, expected_due_date, mother_id, pregnancy_confirmed, status')
      .eq('pregnancy_confirmed', true)
      .gte('expected_due_date', todayString)
      .lte('expected_due_date', sevenDaysString)
      .neq('status', 'birth_completed');

    if (breedingError) {
      console.error('❌ Error fetching breeding records:', breedingError);
      throw breedingError;
    }

    console.log(`🔍 Query results: Found ${breedingRecords?.length || 0} breeding records`);
    console.log('📋 Breeding records:', breedingRecords);

    if (!breedingRecords || breedingRecords.length === 0) {
      console.log('📋 No pregnancies due within the next 7 days');
      
      // Let's also check what pregnancies exist in the system for debugging
      const { data: allPregnancies, error: allError } = await supabase
        .from('breeding_records')
        .select('id, expected_due_date, pregnancy_confirmed, status')
        .eq('pregnancy_confirmed', true);
      
      console.log('🔍 All confirmed pregnancies in system:', allPregnancies);
      
      return new Response(JSON.stringify({ 
        message: 'No pregnancies due within the next 7 days',
        debugInfo: {
          dateRange: `${todayString} to ${sevenDaysString}`,
          allPregnancies: allPregnancies
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`🤰 Found ${breedingRecords.length} pregnancies due within the next 7 days`);

    // Get mother animal names
    const motherIds = breedingRecords.map(record => record.mother_id);
    const { data: mothers, error: mothersError } = await supabase
      .from('animals')
      .select('id, name')
      .in('id', motherIds);

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
    const { data: users, error: usersError } = await supabase
      .from('app_users')
      .select('id, email')
      .eq('is_active', true);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log('👥 No active users found');
      return new Response(JSON.stringify({ message: 'No active users found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`👥 Found ${users.length} active users`);

    // Send notifications for each pregnancy to all users
    let notificationsSent = 0;
    let notificationsFailed = 0;

    for (const record of breedingRecords) {
      const motherName = motherMap[record.mother_id] || 'Animal desconocido';
      const dueDate = new Date(record.expected_due_date);
      const dueDateString = dueDate.toLocaleDateString('es-ES');
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`🤰 Processing pregnancy for ${motherName}, due in ${daysUntilDue} days (${dueDateString})`);

      for (const user of users) {
        try {
          // Create in-app notification
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: user.id,
              type: 'breeding',
              priority: 'high',
              title: '🤰 Parto próximo',
              message: `${motherName} está programada para dar a luz en ${daysUntilDue} días (${dueDateString}). Prepara el área de parto y mantén atención veterinaria disponible.`,
              read: false,
              action_required: true,
              animal_name: motherName
            });

          if (notificationError) {
            console.error(`❌ Error creating notification for user ${user.email}:`, notificationError);
            notificationsFailed++;
          } else {
            console.log(`✅ Notification created for ${user.email} about ${motherName}`);
            notificationsSent++;
          }
        } catch (error) {
          console.error(`❌ Error processing notification for user ${user.email}:`, error);
          notificationsFailed++;
        }
      }
    }

    console.log(`📊 Notifications sent: ${notificationsSent}, failed: ${notificationsFailed}`);

    return new Response(JSON.stringify({
      message: 'Daily pregnancy notifications processed',
      pregnancies_checked: breedingRecords.length,
      notifications_sent: notificationsSent,
      notifications_failed: notificationsFailed,
      date_range: `${todayString} to ${sevenDaysString}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('❌ Error in daily pregnancy notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
