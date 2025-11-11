import React from 'react';
import { Spinner } from '../Spinner';
import { Card } from './Card';

interface LoadingStateProps {
  title: string;
  message: string;
  imagePreviewUrl?: string | null;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ title, message, imagePreviewUrl }) => {
  return (
    <Card className="text-center p-8 flex flex-col items-center justify-center animate-fade-in-fast border-green-200">
      {imagePreviewUrl && (
        <img src={imagePreviewUrl} alt="Preview" className="rounded-lg max-h-64 mb-6 shadow-lg animate-pulse" />
      )}
      <Spinner />
      <p className="text-gray-800 mt-4 text-lg font-semibold">{title}</p>
      <p className="text-gray-600 mt-1">{message}</p>
    </Card>
  );
};
