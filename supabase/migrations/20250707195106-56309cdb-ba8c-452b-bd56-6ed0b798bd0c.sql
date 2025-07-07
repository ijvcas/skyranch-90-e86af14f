-- Remove farm-related tables that were incorrectly added to SkyRanch
DROP TABLE IF EXISTS public.farm_members CASCADE;
DROP TABLE IF EXISTS public.farms CASCADE;