
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface NotesFormProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const NotesForm = ({ formData, onInputChange, disabled = false }: NotesFormProps) => {
  // Filter out image transform data from notes when editing
  const getFilteredNotes = (notes: string | null) => {
    if (!notes) return '';
    return notes.replace(/\[Image Transform Data: .*?\]\n?/g, '').trim();
  };

  // When saving, preserve the image transform data
  const handleNotesChange = (newNotes: string) => {
    const originalNotes = formData.notes || '';
    const transformMatch = originalNotes.match(/\[Image Transform Data: .*?\]/);
    
    let finalNotes = newNotes;
    if (transformMatch && transformMatch[0]) {
      finalNotes = newNotes ? `${newNotes}\n${transformMatch[0]}` : transformMatch[0];
    }
    
    onInputChange('notes', finalNotes);
  };

  const filteredNotes = getFilteredNotes(formData.notes);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Notas Adicionales</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={filteredNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Cualquier información adicional sobre el animal..."
          rows={4}
          disabled={disabled}
          autoComplete="new-password"
          data-lpignore="true"
          data-1p-ignore="true"
          data-bitwarden-ignore="true"
          data-form-type="other"
          spellCheck="false"
          name="animal-notes-field"
        />
      </CardContent>
    </Card>
  );
};

export default NotesForm;
