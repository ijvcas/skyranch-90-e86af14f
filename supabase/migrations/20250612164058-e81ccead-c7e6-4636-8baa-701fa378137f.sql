
-- Create table to store which users should be notified for each calendar event
CREATE TABLE public.event_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Add Row Level Security
ALTER TABLE public.event_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for event_notifications
CREATE POLICY "Users can view event notifications they are part of" 
  ON public.event_notifications 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.calendar_events ce 
      WHERE ce.id = event_id AND ce.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create event notifications for their events" 
  ON public.event_notifications 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calendar_events ce 
      WHERE ce.id = event_id AND ce.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete event notifications for their events" 
  ON public.event_notifications 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.calendar_events ce 
      WHERE ce.id = event_id AND ce.user_id = auth.uid()
    )
  );
