
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
  actual_birth_date?: string;
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

    // Calculate date range - pregnancies due within 7 days OR overdue
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    const todayString = today.toISOString().split('T')[0];
    const sevenDaysString = sevenDaysFromNow.toISOString().split('T')[0];

    console.log(`📅 Today: ${todayString}`);
    console.log(`📅 Checking for due dates up to 7 days from now: ${sevenDaysString}`);

    // Get confirmed pregnancies that:
    // 1. Are due within the next 7 days OR are overdue (past due date)
    // 2. Haven't given birth yet (no actual_birth_date AND status != 'birth_completed')
    // 3. Are confirmed pregnancies
    const { data: breedingRecords, error: breedingError } = await supabase
      .from('breeding_records')
      .select('id, expected_due_date, mother_id, pregnancy_confirmed, status, actual_birth_date')
      .eq('pregnancy_confirmed', true)
      .lte('expected_due_date', sevenDaysString) // Due within 7 days or overdue
      .is('actual_birth_date', null) // No birth recorded yet
      .neq('status', 'birth_completed'); // Status is not birth completed

    if (breedingError) {
      console.error('❌ Error fetching breeding records:', breedingError);
      throw breedingError;
    }

    console.log(`🔍 Query results: Found ${breedingRecords?.length || 0} breeding records to check`);
    console.log('📋 Breeding records details:', breedingRecords);

    if (!breedingRecords || breedingRecords.length === 0) {
      console.log('📋 No pregnancies requiring notifications found');
      
      // Debug info - check what pregnancies exist
      const { data: allPregnancies, error: allError } = await supabase
        .from('breeding_records')
        .select('id, expected_due_date, pregnancy_confirmed, status, actual_birth_date')
        .eq('pregnancy_confirmed', true);
      
      console.log('🔍 Debug - All confirmed pregnancies in system:', allPregnancies);
      
      return new Response(JSON.stringify({ 
        message: 'No pregnancies requiring notifications',
        debugInfo: {
          dateRange: `up to ${sevenDaysString}`,
          allPregnancies: allPregnancies
        },
        notifications_sent: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`🤰 Found ${breedingRecords.length} pregnancies requiring notifications`);

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
      return new Response(JSON.stringify({ 
        message: 'No active users found',
        notifications_sent: 0
      }), {
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
      
      // Determine if overdue or upcoming
      const isOverdue = daysUntilDue < 0;
      const daysDifference = Math.abs(daysUntilDue);

      let notificationMessage;
      let notificationTitle;

      if (isOverdue) {
        notificationTitle = '🚨 Parto vencido';
        notificationMessage = `${motherName} tenía fecha de parto el ${dueDateString} (${daysDifference} días vencido). Es urgente revisar y registrar el parto si ya ocurrió.`;
      } else if (daysUntilDue === 0) {
        notificationTitle = '🚨 Parto hoy';
        notificationMessage = `${motherName} está programada para dar a luz HOY (${dueDateString}). Mantén vigilancia constante y área de parto preparada.`;
      } else {
        notificationTitle = '🤰 Parto próximo';
        notificationMessage = `${motherName} está programada para dar a luz en ${daysDifference} días (${dueDateString}). Prepara el área de parto y mantén atención veterinaria disponible.`;
      }

      console.log(`🤰 Processing pregnancy for ${motherName}: ${isOverdue ? 'overdue' : 'upcoming'} (${daysDifference} days)`);

      for (const user of users) {
        try {
          // Check if we already sent a notification for this pregnancy today
          const todayStart = new Date(today);
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date(today);
          todayEnd.setHours(23, 59, 59, 999);

          const { data: existingNotifications } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('type', 'breeding')
            .like('message', `%${motherName}%`)
            .gte('created_at', todayStart.toISOString())
            .lte('created_at', todayEnd.toISOString());

          if (existingNotifications && existingNotifications.length > 0) {
            console.log(`⏭️ Notification already sent today for ${motherName} to user ${user.email}`);
            continue;
          }

          // Create in-app notification
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: user.id,
              type: 'breeding',
              priority: isOverdue ? 'high' : 'high', // All pregnancy notifications are high priority
              title: notificationTitle,
              message: notificationMessage,
              read: false,
              action_required: true,
              animal_name: motherName,
              metadata: {
                breeding_record_id: record.id,
                due_date: record.expected_due_date,
                days_difference: daysDifference,
                is_overdue: isOverdue
              }
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
      date_range: `up to ${sevenDaysString}`,
      details: breedingRecords.map(record => ({
        breeding_record_id: record.id,
        mother_name: motherMap[record.mother_id] || 'Unknown',
        due_date: record.expected_due_date,
        status: record.status
      }))
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
