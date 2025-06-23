
-- Add new columns to lots table to track auto-generation and source parcel
ALTER TABLE public.lots 
ADD COLUMN source_parcel_id uuid REFERENCES public.cadastral_parcels(id) ON DELETE SET NULL,
ADD COLUMN auto_generated boolean DEFAULT false NOT NULL;

-- Create index for better performance when querying auto-generated lots
CREATE INDEX idx_lots_source_parcel ON public.lots(source_parcel_id);
CREATE INDEX idx_lots_auto_generated ON public.lots(auto_generated);

-- Create a function to sync cadastral parcels with lots
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
  parcel_record record;
  existing_lot_id uuid;
  new_lot_id uuid;
  result_action text;
BEGIN
  -- Process all PROPIEDAD parcels
  FOR parcel_record IN 
    SELECT * FROM public.cadastral_parcels 
    WHERE status = 'PROPIEDAD' AND boundary_coordinates IS NOT NULL
  LOOP
    -- Check if lot already exists for this parcel
    SELECT id INTO existing_lot_id 
    FROM public.lots 
    WHERE source_parcel_id = parcel_record.id;
    
    IF existing_lot_id IS NOT NULL THEN
      -- Update existing lot
      UPDATE public.lots 
      SET 
        name = COALESCE(parcel_record.display_name, 'Lote ' || parcel_record.lot_number, 'Lote ' || parcel_record.parcel_id),
        size_hectares = parcel_record.area_hectares,
        description = 'Generado automáticamente desde parcela catastral ' || parcel_record.parcel_id,
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
        COALESCE(parcel_record.display_name, 'Lote ' || parcel_record.lot_number, 'Lote ' || parcel_record.parcel_id),
        'Generado automáticamente desde parcela catastral ' || parcel_record.parcel_id,
        parcel_record.area_hectares,
        'active',
        'good',
        parcel_record.id,
        true
      ) RETURNING id INTO new_lot_id;
      
      result_action := 'CREATED';
    END IF;
    
    -- Create or update polygon data
    INSERT INTO public.lot_polygons (lot_id, coordinates, area_hectares)
    VALUES (new_lot_id, parcel_record.boundary_coordinates, parcel_record.area_hectares)
    ON CONFLICT (lot_id) DO UPDATE SET
      coordinates = EXCLUDED.coordinates,
      area_hectares = EXCLUDED.area_hectares,
      updated_at = now();
    
    -- Return result
    action := result_action;
    lot_id := new_lot_id;
    parcel_id := parcel_record.parcel_id;
    lot_name := COALESCE(parcel_record.display_name, 'Lote ' || parcel_record.lot_number, 'Lote ' || parcel_record.parcel_id);
    RETURN NEXT;
  END LOOP;
  
  -- Clean up lots that no longer have corresponding PROPIEDAD parcels
  FOR parcel_record IN
    SELECT l.id, l.name, cp.parcel_id
    FROM public.lots l
    LEFT JOIN public.cadastral_parcels cp ON l.source_parcel_id = cp.id
    WHERE l.auto_generated = true 
    AND (cp.id IS NULL OR cp.status != 'PROPIEDAD')
  LOOP
    DELETE FROM public.lot_polygons WHERE lot_id = parcel_record.id;
    DELETE FROM public.lots WHERE id = parcel_record.id;
    
    action := 'DELETED';
    lot_id := parcel_record.id;
    parcel_id := COALESCE(parcel_record.parcel_id, 'UNKNOWN');
    lot_name := parcel_record.name;
    RETURN NEXT;
  END LOOP;
END;
$$;
