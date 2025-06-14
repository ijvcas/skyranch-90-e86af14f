
-- Fix RLS policy for event_notifications table to allow inserts
ALTER TABLE event_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own event notifications" ON event_notifications;
DROP POLICY IF EXISTS "Users can view their own event notifications" ON event_notifications;
DROP POLICY IF EXISTS "Users can insert event notifications" ON event_notifications;
DROP POLICY IF EXISTS "Users can delete event notifications" ON event_notifications;

-- Create comprehensive RLS policies for event_notifications
CREATE POLICY "Users can view their own event notifications" ON event_notifications
    FOR SELECT USING (
        user_id = auth.uid()
    );

CREATE POLICY "Users can insert event notifications" ON event_notifications
    FOR INSERT WITH CHECK (
        -- Allow insert if the user is authenticated and either:
        -- 1. They are inserting for themselves, OR
        -- 2. They own the event being referenced
        auth.uid() IS NOT NULL AND (
            user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM calendar_events 
                WHERE calendar_events.id = event_notifications.event_id 
                AND calendar_events.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete event notifications" ON event_notifications
    FOR DELETE USING (
        -- Allow delete if the user owns the event
        EXISTS (
            SELECT 1 FROM calendar_events 
            WHERE calendar_events.id = event_notifications.event_id 
            AND calendar_events.user_id = auth.uid()
        )
    );

-- Also ensure calendar_events has proper RLS
CREATE POLICY IF NOT EXISTS "Users can manage their own events" ON calendar_events
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
