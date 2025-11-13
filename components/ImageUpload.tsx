import React, { useRef } from 'react';
import { PaperclipIcon } from './icons';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  disabled: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <button
        onClick={handleUploadClick}
        disabled={disabled}
        className="p-2 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed rounded-full hover:bg-gray-600 transition-colors"
        aria-label="Anexar imagem"
      >
        <PaperclipIcon />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        disabled={disabled}
      />
    </>
  );
};

export default ImageUpload;
