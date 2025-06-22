
-- Complete database cleanup and coordinate system reset
DELETE FROM public.cadastral_parcels;

-- Reset property coordinates to exact SkyRanch location
UPDATE public.properties 
SET 
  center_lat = 40.317635,
  center_lng = -4.474248,
  zoom_level = 18
WHERE is_main_property = true;

-- Verify cleanup
SELECT COUNT(*) as remaining_parcels FROM public.cadastral_parcels;
SELECT name, center_lat, center_lng FROM public.properties WHERE is_main_property = true;
