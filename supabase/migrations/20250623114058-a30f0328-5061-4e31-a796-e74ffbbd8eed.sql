
-- Add lot_type column to distinguish between property and pasture lots
ALTER TABLE public.lots 
ADD COLUMN lot_type text DEFAULT 'pasture' CHECK (lot_type IN ('property', 'pasture'));

-- Update existing auto-generated lots to be property type
UPDATE public.lots 
SET lot_type = 'property' 
WHERE auto_generated = true;

-- Add index for better performance when filtering by lot type
CREATE INDEX idx_lots_lot_type ON public.lots(lot_type);

-- Add index for lot_type and status combination (common query pattern)
CREATE INDEX idx_lots_type_status ON public.lots(lot_type, status);
