
-- Fix property coordinates to ensure map loads at correct SkyRanch location
UPDATE public.properties 
SET 
  center_lat = 40.317635,
  center_lng = -4.474248,
  zoom_level = 18
WHERE is_main_property = true;

-- If no main property exists, update all properties to SkyRanch location
UPDATE public.properties 
SET 
  center_lat = 40.317635,
  center_lng = -4.474248,
  zoom_level = 18
WHERE NOT EXISTS (SELECT 1 FROM public.properties WHERE is_main_property = true);
