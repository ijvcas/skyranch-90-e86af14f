
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { getFileFormat } from './FileFormatDetector';

interface FilePreviewSectionProps {
  selectedFile: File;
}

const FilePreviewSection: React.FC<FilePreviewSectionProps> = ({ selectedFile }) => {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Archivo seleccionado</AlertTitle>
      <AlertDescription>
        <div className="space-y-1">
          <p><strong>Nombre:</strong> {selectedFile.name}</p>
          <p><strong>Tamaño:</strong> {(selectedFile.size / 1024).toFixed(1)} KB</p>
          <p><strong>Formato:</strong> {getFileFormat(selectedFile.name)}</p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default FilePreviewSection;
