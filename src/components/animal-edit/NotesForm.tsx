
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface NotesFormProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const NotesForm = ({ formData, onInputChange, disabled = false }: NotesFormProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Notas Adicionales</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={formData.notes || ''}
          onChange={(e) => onInputChange('notes', e.target.value)}
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
