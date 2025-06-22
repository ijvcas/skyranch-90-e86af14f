
-- Complete cleanup and fix for cadastral system
-- Delete all existing cadastral parcels to start fresh
DELETE FROM public.cadastral_parcels;

-- Reset the sequence if needed
-- Note: UUID tables don't have sequences, but this ensures a clean state

-- Verify deletion
SELECT COUNT(*) as remaining_parcels FROM public.cadastral_parcels;
