import React from 'react';
import { Card } from './Card';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <Card className="text-center p-8 border-rose-300">
       <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-rose-100 text-rose-500">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
         </svg>
       </div>
      <p className="font-semibold text-lg mt-4 text-rose-700">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 bg-rose-600 text-white font-bold py-2 px-6 rounded-full hover:bg-rose-700 transition-colors"
      >
        Try Again
      </button>
    </Card>
  );
};
