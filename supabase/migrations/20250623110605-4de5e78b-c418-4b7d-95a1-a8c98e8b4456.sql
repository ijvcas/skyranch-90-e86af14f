
-- Update the function to use lot_number for naming instead of display_name
CREATE OR REPLACE FUNCTION public.create_lots_from_propiedad_parcels()
RETURNS TABLE(
  lots_created integer,
  success boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  parcel_record record;
  lots_count integer := 0;
  new_lot_uuid uuid;
BEGIN
  -- Simple loop through PROPIEDAD parcels
  FOR parcel_record IN 
    SELECT cp.id, cp.parcel_id, cp.display_name, cp.lot_number, cp.boundary_coordinates, cp.area_hectares
    FROM public.cadastral_parcels cp
    WHERE cp.status = 'PROPIEDAD' 
    AND cp.boundary_coordinates IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.lots l WHERE l.source_parcel_id = cp.id
    )
  LOOP
    -- Create new lot with official lot number as name
    INSERT INTO public.lots (
      name,
      description,
      size_hectares,
      status,
      grass_condition,
      source_parcel_id,
      auto_generated
    ) VALUES (
      CASE 
        WHEN parcel_record.lot_number IS NOT NULL AND parcel_record.lot_number != '' 
        THEN 'Lote ' || parcel_record.lot_number
        ELSE COALESCE(parcel_record.display_name, 'Lote ' || parcel_record.parcel_id)
      END,
      'Generado automáticamente desde parcela catastral ' || parcel_record.parcel_id,
      parcel_record.area_hectares,
      'active',
      'good',
      parcel_record.id,
      true
    ) RETURNING id INTO new_lot_uuid;
    
    -- Create polygon data
    INSERT INTO public.lot_polygons (lot_id, coordinates, area_hectares)
    VALUES (new_lot_uuid, parcel_record.boundary_coordinates, parcel_record.area_hectares);
    
    lots_count := lots_count + 1;
  END LOOP;
  
  -- Return simple result
  lots_created := lots_count;
  success := true;
  message := 'Successfully created ' || lots_count || ' lots from PROPIEDAD parcels';
  RETURN NEXT;
END;
$$;
