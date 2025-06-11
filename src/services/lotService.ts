import { supabase } from '@/integrations/supabase/client';
import type { Lot, LotAssignment, LotRotation } from '@/stores/lotStore';

export const getAllLots = async (): Promise<Lot[]> => {
  try {
    console.log('🔍 Fetching all lots (shared across all users)...');
    const { data, error } = await supabase
      .from('lots')
      .select(`
        *,
        animal_lot_assignments!left(
          id,
          animal_id,
          removed_date
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching lots:', error);
      return [];
    }

    console.log('✅ Successfully fetched shared lots:', data?.length || 0);
    
    // Transform data and count current animals
    return (data || []).map(lot => ({
      id: lot.id,
      name: lot.name,
      description: lot.description,
      sizeHectares: lot.size_hectares,
      capacity: lot.capacity,
      grassType: lot.grass_type,
      locationCoordinates: lot.location_coordinates,
      status: lot.status,
      lastRotationDate: lot.last_rotation_date,
      nextRotationDate: lot.next_rotation_date,
      grassCondition: lot.grass_condition,
      currentAnimals: lot.animal_lot_assignments?.filter((assignment: any) => !assignment.removed_date).length || 0
    }));
  } catch (error) {
    console.error('❌ Unexpected error in getAllLots:', error);
    return [];
  }
};

export const getLot = async (id: string): Promise<Lot | null> => {
  try {
    const { data, error } = await supabase
      .from('lots')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching lot:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      sizeHectares: data.size_hectares,
      capacity: data.capacity,
      grassType: data.grass_type,
      locationCoordinates: data.location_coordinates,
      status: data.status,
      lastRotationDate: data.last_rotation_date,
      nextRotationDate: data.next_rotation_date,
      grassCondition: data.grass_condition,
    };
  } catch (error) {
    console.error('Unexpected error in getLot:', error);
    return null;
  }
};

export const addLot = async (lot: Omit<Lot, 'id'>): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user');
      return false;
    }

    console.log('Creating lot for user:', user.id);
    
    const { error } = await supabase
      .from('lots')
      .insert({
        name: lot.name,
        description: lot.description,
        size_hectares: lot.sizeHectares,
        capacity: lot.capacity,
        grass_type: lot.grassType,
        location_coordinates: lot.locationCoordinates,
        status: lot.status,
        last_rotation_date: lot.lastRotationDate,
        next_rotation_date: lot.nextRotationDate,
        grass_condition: lot.grassCondition,
        user_id: user.id, // Required until SQL script is run
      });

    if (error) {
      console.error('Error adding lot:', error);
      return false;
    }

    console.log('✅ Lot added successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error in addLot:', error);
    return false;
  }
};

export const updateLot = async (id: string, lot: Omit<Lot, 'id'>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lots')
      .update({
        name: lot.name,
        description: lot.description,
        size_hectares: lot.sizeHectares,
        capacity: lot.capacity,
        grass_type: lot.grassType,
        location_coordinates: lot.locationCoordinates,
        status: lot.status,
        last_rotation_date: lot.lastRotationDate,
        next_rotation_date: lot.nextRotationDate,
        grass_condition: lot.grassCondition,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating lot:', error);
      return false;
    }

    console.log('✅ Lot updated successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error in updateLot:', error);
    return false;
  }
};

export const deleteLot = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lots')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting lot:', error);
      return false;
    }

    console.log('✅ Lot deleted successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error in deleteLot:', error);
    return false;
  }
};

export const getLotAssignments = async (lotId?: string): Promise<LotAssignment[]> => {
  try {
    let query = supabase
      .from('animal_lot_assignments')
      .select(`
        *,
        animals:animal_id(name, tag)
      `)
      .order('assigned_date', { ascending: false });

    if (lotId) {
      query = query.eq('lot_id', lotId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching lot assignments:', error);
      return [];
    }

    return (data || []).map(assignment => ({
      id: assignment.id,
      animalId: assignment.animal_id,
      lotId: assignment.lot_id,
      assignedDate: assignment.assigned_date,
      removedDate: assignment.removed_date,
      assignmentReason: assignment.assignment_reason,
      notes: assignment.notes,
      animalName: assignment.animals?.name,
      animalTag: assignment.animals?.tag,
    }));
  } catch (error) {
    console.error('Unexpected error in getLotAssignments:', error);
    return [];
  }
};

export const assignAnimalToLot = async (
  animalId: string,
  lotId: string,
  reason?: string,
  notes?: string
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user');
      return false;
    }

    // First, remove animal from current lot if any
    await removeAnimalFromCurrentLot(animalId);

    // Create new assignment
    const { error: assignmentError } = await supabase
      .from('animal_lot_assignments')
      .insert({
        animal_id: animalId,
        lot_id: lotId,
        user_id: user.id,
        assignment_reason: reason,
        notes: notes,
      });

    if (assignmentError) {
      console.error('Error creating lot assignment:', assignmentError);
      return false;
    }

    // Update animal's current lot
    const { error: animalError } = await supabase
      .from('animals')
      .update({ current_lot_id: lotId })
      .eq('id', animalId);

    if (animalError) {
      console.error('Error updating animal lot:', animalError);
      return false;
    }

    console.log('✅ Animal assigned to lot successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error in assignAnimalToLot:', error);
    return false;
  }
};

const removeAnimalFromCurrentLot = async (animalId: string): Promise<void> => {
  // Mark current assignment as removed
  await supabase
    .from('animal_lot_assignments')
    .update({ removed_date: new Date().toISOString() })
    .eq('animal_id', animalId)
    .is('removed_date', null);
};

export const removeAnimalFromLot = async (animalId: string, lotId: string): Promise<boolean> => {
  try {
    // Mark assignment as removed
    const { error: assignmentError } = await supabase
      .from('animal_lot_assignments')
      .update({ removed_date: new Date().toISOString() })
      .eq('animal_id', animalId)
      .eq('lot_id', lotId)
      .is('removed_date', null);

    if (assignmentError) {
      console.error('Error removing lot assignment:', assignmentError);
      return false;
    }

    // Clear animal's current lot
    const { error: animalError } = await supabase
      .from('animals')
      .update({ current_lot_id: null })
      .eq('id', animalId);

    if (animalError) {
      console.error('Error clearing animal lot:', animalError);
      return false;
    }

    console.log('✅ Animal removed from lot successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error in removeAnimalFromLot:', error);
    return false;
  }
};

export const createRotation = async (rotation: Omit<LotRotation, 'id'>): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user');
      return false;
    }

    const { error } = await supabase
      .from('lot_rotations')
      .insert({
        lot_id: rotation.lotId,
        user_id: user.id,
        rotation_date: rotation.rotationDate,
        from_lot_id: rotation.fromLotId,
        rotation_type: rotation.rotationType,
        reason: rotation.reason,
        animals_moved: rotation.animalsMoved,
        notes: rotation.notes,
      });

    if (error) {
      console.error('Error creating rotation:', error);
      return false;
    }

    console.log('✅ Rotation created successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error in createRotation:', error);
    return false;
  }
};
