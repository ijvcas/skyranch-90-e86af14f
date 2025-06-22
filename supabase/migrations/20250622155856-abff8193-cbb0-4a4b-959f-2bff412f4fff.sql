
-- Update the main property center to the correct SkyRanch coordinates
UPDATE public.properties 
SET 
  center_lat = 40.317635,
  center_lng = -4.474248,
  updated_at = now()
WHERE is_main_property = true;

-- Transform all cadastral parcel coordinates to the correct location
-- Calculate offset: +0.216635 lat, -0.004002 lng from current coordinates
UPDATE public.cadastral_parcels
SET 
  boundary_coordinates = (
    SELECT jsonb_agg(
      jsonb_build_object(
        'lat', (coord->>'lat')::numeric + 0.216635,
        'lng', (coord->>'lng')::numeric - 0.004002
      )
    )
    FROM jsonb_array_elements(boundary_coordinates) AS coord
  ),
  updated_at = now()
WHERE property_id = (SELECT id FROM public.properties WHERE is_main_property = true LIMIT 1);

-- Update lot_polygons property_id reference to use the main property
UPDATE public.lot_polygons 
SET property_id = (SELECT id FROM public.properties WHERE is_main_property = true LIMIT 1)
WHERE property_id IS NULL;
