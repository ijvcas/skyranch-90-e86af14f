
-- Create a table to store support information in the database
CREATE TABLE public.support_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  hours TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.support_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read support settings (public information)
CREATE POLICY "Anyone can view support settings" 
  ON public.support_settings 
  FOR SELECT 
  USING (true);

-- Create policy to allow authenticated users to insert/update support settings
-- In a real app, you might want to restrict this to admin users only
CREATE POLICY "Authenticated users can modify support settings" 
  ON public.support_settings 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- Add trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_support_settings_updated_at
  BEFORE UPDATE ON public.support_settings
  FOR Each ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default support settings
INSERT INTO public.support_settings (email, phone, hours)
VALUES ('soporte@skyranch.com', '+1 (555) 123-4567', 'Lunes a Viernes 8:00 AM - 6:00 PM');
