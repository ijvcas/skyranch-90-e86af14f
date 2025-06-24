
-- Add indexes to improve backup performance on large datasets
CREATE INDEX IF NOT EXISTS idx_field_reports_user_created ON public.field_reports(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_field_report_entries_report_id ON public.field_report_entries(field_report_id);
CREATE INDEX IF NOT EXISTS idx_health_records_animal_user ON public.health_records(animal_id, user_id);
CREATE INDEX IF NOT EXISTS idx_breeding_records_user_date ON public.breeding_records(user_id, breeding_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON public.calendar_events(user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_lot_polygons_lot_id ON public.lot_polygons(lot_id);
CREATE INDEX IF NOT EXISTS idx_animal_lot_assignments_animal ON public.animal_lot_assignments(animal_id);
CREATE INDEX IF NOT EXISTS idx_cadastral_parcels_property ON public.cadastral_parcels(property_id);

-- Create a backup metadata table to track backup integrity
CREATE TABLE IF NOT EXISTS public.backup_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_name TEXT NOT NULL,
  backup_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_records INTEGER NOT NULL DEFAULT 0,
  categories_included TEXT[] NOT NULL,
  backup_version TEXT NOT NULL DEFAULT '1.0.0',
  checksum TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RLS policies for backup metadata
ALTER TABLE public.backup_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own backup metadata" 
  ON public.backup_metadata 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own backup metadata" 
  ON public.backup_metadata 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
