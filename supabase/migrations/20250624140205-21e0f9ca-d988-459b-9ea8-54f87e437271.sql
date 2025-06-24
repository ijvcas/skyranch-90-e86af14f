
-- Drop the existing function first
DROP FUNCTION IF EXISTS public.create_lots_from_propiedad_parcels();

-- Create the updated function with bidirectional synchronization
CREATE OR REPLACE FUNCTION public.create_lots_from_propiedad_parcels()
RETURNS TABLE(
  lots_created integer,
  lots_deleted integer,
  success boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  parcel_record record;
  lots_created_count integer := 0;
  lots_deleted_count integer := 0;
  new_lot_uuid uuid;
  cleanup_record record;
BEGIN
  -- First, clean up lots that are no longer PROPIEDAD
  FOR cleanup_record IN 
    SELECT l.id, l.name, cp.parcel_id, cp.status
    FROM public.lots l
    LEFT JOIN public.cadastral_parcels cp ON l.source_parcel_id = cp.id
    WHERE l.auto_generated = true 
    AND (cp.id IS NULL OR cp.status != 'PROPIEDAD')
  LOOP
    -- Delete polygon data first (foreign key constraint)
    DELETE FROM public.lot_polygons WHERE lot_id = cleanup_record.id;
    
    -- Delete the lot
    DELETE FROM public.lots WHERE id = cleanup_record.id;
    
    lots_deleted_count := lots_deleted_count + 1;
  END LOOP;
  
  -- Then, create lots for new PROPIEDAD parcels
  FOR parcel_record IN 
    SELECT cp.id, cp.parcel_id, cp.display_name, cp.lot_number, cp.boundary_coordinates, cp.area_hectares
    FROM public.cadastral_parcels cp
    WHERE cp.status = 'PROPIEDAD' 
    AND cp.boundary_coordinates IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.lots l WHERE l.source_parcel_id = cp.id AND l.auto_generated = true
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
      auto_generated,
      lot_type
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
      true,
      'property'
    ) RETURNING id INTO new_lot_uuid;
    
    -- Create polygon data
    INSERT INTO public.lot_polygons (lot_id, coordinates, area_hectares)
    VALUES (new_lot_uuid, parcel_record.boundary_coordinates, parcel_record.area_hectares);
    
    lots_created_count := lots_created_count + 1;
  END LOOP;
  
  -- Return comprehensive result
  lots_created := lots_created_count;
  lots_deleted := lots_deleted_count;
  success := true;
  message := 'Sincronización completada: ' || lots_created_count || ' lotes creados, ' || lots_deleted_count || ' lotes eliminados';
  RETURN NEXT;
END;
$$;
