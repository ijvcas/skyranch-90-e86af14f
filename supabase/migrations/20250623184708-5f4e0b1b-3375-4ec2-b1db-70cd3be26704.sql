
-- Add financial tracking fields to cadastral_parcels table
ALTER TABLE public.cadastral_parcels 
ADD COLUMN total_cost NUMERIC,
ADD COLUMN cost_per_square_meter NUMERIC,
ADD COLUMN seller_name TEXT,
ADD COLUMN acquisition_date DATE,
ADD COLUMN acquisition_notes TEXT,
ADD COLUMN contract_reference TEXT;

-- Add index for better performance when querying by status
CREATE INDEX IF NOT EXISTS idx_cadastral_parcels_status ON public.cadastral_parcels(status);

-- Add index for acquisition date queries
CREATE INDEX IF NOT EXISTS idx_cadastral_parcels_acquisition_date ON public.cadastral_parcels(acquisition_date);
