import React from 'react';
import { UploadCloudIcon } from './icons';

interface DragDropOverlayProps {
  isVisible: boolean;
}

const DragDropOverlay: React.FC<DragDropOverlayProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md z-50 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-none">
      <div className="flex flex-col items-center justify-center text-white border-4 border-dashed border-gray-500 rounded-2xl p-12">
        <UploadCloudIcon className="w-24 h-24 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold">Solte a imagem para fazer o upload</h2>
        <p className="text-gray-400 mt-2">O upload do arquivo iniciará automaticamente.</p>
      </div>
    </div>
  );
};

export default DragDropOverlay;
