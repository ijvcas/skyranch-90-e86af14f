
-- Complete rewrite of sync function with corrected syntax
DROP FUNCTION IF EXISTS public.sync_propiedad_parcels_to_lots();

CREATE OR REPLACE FUNCTION public.sync_propiedad_parcels_to_lots()
RETURNS TABLE(
  action text,
  lot_id uuid,
  parcel_id text,
  lot_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  parcel_rec record;
  existing_lot_uuid uuid;
  new_lot_uuid uuid;
  action_result text;
  parcel_id_result text;
  lot_name_result text;
  cleanup_rec record;
BEGIN
  -- Process all PROPIEDAD parcels
  FOR parcel_rec IN 
    SELECT * FROM public.cadastral_parcels 
    WHERE status = 'PROPIEDAD' AND boundary_coordinates IS NOT NULL
  LOOP
    -- Check if lot already exists for this parcel
    SELECT id INTO existing_lot_uuid 
    FROM public.lots 
    WHERE source_parcel_id = parcel_rec.id;
    
    IF existing_lot_uuid IS NOT NULL THEN
      -- Update existing lot
      UPDATE public.lots 
      SET 
        name = COALESCE(parcel_rec.display_name, 'Lote ' || parcel_rec.lot_number, 'Lote ' || parcel_rec.parcel_id),
        size_hectares = parcel_rec.area_hectares,
        description = 'Generado automáticamente desde parcela catastral ' || parcel_rec.parcel_id,
        updated_at = now()
      WHERE id = existing_lot_uuid;
      
      action_result := 'UPDATED';
      new_lot_uuid := existing_lot_uuid;
    ELSE
      -- Create new lot
      INSERT INTO public.lots (
        name,
        description,
        size_hectares,
        status,
        grass_condition,
        source_parcel_id,
        auto_generated
      ) VALUES (
        COALESCE(parcel_rec.display_name, 'Lote ' || parcel_rec.lot_number, 'Lote ' || parcel_rec.parcel_id),
        'Generado automáticamente desde parcela catastral ' || parcel_rec.parcel_id,
        parcel_rec.area_hectares,
        'active',
        'good',
        parcel_rec.id,
        true
      ) RETURNING id INTO new_lot_uuid;
      
      action_result := 'CREATED';
    END IF;
    
    -- Create or update polygon data
    INSERT INTO public.lot_polygons (lot_id, coordinates, area_hectares)
    VALUES (new_lot_uuid, parcel_rec.boundary_coordinates, parcel_rec.area_hectares)
    ON CONFLICT (lot_id) DO UPDATE SET
      coordinates = EXCLUDED.coordinates,
      area_hectares = EXCLUDED.area_hectares,
      updated_at = now();
    
    -- Prepare return values
    parcel_id_result := parcel_rec.parcel_id;
    lot_name_result := COALESCE(parcel_rec.display_name, 'Lote ' || parcel_rec.lot_number, 'Lote ' || parcel_rec.parcel_id);
    
    -- Return result
    action := action_result;
    lot_id := new_lot_uuid;
    parcel_id := parcel_id_result;
    lot_name := lot_name_result;
    RETURN NEXT;
  END LOOP;
  
  -- Clean up lots that no longer have corresponding PROPIEDAD parcels
  FOR cleanup_rec IN
    SELECT l.id as lot_uuid, l.name as lot_name_val, cp.parcel_id as parcel_id_val
    FROM public.lots l
    LEFT JOIN public.cadastral_parcels cp ON l.source_parcel_id = cp.id
    WHERE l.auto_generated = true 
    AND (cp.id IS NULL OR cp.status != 'PROPIEDAD')
  LOOP
    -- Delete polygon first (foreign key constraint)
    DELETE FROM public.lot_polygons WHERE lot_id = cleanup_rec.lot_uuid;
    
    -- Delete the lot
    DELETE FROM public.lots WHERE id = cleanup_rec.lot_uuid;
    
    -- Return deletion result
    action := 'DELETED';
    lot_id := cleanup_rec.lot_uuid;
    parcel_id := COALESCE(cleanup_rec.parcel_id_val, 'UNKNOWN');
    lot_name := cleanup_rec.lot_name_val;
    RETURN NEXT;
  END LOOP;
END;
$$;
