import React, { useState, useCallback, useEffect, useRef } from 'react';
import PromptInput from './components/PromptInput';
import ImageDisplay from './components/ImageDisplay';
import PromptSuggestions from './components/PromptSuggestions';
import { generateImage, ModelId, MODELS } from './services/geminiService';
import { GalleryIcon, GithubIcon, PikaIcon } from './components/icons';
import GalleryModal from './components/GalleryModal';
import DragDropOverlay from './components/DragDropOverlay';

export type ImageSize = '256x256' | '512x512' | '1024x1024' | 'YouTube (16:9)';

export interface UploadedImage {
  base64: string;
  mimeType: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  prompt: string;
  model: ModelId;
  size: ImageSize;
}

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<ImageSize>('1024x1024');
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelId>('gemini-2.5-flash-image');
  
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isGalleryOpen, setGalleryOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounter = useRef(0);


  // Load gallery from localStorage on initial render
  useEffect(() => {
    try {
      const storedImages = localStorage.getItem('pika-gallery');
      if (storedImages) {
        setGalleryImages(JSON.parse(storedImages));
      }
    } catch (e) {
      console.error("Failed to parse gallery images from localStorage", e);
      localStorage.removeItem('pika-gallery');
    }
  }, []);

  // Save gallery to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pika-gallery', JSON.stringify(galleryImages));
  }, [galleryImages]);


  // Clear uploaded image if user switches to a model that doesn't support it
  useEffect(() => {
    if (selectedModel === 'imagen-4.0-generate-001' && uploadedImage) {
      handleClearUpload();
    }
  }, [selectedModel, uploadedImage]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleClearUpload = useCallback(() => {
    setUploadedImage(null);
  }, []);

  const handleGenerateImage = useCallback(async () => {
    if ((!prompt.trim() && !uploadedImage) || loading) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setLoading(true);
    setError(null);
    setImageUrl(null); // Clear previous image to show loader

    const estimatedTime = selectedModel === 'imagen-4.0-generate-001' ? 30 : 15;
    setCountdown(estimatedTime);

    timerRef.current = window.setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const base64Image = await generateImage(prompt, selectedSize, uploadedImage, selectedModel);
      const fullImageUrl = `data:image/png;base64,${base64Image}`;
      setImageUrl(fullImageUrl);

      // Add to gallery
      const newImage: GalleryImage = {
        id: new Date().toISOString() + Math.random(),
        src: fullImageUrl,
        prompt: prompt || `Edit of uploaded image`,
        model: selectedModel,
        size: selectedSize,
      };
      setGalleryImages(prev => [newImage, ...prev]);

      // Do not clear the prompt, so user can iterate
      setUploadedImage(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate image. ${errorMessage}`);
      if (uploadedImage) {
        setImageUrl(`data:${uploadedImage.mimeType};base64,${uploadedImage.base64}`);
      }
      console.error(err);
    } finally {
      setLoading(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setCountdown(null);
    }
  }, [prompt, loading, selectedSize, uploadedImage, selectedModel]);

  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPEG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setUploadedImage({
        base64,
        mimeType: file.type,
      });
      setError(null);
      setImageUrl(null); // Clear any existing generated image
      // Switch to an editable model if a non-editable one is selected
      if (!MODELS[selectedModel].capabilities.edit) {
        setSelectedModel('gemini-2.5-flash-image');
      }
    };
    reader.onerror = () => {
      setError('Failed to read the image file.');
      console.error('FileReader error');
    };
    reader.readAsDataURL(file);
  }, [selectedModel]);


  const handleClearImage = () => {
    setImageUrl(null);
    setError(null);
  };

  const handleDeleteFromGallery = (id: string) => {
    setGalleryImages(prev => prev.filter(img => img.id !== id));
  };
  
  // Drag and Drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDraggingOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (uploadedImage || loading) return; // Don't allow drop if already busy/has image
      handleImageUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [uploadedImage, loading, handleImageUpload]);

  const showSuggestions = !loading && !error && !imageUrl && !uploadedImage;

  return (
    <div 
      className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 md:p-8 gap-4 relative transition-colors duration-300"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <DragDropOverlay isVisible={isDraggingOver} />
      
      <header className="w-full max-w-6xl flex justify-between items-center">
        <div className="flex items-center gap-2">
            <PikaIcon />
            <h1 className="text-xl sm:text-2xl font-bold">Gerador de Imagem PIKA</h1>
        </div>
        <div className="flex items-center gap-2">
            <button
              onClick={() => setGalleryOpen(true)}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Abrir galeria"
            >
              <GalleryIcon />
            </button>
            <a href="https://github.com/google/aistudio-apps" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors" aria-label="Ver no GitHub">
                <GithubIcon />
            </a>
        </div>
      </header>
      
      <main className="flex flex-col items-center justify-center flex-grow w-full max-w-6xl">
        <div className={`transition-opacity duration-500 w-full flex flex-col items-center ${showSuggestions ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
          <div className="w-full max-w-3xl">
            <PromptSuggestions onSelectPrompt={(p) => {
              setPrompt(p);
            }} />
          </div>
        </div>

        <div className={`transition-opacity duration-500 w-full flex flex-col items-center ${!showSuggestions ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
           <ImageDisplay
            imageUrl={imageUrl || (uploadedImage ? `data:${uploadedImage.mimeType};base64,${uploadedImage.base64}` : null)}
            loading={loading}
            error={error}
            selectedSize={selectedSize}
            onClearImage={handleClearImage}
            countdown={countdown}
          />
        </div>
      </main>

      <footer className="w-full flex justify-center sticky bottom-4">
        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerateImage}
          loading={loading}
          selectedSize={selectedSize}
          onSizeChange={setSelectedSize}
          uploadedImage={uploadedImage}
          onImageUpload={handleImageUpload}
          onClearUpload={handleClearUpload}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </footer>
      
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={galleryImages}
        onDelete={handleDeleteFromGallery}
      />
    </div>
  );
};

export default App;
