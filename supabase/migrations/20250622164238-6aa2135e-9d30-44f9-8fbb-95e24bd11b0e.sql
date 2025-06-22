
-- Step 1: Clear all incorrectly imported cadastral parcels
DELETE FROM public.cadastral_parcels 
WHERE created_at >= CURRENT_DATE;

-- Step 2: Reset the property center to the correct SkyRanch coordinates
UPDATE public.properties 
SET 
  center_lat = 40.317635,
  center_lng = -4.474248,
  updated_at = now()
WHERE is_main_property = true;

-- Step 3: Verify we have the main property with correct coordinates
SELECT name, center_lat, center_lng, is_main_property 
FROM public.properties 
WHERE is_main_property = true;

-- Step 4: Check remaining parcel count (should be 0 after deletion)
SELECT COUNT(*) as remaining_parcels 
FROM public.cadastral_parcels;
