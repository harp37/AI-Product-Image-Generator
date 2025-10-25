
import React, { useRef, useCallback } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  uploadedImageName: string | null | undefined;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, uploadedImageName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-indigo-500', 'bg-gray-700/50');
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-indigo-500', 'bg-gray-700/50');
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-indigo-500', 'bg-gray-700/50');
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      <div
        onClick={triggerFileSelect}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer transition-colors"
      >
        <div className="space-y-1 text-center">
          <UploadIcon />
          <div className="flex text-sm text-gray-400">
            <p className="pl-1">
              Drag and drop an image, or{' '}
              <span className="font-medium text-indigo-400 hover:text-indigo-300">
                browse
              </span>
            </p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
        </div>
      </div>
      {uploadedImageName && (
        <p className="mt-2 text-sm text-center text-gray-400">
          Loaded: <span className="font-medium text-gray-300">{uploadedImageName}</span>
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
