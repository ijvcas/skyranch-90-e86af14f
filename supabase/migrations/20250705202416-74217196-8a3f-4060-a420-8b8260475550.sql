-- Update LUNA's breeding record to confirm pregnancy
UPDATE breeding_records 
SET 
  pregnancy_confirmed = true,
  pregnancy_confirmation_date = CURRENT_DATE,
  status = 'confirmed_pregnant',
  pregnancy_method = 'visual'
WHERE mother_id = (
  SELECT id FROM animals WHERE name ILIKE '%luna%' LIMIT 1
) 
AND pregnancy_confirmed = false;