
import { supabase } from '@/integrations/supabase/client';

export interface AnimalAttachment {
  id: string;
  animalId: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  description?: string;
  attachmentType: 'photo' | 'document' | 'certificate' | 'medical_record';
  createdAt: string;
}

export const getAnimalAttachments = async (animalId: string): Promise<AnimalAttachment[]> => {
  const { data, error } = await supabase
    .from('animal_attachments')
    .select('*')
    .eq('animal_id', animalId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching animal attachments:', error);
    throw error;
  }

  return (data || []).map(attachment => ({
    id: attachment.id,
    animalId: attachment.animal_id,
    userId: attachment.user_id,
    fileName: attachment.file_name,
    fileUrl: attachment.file_url,
    fileType: attachment.file_type,
    fileSize: attachment.file_size || undefined,
    description: attachment.description || undefined,
    attachmentType: attachment.attachment_type as AnimalAttachment['attachmentType'],
    createdAt: attachment.created_at
  }));
};

export const addAnimalAttachment = async (attachment: Omit<AnimalAttachment, 'id' | 'userId' | 'createdAt'>): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user');
    return false;
  }

  const { error } = await supabase
    .from('animal_attachments')
    .insert({
      animal_id: attachment.animalId,
      user_id: user.id,
      file_name: attachment.fileName,
      file_url: attachment.fileUrl,
      file_type: attachment.fileType,
      file_size: attachment.fileSize || null,
      description: attachment.description || null,
      attachment_type: attachment.attachmentType
    });

  if (error) {
    console.error('Error adding animal attachment:', error);
    return false;
  }

  return true;
};

export const deleteAnimalAttachment = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('animal_attachments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting animal attachment:', error);
    return false;
  }

  return true;
};
