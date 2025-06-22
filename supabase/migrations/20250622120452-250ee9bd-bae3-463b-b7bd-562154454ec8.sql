
-- Phase 1: Database Extensions (Non-Breaking)

-- Create properties table to manage multiple farm properties
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  center_lat NUMERIC NOT NULL,
  center_lng NUMERIC NOT NULL,
  zoom_level INTEGER DEFAULT 16,
  is_active BOOLEAN DEFAULT true,
  is_main_property BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cadastral parcels table for official cadastral data
CREATE TABLE public.cadastral_parcels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  parcel_id TEXT NOT NULL,
  boundary_coordinates JSONB NOT NULL,
  area_hectares NUMERIC,
  classification TEXT,
  owner_info TEXT,
  notes TEXT,
  imported_from_file TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add property_id to existing lot_polygons table (nullable to not break existing data)
ALTER TABLE public.lot_polygons 
ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;

-- Insert the main SkyRanch property with current coordinates
INSERT INTO public.properties (name, description, center_lat, center_lng, zoom_level, is_main_property, is_active)
VALUES (
  'SkyRanch Principal',
  'Propiedad principal de SkyRanch',
  40.31764444,
  -4.47409722,
  16,
  true,
  true
);

-- Update existing lot_polygons to reference main property
UPDATE public.lot_polygons 
SET property_id = (SELECT id FROM public.properties WHERE is_main_property = true LIMIT 1)
WHERE property_id IS NULL;

-- Add RLS policies for properties table
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all properties" 
  ON public.properties 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage properties" 
  ON public.properties 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Add RLS policies for cadastral_parcels table
ALTER TABLE public.cadastral_parcels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all cadastral parcels" 
  ON public.cadastral_parcels 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage cadastral parcels" 
  ON public.cadastral_parcels 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Add updated_at trigger for properties
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for cadastral_parcels
CREATE TRIGGER update_cadastral_parcels_updated_at
  BEFORE UPDATE ON public.cadastral_parcels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
