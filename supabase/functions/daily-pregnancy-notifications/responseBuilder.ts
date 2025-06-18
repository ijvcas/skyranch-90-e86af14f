
import { BreedingRecord } from './types.ts';

export class ResponseBuilder {
  static buildSuccessResponse(
    breedingRecords: BreedingRecord[],
    notificationsSent: number,
    notificationsFailed: number,
    todayString: string,
    sevenDaysString: string,
    motherMap: Record<string, string>,
    corsHeaders: Record<string, string>
  ): Response {
    return new Response(JSON.stringify({
      message: 'Daily pregnancy notifications processed',
      pregnancies_checked: breedingRecords.length,
      notifications_sent: notificationsSent,
      notifications_failed: notificationsFailed,
      date_range: `from ${todayString} to ${sevenDaysString}`,
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
  }

  static buildNoPregnanciesResponse(
    todayString: string,
    sevenDaysString: string,
    allPregnancies: any[] | null,
    corsHeaders: Record<string, string>
  ): Response {
    return new Response(JSON.stringify({ 
      message: 'No pregnancies requiring notifications',
      debugInfo: {
        dateRange: `from ${todayString} to ${sevenDaysString}`,
        allPregnancies: allPregnancies
      },
      notifications_sent: 0
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  static buildNoUsersResponse(corsHeaders: Record<string, string>): Response {
    return new Response(JSON.stringify({ 
      message: 'No active users found',
      notifications_sent: 0
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  static buildErrorResponse(error: any, corsHeaders: Record<string, string>): Response {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}
