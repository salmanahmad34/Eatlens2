import React, { useState, useCallback } from 'react';
import { ImageUploader } from './ImageUploader';
import { NutritionDisplay } from './NutritionDisplay';
import { identifyIngredients, analyzeImage } from '../services/geminiService';
import type { NutritionData } from '../types';
import { LoadingState } from './ui/LoadingState';
import { ErrorState } from './ui/ErrorState';
import { IngredientConfirmation } from './IngredientConfirmation';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';

const SparklesIcon: React.FC<{className?: string}> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l1.414 1.414M12 6.586l3.536 3.535M17 5l-1.414 1.414M12 17.414l-3.536-3.535" /></svg>;
const TargetIcon: React.FC<{className?: string}> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 4.5 4.5 0 018.31-2.075 4.5 4.5 0 011.153 5.375A4.5 4.5 0 0118 19.5h-5.25m-6.375 0S3.75 19.5 3.75 16.5c0-1.76 1.59-3.264 3.72-3.832" /></svg>;


export const MealAnalyzer: React.FC = () => {
  const { user, updateUserGoal, incrementAnalysisCount } = useAuth();
  const { openUpgradeModal } = useUI();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [identifiedIngredients, setIdentifiedIngredients] = useState<string[]>([]);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('idle');
  const [error, setError] = useState<string | null>(null);

  const goalOptions = ['General Health', 'Weight Loss', 'Muscle Gain', 'Heart Health', 'Manage Diabetes', 'Other'];
  const initialUserGoal = user?.healthGoal || 'General Health';
  const isPredefinedGoal = goalOptions.includes(initialUserGoal);
  
  const [selectedGoal, setSelectedGoal] = useState(isPredefinedGoal ? initialUserGoal : 'Other');
  const [customGoal, setCustomGoal] = useState(isPredefinedGoal ? '' : initialUserGoal);


  type AnalysisStep = 'idle' | 'identifying' | 'confirming' | 'analyzing' | 'displaying' | 'error';

  const sampleImageUrl = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2881&auto=format&fit=crop';
  const sampleNutritionData: NutritionData = {
    dishName: "Margherita Pizza Slice",
    protein: 12.5, carbohydrates: 35.6, fat: 15.1, calories: 328, sugar: 4.8, sodium: 640,
    ingredients: ["Pizza Dough", "Tomato Sauce", "Mozzarella Cheese", "Basil"],
    healthScore: "Enjoy in Moderation",
    healthTip: "For a healthier version, try a whole wheat crust and add more vegetable toppings.",
    micronutrients: [
        { name: "Lycopene", amount: "~1.5mg", description: "An antioxidant found in tomatoes, good for heart health." },
        { name: "Calcium", amount: "~200mg", description: "Essential for strong bones, from the mozzarella cheese." },
        { name: "Vitamin K", amount: "~10mcg", description: "Important for blood clotting, found in basil." }
    ],
    prosCons: {
        pros: ["Provides a quick source of energy from carbohydrates.", "Contains calcium which is good for bone health.", "Socially enjoyable and widely available."],
        cons: ["High in refined carbs and sodium.", "Can be high in saturated fat depending on cheese quantity.", "Often low in fiber and essential micronutrients."]
    },
    goalBasedVerdict: "For a 'Weight Loss' goal, this pizza slice is high in calories and refined carbs. It should be an occasional treat rather than a regular meal."
  };

  const resetState = useCallback(() => {
    setImageFile(null);
    setNutritionData(null);
    setIdentifiedIngredients([]);
    setError(null);
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setAnalysisStep('idle');
  }, [imagePreviewUrl]);

  const handleShowSample = () => {
    resetState();
    setImagePreviewUrl(sampleImageUrl);
    setNutritionData(sampleNutritionData);
    setAnalysisStep('displaying');
  };

  const handleImageSelect = useCallback(async (file: File) => {
    if (!user) return;
    
    if (user.plan === 'pending') {
        alert("Your Pro plan is awaiting approval. You can perform more analyses once approved.");
        return;
    }

    if (user.plan === 'free' && user.analysisCount >= 3) {
      openUpgradeModal();
      return;
    }

    resetState();
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    setAnalysisStep('identifying');
    setError(null);

    try {
      const ingredients = await identifyIngredients(file);
      setIdentifiedIngredients(ingredients);
      setAnalysisStep('confirming');
    } catch (err) {
      console.error(err);
      // Check for our specific error message
      if (err instanceof Error && err.message.includes("does not appear to contain food")) {
          setError("This doesn't look like food. Please upload a picture of your meal.");
      } else {
          // Generic error for other failures
          setError('Sorry, we couldn\'t identify ingredients from that image. Please try another one.');
      }
      setAnalysisStep('error');
    }
  }, [resetState, user, openUpgradeModal]);

  const handleConfirmAndAnalyze = async (confirmedIngredients: string[]) => {
    if (!imageFile || !user) return;
    
    const finalGoal = selectedGoal === 'Other' ? (customGoal.trim() || 'General Health') : selectedGoal;
    
    setAnalysisStep('analyzing');
    setError(null);
    try {
        // Persist the goal if it has changed
        if (finalGoal !== user.healthGoal) {
            await updateUserGoal(finalGoal);
        }
        const data = await analyzeImage(imageFile, confirmedIngredients, finalGoal);
        setNutritionData(data);
        await incrementAnalysisCount(); 
        setAnalysisStep('displaying');
    } catch (err) {
        console.error(err);
        setError('Sorry, we couldn\'t analyze that meal. Please try again.');
        setAnalysisStep('error');
    }
  }
  
  const renderContent = () => {
    const finalGoal = selectedGoal === 'Other' ? (customGoal.trim() || 'General Health') : selectedGoal;

    switch (analysisStep) {
        case 'identifying':
            return <LoadingState imagePreviewUrl={imagePreviewUrl} title="Identifying ingredients..." message="Our AI is inspecting your meal." />;
        case 'analyzing':
            return <LoadingState imagePreviewUrl={imagePreviewUrl} title="Calculating nutrition..." message={`Analyzing for your goal: "${finalGoal}"`} />;
        case 'confirming':
            return <IngredientConfirmation imagePreviewUrl={imagePreviewUrl} initialIngredients={identifiedIngredients} onConfirm={handleConfirmAndAnalyze} onCancel={resetState}/>
        case 'displaying':
            if (nutritionData && imagePreviewUrl) {
                return <NutritionDisplay data={nutritionData} imageUrl={imagePreviewUrl} onReset={resetState} />;
            }
            resetState();
            return null;
        case 'error':
             return <ErrorState message={error || 'An unknown error occurred.'} onRetry={resetState} />;
        case 'idle':
        default:
            return (
                 <div className="flex flex-col items-center animate-fade-in py-8">
                    <div className="text-center px-4">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tighter">
                        <span>Snap Your Food,</span>
                        <span className="block mt-2" style={{color: 'var(--color-primary-600)'}}>
                            Unlock Its Secrets.
                        </span>
                        </h1>
                        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
                        <span>Get instant, detailed nutritional insights from a photo. Eat smarter, not harder.</span>
                        </p>
                    </div>

                    <div className="w-full max-w-lg mt-10 space-y-4 animate-fade-in" style={{animationDelay: '100ms'}}>
                        <div className="px-4">
                            <div className="flex items-center gap-3">
                                <TargetIcon className="w-6 h-6 text-gray-500" />
                                <label htmlFor="healthGoal" className="text-sm font-medium text-gray-700 whitespace-nowrap">My primary health goal is:</label>
                                <select
                                    id="healthGoal"
                                    value={selectedGoal}
                                    onChange={(e) => setSelectedGoal(e.target.value)}
                                    className="w-full p-2 bg-white border-b-2 border-gray-300 text-gray-800 focus:outline-none focus:border-primary-500 transition"
                                >
                                    {goalOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            {selectedGoal === 'Other' && (
                                <div className="mt-2 animate-fade-in-fast pl-9">
                                    <input
                                        id="customHealthGoal"
                                        type="text"
                                        value={customGoal}
                                        onChange={(e) => setCustomGoal(e.target.value)}
                                        placeholder="Please specify your goal"
                                        className="w-full p-2 bg-white border-b-2 border-gray-300 text-gray-800 focus:outline-none focus:border-primary-500 transition"
                                    />
                                </div>
                            )}
                        </div>
                        <ImageUploader onImageSelect={handleImageSelect} />
                    </div>

                     <div className="mt-8 text-center animate-fade-in" style={{animationDelay: '200ms'}}>
                        <button onClick={handleShowSample} className="group inline-flex items-center gap-2 px-6 py-2 text-gray-600 font-medium rounded-full bg-gray-100/80 border border-gray-200 hover:border-primary-400 hover:text-primary-700 transition-all duration-300" style={{borderColor: 'var(--color-primary-400)', color: 'var(--color-primary-700)'}}>
                            <SparklesIcon className="w-5 h-5 text-primary-500/70 group-hover:text-primary-600 transition-colors group-hover:scale-110" style={{color: 'var(--color-primary-500)'}} />
                            See a sample analysis
                        </button>
                    </div>
                </div>
            )
    }
  }


  return (
    <div className="w-full">
        {renderContent()}
    </div>
  );
};