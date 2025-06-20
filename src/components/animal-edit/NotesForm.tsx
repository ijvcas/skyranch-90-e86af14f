
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface NotesFormProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const NotesForm = ({ formData, onInputChange, disabled = false }: NotesFormProps) => {
  // Simple function to filter out image transform data for display only
  const getDisplayNotes = (notes: string | null) => {
    if (!notes) return '';
    return notes
      .replace(/\[Image Transform Data: .*?\]\n?/g, '')
      .replace(/\[Image Transform Applied: .*?\]\n?/g, '')
      .replace(/Image Transform Applied: .*?\n?/g, '')
      .replace(/\[Image Transform Data: \{.*?\}\]\n?/g, '')
      .trim();
  };

  // Simplified change handler that doesn't interfere with typing
  const handleNotesChange = (newNotes: string) => {
    // During editing, just pass through the raw input
    // Image transform data preservation will be handled on save
    onInputChange('notes', newNotes);
  };

  // Use raw notes for editing to avoid input interference
  const notesValue = formData.notes || '';
  const displayValue = getDisplayNotes(notesValue);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Notas Adicionales</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={displayValue}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Cualquier información adicional sobre el animal..."
          rows={6}
          disabled={disabled}
          className="resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-sm text-gray-500 mt-2">
          Escribe cualquier información adicional relevante sobre el animal.
        </p>
      </CardContent>
    </Card>
  );
};

export default NotesForm;
