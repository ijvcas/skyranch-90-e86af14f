
-- Delete all existing cadastral parcels
DELETE FROM public.cadastral_parcels;

-- Verify the deletion was successful (should return 0)
SELECT COUNT(*) as remaining_parcels FROM public.cadastral_parcels;
