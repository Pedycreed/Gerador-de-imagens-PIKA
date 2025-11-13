import React from 'react';
import { ModelId, MODELS } from '../services/geminiService';

interface ModelSelectorProps {
  selectedModel: ModelId;
  onModelChange: (model: ModelId) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-bold text-gray-400 px-2 pb-1 uppercase">Modelo de IA</p>
      {Object.entries(MODELS).map(([id, { name }]) => (
        <button
          key={id}
          onClick={() => onModelChange(id as ModelId)}
          className={`w-full text-left px-2 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none ${
            selectedModel === id
              ? 'bg-gray-700 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
};

export default ModelSelector;
