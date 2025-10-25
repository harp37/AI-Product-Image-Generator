
import React, { useState, useCallback } from 'react';
import { editImage, generateProductShot } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import ImageUploader from './components/ImageUploader';
import Loader from './components/Loader';
import { WandIcon, ShirtIcon } from './components/icons';

type Tab = 'editor' | 'product';

interface UploadedImage {
  base64: string;
  mimeType: string;
  name: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const [prompt, setPrompt] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<UploadedImage | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((file: File) => {
    setError(null);
    setGeneratedImage(null);
    fileToBase64(file).then(base64 => {
      setOriginalImage({
        base64,
        mimeType: file.type,
        name: file.name
      });
    }).catch(err => {
      console.error(err);
      setError("Failed to read the image file.");
    });
  }, []);

  const handleSubmit = async () => {
    if (!originalImage) {
      setError("Please upload an image first.");
      return;
    }
    if (activeTab === 'editor' && !prompt) {
      setError("Please enter an editing prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      let result: string;
      if (activeTab === 'editor') {
        result = await editImage(originalImage.base64, originalImage.mimeType, prompt);
      } else {
        result = await generateProductShot(originalImage.base64, originalImage.mimeType);
      }
      setGeneratedImage(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const TabButton: React.FC<{ tabId: Tab; icon: React.ReactNode; label: string }> = ({ tabId, icon, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors rounded-t-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 ${
        activeTab === tabId
          ? 'bg-gray-800 text-white border-b-2 border-indigo-500'
          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const renderTabContent = () => {
    if (activeTab === 'editor') {
      return (
        <div className="space-y-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">
            Editing Prompt
          </label>
          <textarea
            id="prompt"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Add a retro filter, make it black and white..."
            className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm p-3 text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          />
        </div>
      );
    }
    return (
      <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-300">
          This tool transforms photos of clothing into professional product shots. It creates a clean, white background and a front-facing view, perfect for e-commerce.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-white tracking-tight">Gemini Image Studio</h1>
          <p className="text-gray-400 mt-1">AI-Powered Image Editing & Product Photography</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Column */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 space-y-6 h-fit">
            <div className="flex border-b border-gray-700">
              <TabButton tabId="editor" icon={<WandIcon />} label="Magic Editor" />
              <TabButton tabId="product" icon={<ShirtIcon />} label="Product Shots" />
            </div>

            <div className="space-y-4">
               <h2 className="text-lg font-semibold text-white">1. Upload Image</h2>
               <ImageUploader onImageUpload={handleImageUpload} uploadedImageName={originalImage?.name} />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">2. Configure</h2>
              {renderTabContent()}
            </div>
            
            {error && <p className="text-red-400 text-sm bg-red-900/50 p-3 rounded-md">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={isLoading || !originalImage}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader />
                  <span>Generating...</span>
                </>
              ) : (
                <span>Generate Image</span>
              )}
            </button>
          </div>

          {/* Results Column */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <ImageDisplay title="Original" imageSrc={originalImage ? `data:${originalImage.mimeType};base64,${originalImage.base64}` : null} />
              <ImageDisplay title="Generated" imageSrc={generatedImage ? `data:image/png;base64,${generatedImage}` : null} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

interface ImageDisplayProps {
  title: string;
  imageSrc: string | null;
  isLoading?: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, imageSrc, isLoading = false }) => (
  <div className="bg-gray-800 p-4 rounded-lg shadow-xl flex flex-col gap-3">
    <h3 className="text-md font-semibold text-white text-center">{title}</h3>
    <div className="aspect-square bg-gray-900/50 rounded-md flex items-center justify-center relative">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-10">
          <Loader />
          <p className="mt-2 text-sm text-gray-300">AI is thinking...</p>
        </div>
      )}
      {imageSrc ? (
        <img src={imageSrc} alt={title} className="max-w-full max-h-full object-contain rounded-md" />
      ) : (
        <div className="text-gray-500 text-center p-4">
          <p>{isLoading ? '...' : 'Your image will appear here'}</p>
        </div>
      )}
    </div>
  </div>
);

export default App;
