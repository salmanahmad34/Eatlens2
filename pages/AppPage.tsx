import React, { useState } from 'react';
import { Navigation, View } from '../components/Navigation';
import { MealAnalyzer } from '../components/MealAnalyzer';
import { RecipeGenerator } from '../components/RecipeGenerator';
import { MealPlanner } from '../components/MealPlanner';
import { FoodChat } from '../components/NutritionistChat';
import { AdminPanel } from '../components/AdminPanel';
import { MyPlan } from '../components/MyPlan';
import { useAuth } from '../contexts/AuthContext';

export const AppPage: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<View>('analyze');

  const renderContent = () => {
    switch (activeView) {
      case 'recipe':
        return <RecipeGenerator />;
      case 'planner':
        return <MealPlanner />;
      case 'foodchat':
        return <FoodChat />;
      case 'myplan':
        return <MyPlan />;
      case 'admin':
        return user?.role === 'admin' ? <AdminPanel /> : <MealAnalyzer />;
      case 'analyze':
      default:
        return <MealAnalyzer />;
    }
  };

  return (
    <div className="w-full max-w-7xl flex flex-col items-center">
        <div className="w-full max-w-4xl mb-6 text-left animate-fade-in-fast">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Welcome back, {user?.name}!</h1>
          <p className="mt-1 text-lg text-slate-600">What would you like to do today?</p>
        </div>
        <Navigation activeView={activeView} setActiveView={setActiveView} />
        <div className="w-full mt-8">
            {renderContent()}
        </div>
    </div>
  );
};
