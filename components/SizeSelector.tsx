import React from 'react';
import { ImageSize } from '../App';

interface SizeSelectorProps {
  selectedSize: ImageSize;
  onSizeChange: (size: ImageSize) => void;
  disabled: boolean;
}

const SIZES: ImageSize[] = ['256x256', '512x512', '1024x1024', 'YouTube (16:9)'];

const SizeSelector: React.FC<SizeSelectorProps> = ({ selectedSize, onSizeChange, disabled }) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-bold text-gray-400 px-2 pb-1 uppercase">Tamanho da Imagem</p>
      {SIZES.map((size) => (
        <button
          key={size}
          onClick={() => onSizeChange(size)}
          disabled={disabled}
          className={`w-full text-left px-2 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none ${
            selectedSize === size
              ? 'bg-gray-700 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          {size}
        </button>
      ))}
    </div>
  );
};

export default SizeSelector;
