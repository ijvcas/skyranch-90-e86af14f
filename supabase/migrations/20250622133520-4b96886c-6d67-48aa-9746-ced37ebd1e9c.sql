
-- Add missing columns to cadastral_parcels table
ALTER TABLE public.cadastral_parcels 
ADD COLUMN display_name TEXT,
ADD COLUMN lot_number TEXT,
ADD COLUMN status TEXT DEFAULT 'SHOPPING_LIST';
