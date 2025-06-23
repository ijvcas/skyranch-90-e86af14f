
-- Create field_reports table for main report metadata
CREATE TABLE public.field_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  location_coordinates TEXT,
  weather_conditions TEXT,
  temperature NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Create field_report_entries table for individual report items
CREATE TABLE public.field_report_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_report_id UUID NOT NULL REFERENCES public.field_reports(id) ON DELETE CASCADE,
  animal_id UUID,
  entry_type TEXT NOT NULL, -- 'pregnancy', 'veterinary', 'health', 'breeding', 'infrastructure', 'general'
  category TEXT, -- subcategory within entry_type
  title TEXT NOT NULL,
  description TEXT,
  cost NUMERIC,
  quantity INTEGER,
  status TEXT,
  due_date DATE,
  completion_date DATE,
  metadata JSONB, -- flexible field for type-specific data
  photo_urls TEXT[], -- array of photo URLs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for field_reports
ALTER TABLE public.field_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own field reports" 
  ON public.field_reports 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own field reports" 
  ON public.field_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own field reports" 
  ON public.field_reports 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own field reports" 
  ON public.field_reports 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for field_report_entries
ALTER TABLE public.field_report_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view entries of their own field reports" 
  ON public.field_report_entries 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.field_reports fr 
      WHERE fr.id = field_report_id AND fr.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create entries for their own field reports" 
  ON public.field_report_entries 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.field_reports fr 
      WHERE fr.id = field_report_id AND fr.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update entries of their own field reports" 
  ON public.field_report_entries 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.field_reports fr 
      WHERE fr.id = field_report_id AND fr.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete entries of their own field reports" 
  ON public.field_report_entries 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.field_reports fr 
      WHERE fr.id = field_report_id AND fr.user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_field_reports_user_id ON public.field_reports(user_id);
CREATE INDEX idx_field_reports_created_at ON public.field_reports(created_at);
CREATE INDEX idx_field_report_entries_field_report_id ON public.field_report_entries(field_report_id);
CREATE INDEX idx_field_report_entries_animal_id ON public.field_report_entries(animal_id);
CREATE INDEX idx_field_report_entries_entry_type ON public.field_report_entries(entry_type);

-- Add trigger for updated_at field
CREATE OR REPLACE TRIGGER update_field_reports_updated_at
  BEFORE UPDATE ON public.field_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_field_report_entries_updated_at
  BEFORE UPDATE ON public.field_report_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
