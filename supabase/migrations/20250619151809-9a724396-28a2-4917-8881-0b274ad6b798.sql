
-- Create dashboard_banners table
CREATE TABLE public.dashboard_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT 'Dashboard Banner',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dashboard_banners ENABLE ROW LEVEL SECURITY;

-- Create policies for dashboard banners
CREATE POLICY "Anyone can view active dashboard banners" 
  ON public.dashboard_banners 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage dashboard banners" 
  ON public.dashboard_banners 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_dashboard_banners_updated_at
  BEFORE UPDATE ON public.dashboard_banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default banner
INSERT INTO public.dashboard_banners (image_url, alt_text, is_active)
VALUES ('/lovable-uploads/d3c33c19-f7cd-441e-884f-371ed6481179.png', 'Dashboard Banner', true);
