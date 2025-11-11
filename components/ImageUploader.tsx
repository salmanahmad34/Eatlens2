import React, { useRef } from 'react';

const CameraIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h3l2-2h6l2 2h3v16H4V4zm8 14c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0-8c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/>
    </svg>
);
const UploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16h6v-6h4l-8-8-8 8h4v6zm-4 2h14v2H5v-2z"/>
    </svg>
);


interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
    if (event.target) {
        event.target.value = "";
    }
  };

  const handleCaptureClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.click();
    }
  };

  const handleUploadClick = () => {
      if (fileInputRef.current) {
          fileInputRef.current.removeAttribute('capture');
          fileInputRef.current.click();
      }
  };

  return (
    <div className="w-full p-4 text-center">
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
            onClick={handleCaptureClick}
            className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 font-semibold text-white rounded-full shadow-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-500/50"
            style={{backgroundColor: 'var(--color-primary-600)'}}
        >
            <CameraIcon className="w-6 h-6" />
            <span className="text-lg">Capture with Camera</span>
        </button>
        <button
            onClick={handleUploadClick}
            className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 font-semibold text-gray-700 bg-gray-100 rounded-full shadow-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300"
        >
            <UploadIcon className="w-6 h-6" />
            <span className="text-lg">Upload from Gallery</span>
        </button>
      </div>
      <input
        ref={fileInputRef}
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <p className="mt-4 text-xs text-gray-500">PNG, JPG, or WEBP supported</p>
    </div>
  );
};