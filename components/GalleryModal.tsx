import React from 'react';
import { GalleryImage } from '../App';
import { DownloadIcon, TrashIcon, XIcon } from './icons';
import { MODELS } from '../services/geminiService';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryImage[];
  onDelete: (id: string) => void;
}

const GalleryItem: React.FC<{ image: GalleryImage; onDelete: (id: string) => void }> = ({ image, onDelete }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.src;
    link.download = `pika-${image.id.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const modelName = MODELS[image.model as keyof typeof MODELS]?.name || 'Unknown Model';

  return (
    <div className="relative group aspect-square bg-gray-900 rounded-lg overflow-hidden">
      <img src={image.src} alt={image.prompt} className="w-full h-full object-cover group-hover:opacity-60 transition-opacity" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
        <div className="flex justify-end gap-2">
           <button
              onClick={handleDownload}
              className="p-2 bg-gray-800/60 backdrop-blur-sm rounded-full text-gray-200 hover:text-white hover:bg-blue-600/80 transition-colors"
              aria-label="Baixar imagem"
            >
              <DownloadIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(image.id)}
              className="p-2 bg-gray-800/60 backdrop-blur-sm rounded-full text-gray-200 hover:text-white hover:bg-red-600/80 transition-colors"
              aria-label="Remover imagem"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
        </div>
        <div className="text-xs">
            <p className="font-bold truncate" title={image.prompt}>{image.prompt}</p>
            <p className="text-gray-400">{modelName} - {image.size}</p>
        </div>
      </div>
    </div>
  );
};

const GalleryModal: React.FC<GalleryModalProps> = ({ isOpen, onClose, images, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 w-full h-full rounded-2xl shadow-2xl flex flex-col border border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0">
          <h2 className="text-xl font-bold">Sua Galeria</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <XIcon />
          </button>
        </header>
        <main className="flex-grow p-4 sm:p-6 overflow-y-auto">
          {images.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-gray-500">
              <div>
                <h3 className="text-2xl font-bold text-gray-400">Sua galeria está vazia</h3>
                <p className="mt-2">Comece a criar imagens e elas aparecerão aqui!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {images.map(image => (
                <GalleryItem key={image.id} image={image} onDelete={onDelete} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GalleryModal;