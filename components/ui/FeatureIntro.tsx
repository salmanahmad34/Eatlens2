import React from 'react';

interface FeatureIntroProps {
  title: string;
  description: string;
}

export const FeatureIntro: React.FC<FeatureIntroProps> = ({ title, description }) => {
  return (
    <div className="mb-8">
      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tighter">{title}</h2>
      <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">{description}</p>
    </div>
  );
};