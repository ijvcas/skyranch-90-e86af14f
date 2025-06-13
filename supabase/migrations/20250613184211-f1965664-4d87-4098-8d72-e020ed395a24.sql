
-- Create app_version table to store version information
CREATE TABLE public.app_version (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  build_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  is_current BOOLEAN NOT NULL DEFAULT false
);

-- Create unique constraint to ensure only one current version
CREATE UNIQUE INDEX idx_app_version_current ON public.app_version (is_current) WHERE is_current = true;

-- Enable RLS
ALTER TABLE public.app_version ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read current version
CREATE POLICY "Everyone can view current version"
  ON public.app_version
  FOR SELECT
  USING (is_current = true);

-- Allow authenticated users to create new versions
CREATE POLICY "Authenticated users can create versions"
  ON public.app_version
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Insert initial version
INSERT INTO public.app_version (version, build_number, notes, is_current)
VALUES ('2.3.0', 1, 'Initial version', true);
