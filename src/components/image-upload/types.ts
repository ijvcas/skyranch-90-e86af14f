
export interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string | null) => void;
  disabled?: boolean;
  animalType?: string;
}

export interface PlaceholderImage {
  id: string;
  url: string;
  description: string;
  type: string;
}
