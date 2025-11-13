import React, { useState, useCallback, useEffect, useRef } from 'react';
import PromptInput from './components/PromptInput';
import ImageDisplay from './components/ImageDisplay';
import PromptSuggestions from './components/PromptSuggestions';
import { generateImage, ModelId } from './services/geminiService';
import { GalleryIcon, GithubIcon, PikaIcon } from './components/icons';
import GalleryModal from './components/GalleryModal';

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

      setUploadedImage(null); // Reset after successful generation
      setPrompt(''); // Clear prompt after generation
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

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64String = result.split(',')[1];
      if (base64String) {
        setUploadedImage({ base64: base64String, mimeType: file.type });
        setImageUrl(result); 
      }
    };
    reader.onerror = () => {
      setError('Falha ao ler o arquivo de imagem.');
    };
    reader.readAsDataURL(file);
  };

  const handleClearUpload = useCallback(() => {
    setUploadedImage(null);
    setImageUrl(null);
  }, []);

  const handleClearImage = useCallback(() => {
    setImageUrl(null);
    setError(null);
  }, []);
  
  const handleDeleteFromGallery = useCallback((id: string) => {
    setGalleryImages(prev => prev.filter(image => image.id !== id));
  }, []);

  const handleSelectPrompt = useCallback((selectedPrompt: string) => {
    setPrompt(selectedPrompt);
  }, []);

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-800 text-white selection:bg-purple-500 selection:text-white">
        <header className="flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex items-center">
            <PikaIcon />
            <h1 className="text-xl font-semibold ml-2 text-gray-100">Gerador de Imagem PIKA</h1>
          </div>
          <button 
            onClick={() => setGalleryOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700/80 hover:bg-gray-700 rounded-lg text-sm font-semibold transition-colors"
            aria-label="Abrir galeria"
          >
            <GalleryIcon />
            Galeria
          </button>
        </header>

        <main className="flex-grow w-full max-w-4xl mx-auto p-4 flex flex-col items-center justify-center">
          {(!imageUrl && !loading && !error) ? (
            <div className="flex flex-col items-center justify-center h-full text-center w-full">
              <div className="p-4 rounded-lg w-full max-w-2xl">
                <PromptSuggestions onSelectPrompt={handleSelectPrompt} />
              </div>
            </div>
          ) : (
            <ImageDisplay
              imageUrl={imageUrl}
              loading={loading}
              error={error}
              selectedSize={selectedSize}
              onClearImage={handleClearImage}
              countdown={countdown}
            />
          )}
        </main>

        <footer className="w-full sticky bottom-0 bg-gray-800 border-t border-gray-700/50">
          <div className="max-w-3xl mx-auto p-4">
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
            <div className="text-center text-gray-600 text-xs mt-2 flex justify-center items-center space-x-2">
              <a href="https://github.com/Pedycreed" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
                <GithubIcon />
              </a>
              <span>Powered by Jhonatan Salgueiro</span>
            </div>
          </div>
        </footer>
      </div>
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={galleryImages}
        onDelete={handleDeleteFromGallery}
      />
    </>
  );
};

export default App;