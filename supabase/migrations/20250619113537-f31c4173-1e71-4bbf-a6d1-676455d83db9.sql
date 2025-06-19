
-- Fix all security warnings by adding search_path configuration to functions
-- This prevents potential security vulnerabilities from search_path manipulation

-- 1. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- 2. Fix cleanup_old_notifications function  
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notifications 
  WHERE read = true 
    AND created_at < (now() - interval '30 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- 3. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- 4. Fix get_auth_users function
CREATE OR REPLACE FUNCTION public.get_auth_users()
RETURNS TABLE(id uuid, email text, raw_user_meta_data jsonb, created_at timestamp with time zone)
LANGUAGE sql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data,
    au.created_at
  FROM auth.users au
  WHERE au.email IS NOT NULL;
$$;

-- 5. Fix sync_auth_users_to_app_users function
CREATE OR REPLACE FUNCTION public.sync_auth_users_to_app_users()
RETURNS void AS $$
BEGIN
  -- Insert missing users from auth.users into app_users
  INSERT INTO public.app_users (id, name, email, role, is_active, created_by, phone)
  SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as name,
    au.email,
    'worker' as role,
    true as is_active,
    au.id as created_by,
    COALESCE(au.raw_user_meta_data->>'phone', '') as phone
  FROM auth.users au
  LEFT JOIN public.app_users apu ON au.id = apu.id
  WHERE apu.id IS NULL
    AND au.email IS NOT NULL
    AND au.email_confirmed_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Performance optimizations: Add missing indexes for frequently queried columns
-- These will address many of the 131 performance warnings

-- Index for animals table queries
CREATE INDEX IF NOT EXISTS idx_animals_user_id ON public.animals(user_id);
CREATE INDEX IF NOT EXISTS idx_animals_species ON public.animals(species);
CREATE INDEX IF NOT EXISTS idx_animals_current_lot_id ON public.animals(current_lot_id);
CREATE INDEX IF NOT EXISTS idx_animals_created_at ON public.animals(created_at);
CREATE INDEX IF NOT EXISTS idx_animals_health_status ON public.animals(health_status);

-- Index for breeding_records table queries
CREATE INDEX IF NOT EXISTS idx_breeding_records_user_id ON public.breeding_records(user_id);
CREATE INDEX IF NOT EXISTS idx_breeding_records_mother_id ON public.breeding_records(mother_id);
CREATE INDEX IF NOT EXISTS idx_breeding_records_father_id ON public.breeding_records(father_id);
CREATE INDEX IF NOT EXISTS idx_breeding_records_status ON public.breeding_records(status);
CREATE INDEX IF NOT EXISTS idx_breeding_records_breeding_date ON public.breeding_records(breeding_date);
CREATE INDEX IF NOT EXISTS idx_breeding_records_expected_due_date ON public.breeding_records(expected_due_date);

-- Index for health_records table queries
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON public.health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_animal_id ON public.health_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_health_records_record_type ON public.health_records(record_type);
CREATE INDEX IF NOT EXISTS idx_health_records_date_administered ON public.health_records(date_administered);
CREATE INDEX IF NOT EXISTS idx_health_records_next_due_date ON public.health_records(next_due_date);

-- Index for calendar_events table queries
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_animal_id ON public.calendar_events(animal_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_type ON public.calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_date ON public.calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON public.calendar_events(status);

-- Index for lots table queries
CREATE INDEX IF NOT EXISTS idx_lots_user_id ON public.lots(user_id);
CREATE INDEX IF NOT EXISTS idx_lots_status ON public.lots(status);
CREATE INDEX IF NOT EXISTS idx_lots_grass_condition ON public.lots(grass_condition);

-- Index for notifications table queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);

-- Index for animal_lot_assignments table queries
CREATE INDEX IF NOT EXISTS idx_animal_lot_assignments_user_id ON public.animal_lot_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_animal_lot_assignments_animal_id ON public.animal_lot_assignments(animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_lot_assignments_lot_id ON public.animal_lot_assignments(lot_id);
CREATE INDEX IF NOT EXISTS idx_animal_lot_assignments_assigned_date ON public.animal_lot_assignments(assigned_date);

-- Index for animal_attachments table queries
CREATE INDEX IF NOT EXISTS idx_animal_attachments_user_id ON public.animal_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_animal_attachments_animal_id ON public.animal_attachments(animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_attachments_attachment_type ON public.animal_attachments(attachment_type);

-- Index for lot_rotations table queries
CREATE INDEX IF NOT EXISTS idx_lot_rotations_user_id ON public.lot_rotations(user_id);
CREATE INDEX IF NOT EXISTS idx_lot_rotations_lot_id ON public.lot_rotations(lot_id);
CREATE INDEX IF NOT EXISTS idx_lot_rotations_from_lot_id ON public.lot_rotations(from_lot_id);
CREATE INDEX IF NOT EXISTS idx_lot_rotations_rotation_date ON public.lot_rotations(rotation_date);

-- Index for event_notifications table queries
CREATE INDEX IF NOT EXISTS idx_event_notifications_user_id ON public.event_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_event_notifications_event_id ON public.event_notifications(event_id);

-- Index for lot_polygons table queries
CREATE INDEX IF NOT EXISTS idx_lot_polygons_lot_id ON public.lot_polygons(lot_id);

-- Index for offspring table queries
CREATE INDEX IF NOT EXISTS idx_offspring_breeding_record_id ON public.offspring(breeding_record_id);
CREATE INDEX IF NOT EXISTS idx_offspring_animal_id ON public.offspring(animal_id);

-- Index for reports table queries
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_type ON public.reports(report_type);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_animals_user_species ON public.animals(user_id, species);
CREATE INDEX IF NOT EXISTS idx_breeding_records_user_status ON public.breeding_records(user_id, status);
CREATE INDEX IF NOT EXISTS idx_health_records_animal_type ON public.health_records(animal_id, record_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON public.calendar_events(user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);

-- Update table statistics to help query planner
ANALYZE public.animals;
ANALYZE public.breeding_records;
ANALYZE public.health_records;
ANALYZE public.calendar_events;
ANALYZE public.lots;
ANALYZE public.notifications;
ANALYZE public.animal_lot_assignments;
ANALYZE public.animal_attachments;
ANALYZE public.lot_rotations;
ANALYZE public.event_notifications;
ANALYZE public.lot_polygons;
ANALYZE public.offspring;
ANALYZE public.reports;
