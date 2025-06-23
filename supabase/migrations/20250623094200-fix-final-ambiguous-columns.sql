
-- Final fix for ambiguous column references
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
  existing_lot_id uuid;
  new_lot_id uuid;
  result_action text;
  result_parcel_id text;
  result_lot_name text;
  cleanup_rec record;
BEGIN
  -- Process all PROPIEDAD parcels
  FOR parcel_rec IN 
    SELECT * FROM public.cadastral_parcels 
    WHERE status = 'PROPIEDAD' AND boundary_coordinates IS NOT NULL
  LOOP
    -- Check if lot already exists for this parcel
    SELECT l.id INTO existing_lot_id 
    FROM public.lots l
    WHERE l.source_parcel_id = parcel_rec.id;
    
    IF existing_lot_id IS NOT NULL THEN
      -- Update existing lot
      UPDATE public.lots 
      SET 
        name = COALESCE(parcel_rec.display_name, 'Lote ' || parcel_rec.lot_number, 'Lote ' || parcel_rec.parcel_id),
        size_hectares = parcel_rec.area_hectares,
        description = 'Generado automáticamente desde parcela catastral ' || parcel_rec.parcel_id,
        updated_at = now()
      WHERE id = existing_lot_id;
      
      result_action := 'UPDATED';
      new_lot_id := existing_lot_id;
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
      ) RETURNING id INTO new_lot_id;
      
      result_action := 'CREATED';
    END IF;
    
    -- Create or update polygon data
    INSERT INTO public.lot_polygons (lot_id, coordinates, area_hectares)
    VALUES (new_lot_id, parcel_rec.boundary_coordinates, parcel_rec.area_hectares)
    ON CONFLICT (lot_id) DO UPDATE SET
      coordinates = EXCLUDED.coordinates,
      area_hectares = EXCLUDED.area_hectares,
      updated_at = now();
    
    -- Prepare return values
    result_parcel_id := parcel_rec.parcel_id;
    result_lot_name := COALESCE(parcel_rec.display_name, 'Lote ' || parcel_rec.lot_number, 'Lote ' || parcel_rec.parcel_id);
    
    -- Return result
    sync_propiedad_parcels_to_lots.action := result_action;
    sync_propiedad_parcels_to_lots.lot_id := new_lot_id;
    sync_propiedad_parcels_to_lots.parcel_id := result_parcel_id;
    sync_propiedad_parcels_to_lots.lot_name := result_lot_name;
    RETURN NEXT;
  END LOOP;
  
  -- Clean up lots that no longer have corresponding PROPIEDAD parcels
  FOR cleanup_rec IN
    SELECT l.id as target_lot_id, l.name as target_lot_name, cp.parcel_id as target_parcel_id
    FROM public.lots l
    LEFT JOIN public.cadastral_parcels cp ON l.source_parcel_id = cp.id
    WHERE l.auto_generated = true 
    AND (cp.id IS NULL OR cp.status != 'PROPIEDAD')
  LOOP
    -- Delete polygon first (foreign key constraint)
    DELETE FROM public.lot_polygons WHERE public.lot_polygons.lot_id = cleanup_rec.target_lot_id;
    
    -- Delete the lot
    DELETE FROM public.lots WHERE public.lots.id = cleanup_rec.target_lot_id;
    
    -- Return deletion result
    sync_propiedad_parcels_to_lots.action := 'DELETED';
    sync_propiedad_parcels_to_lots.lot_id := cleanup_rec.target_lot_id;
    sync_propiedad_parcels_to_lots.parcel_id := COALESCE(cleanup_rec.target_parcel_id, 'UNKNOWN');
    sync_propiedad_parcels_to_lots.lot_name := cleanup_rec.target_lot_name;
    RETURN NEXT;
  END LOOP;
END;
$$;
