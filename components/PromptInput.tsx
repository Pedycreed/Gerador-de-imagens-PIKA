import React, { useState } from 'react';
import { SendIcon, PaperclipIcon, ResizeIcon, XIcon, CpuChipIcon, SparklesIcon } from './icons';
import { ImageSize, UploadedImage } from '../App';
import SizeSelector from './SizeSelector';
import ImageUpload from './ImageUpload';
import ModelSelector from './ModelSelector';
import { ModelId, MODELS, refinePrompt } from '../services/geminiService';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  loading: boolean;
  selectedSize: ImageSize;
  onSizeChange: (size: ImageSize) => void;
  uploadedImage: UploadedImage | null;
  onImageUpload: (file: File) => void;
  onClearUpload: () => void;
  selectedModel: ModelId;
  onModelChange: (model: ModelId) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({
  prompt, setPrompt, onGenerate, loading,
  selectedSize, onSizeChange, uploadedImage, onImageUpload, onClearUpload,
  selectedModel, onModelChange
}) => {
  const [isSizeSelectorOpen, setSizeSelectorOpen] = useState(false);
  const [isModelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [refinedSuggestions, setRefinedSuggestions] = useState<string[]>([]);
  
  const modelCapabilities = MODELS[selectedModel].capabilities;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onGenerate();
    }
  };
  
  const handleRefine = async () => {
    if (!prompt.trim() || isRefining || loading) return;
    setIsRefining(true);
    setRefineError(null);
    setRefinedSuggestions([]);
    try {
        const suggestions = await refinePrompt(prompt);
        setRefinedSuggestions(suggestions);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setRefineError(errorMessage);
    } finally {
        setIsRefining(false);
    }
  };

  const placeholderText = uploadedImage
    ? "Descreva as edições que você quer fazer..."
    : "Um astronauta surfando em uma onda cósmica...";

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-gray-700 border border-gray-600/50 rounded-xl transition-all duration-300 relative">
        {uploadedImage && modelCapabilities.edit && (
          <div className="p-3 border-b border-gray-600/50">
            <div className="relative w-20 h-20">
              <img
                src={`data:${uploadedImage.mimeType};base64,${uploadedImage.base64}`}
                alt="Uploaded preview"
                className="w-full h-full object-cover rounded-md"
              />
              <button
                onClick={onClearUpload}
                className="absolute -top-2 -right-2 bg-gray-800 border border-gray-600 rounded-full p-1 text-gray-300 hover:text-white hover:bg-red-600 transition-colors"
                aria-label="Remover imagem"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-start p-2 gap-2">
          <div className="flex items-center gap-1 relative pt-2">
            <ImageUpload onImageUpload={onImageUpload} disabled={loading || !!uploadedImage || !modelCapabilities.edit} />
            
            <div className="relative">
              <button
                onClick={() => setSizeSelectorOpen(prev => !prev)}
                disabled={loading || !!uploadedImage}
                className="p-2 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed rounded-full hover:bg-gray-600 transition-colors"
                aria-label="Selecionar tamanho da imagem"
              >
                <ResizeIcon />
              </button>
              {isSizeSelectorOpen && (
                <div className="absolute bottom-full mb-2 left-0 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg p-2 z-10 w-48">
                  <SizeSelector
                    selectedSize={selectedSize}
                    onSizeChange={(size) => {
                      onSizeChange(size);
                      setSizeSelectorOpen(false);
                    }}
                    disabled={!!uploadedImage}
                  />
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setModelSelectorOpen(prev => !prev)}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed rounded-full hover:bg-gray-600 transition-colors"
                aria-label="Selecionar modelo de IA"
              >
                <CpuChipIcon />
              </button>
              {isModelSelectorOpen && (
                <div className="absolute bottom-full mb-2 left-0 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg p-2 z-10 w-48">
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={(model) => {
                        onModelChange(model);
                        setModelSelectorOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            className="flex-grow bg-transparent focus:outline-none resize-none text-gray-200 placeholder-gray-400 self-center py-2 px-1"
            rows={1}
            disabled={loading}
          />
          
          <div className="flex items-end self-end gap-1 relative">
             <button
                onClick={handleRefine}
                disabled={loading || isRefining || !prompt.trim()}
                className="flex items-center justify-center h-10 w-10 text-gray-400 hover:text-purple-400 disabled:text-gray-600 disabled:cursor-not-allowed rounded-lg hover:bg-gray-600 transition-colors"
                title="Refinar Prompt"
              >
                <SparklesIcon className={`w-5 h-5 ${isRefining ? 'animate-spin' : ''}`} />
             </button>

            {(refinedSuggestions.length > 0 || refineError) && (
                <div className="absolute bottom-full mb-2 right-0 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg p-3 z-20 w-80 max-h-64 overflow-y-auto">
                    {refineError ? (
                       <div className="text-red-400 text-sm p-2">{refineError}</div>
                    ) : (
                        <>
                            <h4 className="text-sm font-bold text-gray-300 mb-2 px-2">Sugestões</h4>
                            <ul className="space-y-1">
                                {refinedSuggestions.map((suggestion, index) => (
                                    <li key={index}>
                                        <button
                                            onClick={() => {
                                                setPrompt(suggestion);
                                                setRefinedSuggestions([]);
                                            }}
                                            className="w-full text-left text-sm text-gray-300 hover:bg-gray-700 p-2 rounded-md transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                     <button
                        onClick={() => { setRefinedSuggestions([]); setRefineError(null); }}
                        className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
                        aria-label="Fechar sugestões"
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
            )}


            <button
                onClick={onGenerate}
                disabled={loading || (!prompt.trim() && !uploadedImage)}
                className="flex items-center justify-center h-10 w-10 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
                aria-label="Gerar Imagem"
            >
                {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ) : (
                <SendIcon />
                )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;