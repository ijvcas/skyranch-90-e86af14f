-- Create farms table
CREATE TABLE public.farms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  farm_type TEXT DEFAULT 'livestock',
  location TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create farm_members table for user-farm relationships
CREATE TABLE public.farm_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  invited_by UUID,
  UNIQUE(farm_id, user_id)
);

-- Enable RLS on farms table
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

-- Enable RLS on farm_members table  
ALTER TABLE public.farm_members ENABLE ROW LEVEL SECURITY;

-- Create policies for farms table
CREATE POLICY "Users can view farms they are members of" 
ON public.farms 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.farm_members 
  WHERE farm_id = farms.id AND user_id = auth.uid()
));

CREATE POLICY "Users can create their own farms" 
ON public.farms 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Farm owners can update their farms" 
ON public.farms 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.farm_members 
  WHERE farm_id = farms.id AND user_id = auth.uid() AND role = 'owner'
));

CREATE POLICY "Farm owners can delete their farms" 
ON public.farms 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.farm_members 
  WHERE farm_id = farms.id AND user_id = auth.uid() AND role = 'owner'
));

-- Create policies for farm_members table
CREATE POLICY "Users can view farm members of their farms" 
ON public.farm_members 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.farm_members fm 
  WHERE fm.farm_id = farm_members.farm_id AND fm.user_id = auth.uid()
));

CREATE POLICY "Users can create farm memberships for their farms" 
ON public.farm_members 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.farm_members 
    WHERE farm_id = farm_members.farm_id AND user_id = auth.uid() AND role = 'owner'
  )
);

CREATE POLICY "Farm owners can update memberships" 
ON public.farm_members 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.farm_members 
  WHERE farm_id = farm_members.farm_id AND user_id = auth.uid() AND role = 'owner'
));

CREATE POLICY "Users can leave farms or owners can remove members" 
ON public.farm_members 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.farm_members 
    WHERE farm_id = farm_members.farm_id AND user_id = auth.uid() AND role = 'owner'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for farms table
CREATE TRIGGER update_farms_updated_at
BEFORE UPDATE ON public.farms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();