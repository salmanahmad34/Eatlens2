import React, { useState } from 'react';

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  placeholder: string;
  buttonText: string;
  isLoading: boolean;
}

export const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, placeholder, buttonText, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={placeholder}
        className="flex-grow p-4 bg-white border border-gray-300 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
      />
      <button
        type="submit"
        className="px-8 py-4 font-semibold text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50 disabled:scale-100"
        style={{backgroundColor: 'var(--color-primary-600)'}}
        disabled={isLoading || !prompt.trim()}
      >
        {buttonText}
      </button>
    </form>
  );
};