
import { supabase } from '@/integrations/supabase/client';

export interface FieldReportWithEntries {
  id: string;
  title: string;
  report_type: string;
  status: string;
  notes: string | null;
  weather_conditions: string | null;
  temperature: number | null;
  location_coordinates: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  entries: Array<{
    id: string;
    field_report_id: string;
    entry_type: string;
    title: string;
    description: string | null;
    category: string | null;
    status: string | null;
    animal_id: string | null;
    cost: number | null;
    quantity: number | null;
    due_date: string | null;
    completion_date: string | null;
    photo_urls: string[] | null;
    metadata: any;
    created_at: string;
    updated_at: string;
  }>;
}

export const getAllFieldReports = async (): Promise<FieldReportWithEntries[]> => {
  const { data: reports, error: reportsError } = await supabase
    .from('field_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (reportsError) {
    console.error('Error fetching field reports:', reportsError);
    throw reportsError;
  }

  const { data: entries, error: entriesError } = await supabase
    .from('field_report_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (entriesError) {
    console.error('Error fetching field report entries:', entriesError);
    throw entriesError;
  }

  // Group entries by field_report_id
  const entriesByReport = entries?.reduce((acc, entry) => {
    if (!acc[entry.field_report_id]) {
      acc[entry.field_report_id] = [];
    }
    acc[entry.field_report_id].push(entry);
    return acc;
  }, {} as Record<string, any[]>) || {};

  // Combine reports with their entries
  return (reports || []).map(report => ({
    ...report,
    entries: entriesByReport[report.id] || []
  }));
};

export const importFieldReports = async (reports: FieldReportWithEntries[]): Promise<number> => {
  let importCount = 0;

  for (const report of reports) {
    const { entries, ...reportData } = report;
    
    // Import the report first
    const { data: insertedReport, error: reportError } = await supabase
      .from('field_reports')
      .insert([reportData])
      .select()
      .single();

    if (reportError) {
      console.error('Error importing field report:', reportError);
      continue;
    }

    importCount++;

    // Import entries for this report
    if (entries && entries.length > 0) {
      const entriesWithReportId = entries.map(entry => ({
        ...entry,
        field_report_id: insertedReport.id
      }));

      const { error: entriesError } = await supabase
        .from('field_report_entries')
        .insert(entriesWithReportId);

      if (entriesError) {
        console.error('Error importing field report entries:', entriesError);
      } else {
        importCount += entries.length;
      }
    }
  }

  return importCount;
};
