
-- Add 8 new columns to the animals table for great-grandparents (3rd generation back)
ALTER TABLE public.animals 
ADD COLUMN maternal_great_grandmother_maternal_id text,
ADD COLUMN maternal_great_grandfather_maternal_id text,
ADD COLUMN maternal_great_grandmother_paternal_id text,
ADD COLUMN maternal_great_grandfather_paternal_id text,
ADD COLUMN paternal_great_grandmother_maternal_id text,
ADD COLUMN paternal_great_grandfather_maternal_id text,
ADD COLUMN paternal_great_grandmother_paternal_id text,
ADD COLUMN paternal_great_grandfather_paternal_id text;

-- Add indexes for the new great-grandparent columns to improve query performance
CREATE INDEX IF NOT EXISTS idx_animals_maternal_great_grandmother_maternal ON public.animals(maternal_great_grandmother_maternal_id);
CREATE INDEX IF NOT EXISTS idx_animals_maternal_great_grandfather_maternal ON public.animals(maternal_great_grandfather_maternal_id);
CREATE INDEX IF NOT EXISTS idx_animals_maternal_great_grandmother_paternal ON public.animals(maternal_great_grandmother_paternal_id);
CREATE INDEX IF NOT EXISTS idx_animals_maternal_great_grandfather_paternal ON public.animals(maternal_great_grandfather_paternal_id);
CREATE INDEX IF NOT EXISTS idx_animals_paternal_great_grandmother_maternal ON public.animals(paternal_great_grandmother_maternal_id);
CREATE INDEX IF NOT EXISTS idx_animals_paternal_great_grandfather_maternal ON public.animals(paternal_great_grandfather_maternal_id);
CREATE INDEX IF NOT EXISTS idx_animals_paternal_great_grandmother_paternal ON public.animals(paternal_great_grandmother_paternal_id);
CREATE INDEX IF NOT EXISTS idx_animals_paternal_great_grandfather_paternal ON public.animals(paternal_great_grandfather_paternal_id);

-- Update table statistics
ANALYZE public.animals;
