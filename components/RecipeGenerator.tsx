import React, { useState, useRef } from 'react';
import { generateRecipe, getNutritionForRecipe, getRecipeSuggestions } from '../services/geminiService';
import type { RecipeData, NutritionData } from '../types';
import { Card } from './ui/Card';
import { PromptForm } from './ui/PromptForm';
import { FeatureIntro } from './ui/FeatureIntro';
import { LoadingState } from './ui/LoadingState';
import { ErrorState } from './ui/ErrorState';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { Spinner } from './Spinner';

declare const jspdf: any;
declare const html2canvas: any;

const DownloadIcon = ({ className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const SparklesIcon = ({ className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm12 1a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V3a1 1 0 011-1zM5 12a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM11 5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM11 9a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM11 13a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"/></svg>;


const NutritionInfoDisplay: React.FC<{info: Omit<NutritionData, 'micronutrients' | 'prosCons' | 'goalBasedVerdict'>}> = ({ info }) => (
    <div className="mt-6 border-t border-gray-200 pt-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 text-center">Nutritional Info (per serving)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-50 p-3 rounded-lg"><div className="text-2xl font-bold text-gray-900">{info.calories.toFixed(0)}</div><div className="text-sm text-gray-600">Calories</div></div>
            <div className="bg-gray-50 p-3 rounded-lg"><div className="text-2xl font-bold text-gray-900">{info.protein.toFixed(1)}g</div><div className="text-sm text-gray-600">Protein</div></div>
            <div className="bg-gray-50 p-3 rounded-lg"><div className="text-2xl font-bold text-gray-900">{info.carbohydrates.toFixed(1)}g</div><div className="text-sm text-gray-600">Carbs</div></div>
            <div className="bg-gray-50 p-3 rounded-lg"><div className="text-2xl font-bold text-gray-900">{info.fat.toFixed(1)}g</div><div className="text-sm text-gray-600">Fat</div></div>
        </div>
    </div>
);

const RecipeDisplay: React.FC<{recipe: RecipeData, setRecipe: (r: RecipeData) => void}> = ({ recipe, setRecipe }) => {
    const { user } = useAuth();
    const { openUpgradeModal } = useUI();
    const [isFetchingNutrition, setIsFetchingNutrition] = useState(false);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const recipeRef = useRef<HTMLDivElement>(null);

    const handleGetNutrition = async () => {
        if (user?.plan === 'free' || user?.plan === 'pending') {
            openUpgradeModal();
            return;
        }
        setIsFetchingNutrition(true);
        try {
            const nutrition = await getNutritionForRecipe(recipe);
            setRecipe({ ...recipe, nutritionInfo: nutrition });
        } catch(e) {
            alert("Could not fetch nutrition information at this time.");
        } finally {
            setIsFetchingNutrition(false);
        }
    };

    const handleGetSuggestions = async () => {
        if (user?.plan !== 'pro') {
            openUpgradeModal();
            return;
        }
        setIsFetchingSuggestions(true);
        try {
            const suggestions = await getRecipeSuggestions(recipe, user?.healthGoal || 'General Health');
            setRecipe({ ...recipe, suggestions });
        } catch(e) {
            alert("Could not fetch AI suggestions at this time.");
        } finally {
            setIsFetchingSuggestions(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (user?.plan !== 'pro') {
            openUpgradeModal();
            return;
        }
        if (!recipeRef.current) return;
        setIsDownloading(true);
        try {
            const canvas = await html2canvas(recipeRef.current, { 
                scale: 2, 
                backgroundColor: '#ffffff',
                onclone: (doc) => {
                     const buttons = doc.querySelectorAll('.hide-on-pdf');
                    buttons.forEach(btn => (btn as HTMLElement).style.display = 'none');
                }
            });
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const margin = 10;
            const imgWidth = pdfWidth - (margin * 2);
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
            pdf.save(`eatlens-recipe-${recipe.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
        } catch (err) {
            console.error("PDF generation failed:", err);
        } finally {
            setIsDownloading(false);
        }
    };

    const isFeatureLocked = user?.plan === 'free' || user?.plan === 'pending';

    return (
        <Card ref={recipeRef} className="w-full text-left animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900">{recipe.title}</h2>
            <p className="mt-2 text-gray-600">{recipe.description}</p>
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-500 border-b border-gray-200 pb-4">
                <span><strong>Servings:</strong> {recipe.servings}</span>
                <span><strong>Time:</strong> {recipe.prepTime}</span>
            </div>
            <div className="mt-6 grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Ingredients</h3>
                    <ul className="space-y-2 list-disc list-inside text-gray-700" style={{markerColor: 'var(--color-primary-600)'}}>
                        {recipe.ingredients.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Instructions</h3>
                    <ol className="space-y-3 list-decimal list-inside text-gray-700" style={{markerColor: 'var(--color-primary-600)'}}>
                        {recipe.instructions.map((step, index) => <li key={index} className="pl-2">{step}</li>)}
                    </ol>
                </div>
            </div>
            
            {recipe.suggestions && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                     <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-violet-500"/>AI Suggestions for Your Goal</h4>
                     <ul className="space-y-2 list-disc list-inside text-gray-700 marker:text-violet-500">
                        {recipe.suggestions.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            )}

            {recipe.nutritionInfo ? (
                <NutritionInfoDisplay info={recipe.nutritionInfo} />
            ) : (
                <div className="mt-6 text-center border-t border-gray-200 pt-6 hide-on-pdf">
                    <button 
                        onClick={handleGetNutrition} 
                        disabled={isFetchingNutrition}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2 font-semibold text-gray-700 bg-gray-100 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {isFetchingNutrition ? <Spinner/> : '🧪'}
                        {isFetchingNutrition ? 'Analyzing...' : 'Get Nutrition Info'}
                        {isFeatureLocked && <span className="ml-2 text-xs font-bold bg-violet-500 text-white px-2 py-0.5 rounded-full">PRO</span>}
                    </button>
                </div>
            )}
             <div className="mt-6 text-center border-t border-gray-200 pt-6 hide-on-pdf flex flex-col sm:flex-row gap-4 justify-center">
                 {!recipe.suggestions && (
                     <button
                        onClick={handleGetSuggestions}
                        disabled={isFetchingSuggestions}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2 font-semibold text-gray-700 bg-gray-100 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {isFetchingSuggestions ? <Spinner/> : <SparklesIcon className="w-5 h-5"/>}
                        {isFetchingSuggestions ? 'Thinking...' : 'Get AI Suggestions'}
                        {isFeatureLocked && <span className="ml-2 text-xs font-bold bg-violet-500 text-white px-2 py-0.5 rounded-full">PRO</span>}
                    </button>
                 )}
                 <button 
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 font-semibold text-gray-700 bg-gray-100 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    {isDownloading ? <Spinner/> : <DownloadIcon className="w-5 h-5"/>}
                    {isDownloading ? 'Downloading...' : 'Download Recipe'}
                    {isFeatureLocked && <span className="ml-2 text-xs font-bold bg-violet-500 text-white px-2 py-0.5 rounded-full">PRO</span>}
                </button>
             </div>
        </Card>
    )
};

const IngredientInput: React.FC<{ ingredients: string[], setIngredients: (i: string[]) => void, onSubmit: () => void, isLoading: boolean }> = ({ ingredients, setIngredients, onSubmit, isLoading }) => {
    const [inputValue, setInputValue] = useState('');
    
    const handleAdd = () => {
        if (inputValue.trim() && !ingredients.includes(inputValue.trim())) {
            setIngredients([...ingredients, inputValue.trim()]);
            setInputValue('');
        }
    };
    
    const handleRemove = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full">
            <div className="flex gap-3">
                 <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                    placeholder="e.g., 'chicken breast', 'quinoa'"
                    className="flex-grow p-4 bg-white border border-gray-300 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />
                 <button type="button" onClick={handleAdd} className="px-8 py-4 font-semibold text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 min-h-[2.5rem]">
                {ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full animate-fade-in-fast">
                        <span>{ing}</span>
                        <button onClick={() => handleRemove(i)} className="ml-2 text-gray-500 hover:text-gray-800">&times;</button>
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={onSubmit}
                className="w-full mt-4 px-8 py-4 font-semibold text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50 disabled:scale-100"
                style={{backgroundColor: 'var(--color-primary-600)'}}
                disabled={isLoading || ingredients.length === 0}
            >
                Generate Recipe
            </button>
        </div>
    )
};

const sampleRecipeData: RecipeData = {
    title: "Quick & Healthy Chicken Quinoa Bowl",
    description: "A vibrant and balanced meal perfect for a quick lunch or dinner. Packed with protein, fiber, and fresh vegetables.",
    ingredients: [
        "1 cup cooked quinoa",
        "1 grilled chicken breast, sliced",
        "1/2 avocado, diced",
        "1/4 cup cherry tomatoes, halved",
        "1/4 cup cucumber, diced",
        "2 tbsp feta cheese, crumbled",
        "Lemon-tahini dressing"
    ],
    instructions: [
        "Start with a base of cooked quinoa in a bowl.",
        "Arrange the sliced grilled chicken, diced avocado, cherry tomatoes, and cucumber on top.",
        "Sprinkle with crumbled feta cheese.",
        "Drizzle with your favorite lemon-tahini dressing before serving."
    ],
    servings: "1 serving",
    prepTime: "10 minutes",
    nutritionInfo: {
        calories: 450,
        protein: 35,
        carbohydrates: 30,
        fat: 20,
        sugar: 5,
        sodium: 350,
        dishName: "Chicken Quinoa Bowl",
        ingredients: ["Quinoa", "Chicken Breast", "Avocado", "Tomatoes"],
        healthScore: "Excellent Choice",
        healthTip: "Use a light, homemade dressing to control sodium and sugar."
    }
};


export const RecipeGenerator: React.FC = () => {
    const [recipe, setRecipe] = useState<RecipeData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'prompt' | 'ingredients'>('prompt');
    const [ingredients, setIngredients] = useState<string[]>([]);
    
    const handleSubmit = async (prompt: string) => {
        setIsLoading(true);
        setError(null);
        setRecipe(null);

        try {
            const result = await generateRecipe(prompt, mode === 'ingredients' ? ingredients : null);
            setRecipe(result);
        } catch (err) {
            setError('Sorry, we couldn\'t generate that recipe. Please try a different request.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const reset = () => {
        setRecipe(null);
        setError(null);
        setIngredients([]);
    };

    const handleShowSample = () => {
        reset();
        setRecipe(sampleRecipeData);
    };
    
    const ModeButton: React.FC<{btnMode: 'prompt' | 'ingredients', text: string}> = ({ btnMode, text }) => (
        <button 
            onClick={() => setMode(btnMode)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors flex-grow text-center ${mode === btnMode ? 'text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
            style={{backgroundColor: mode === btnMode ? 'var(--color-primary-600)' : 'transparent'}}
        >
            {text}
        </button>
    );

    if (isLoading) {
        return <LoadingState title="Generating your recipe..." message="Our AI chef is at work!" />;
    }
    
    if (error) {
        return <ErrorState message={error} onRetry={reset} />;
    }
    
    if (recipe) {
        return (
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6">
                <RecipeDisplay recipe={recipe} setRecipe={setRecipe} />
                 <button onClick={reset} className="font-bold py-3 px-8 rounded-full transition-colors text-white" style={{backgroundColor: 'var(--color-primary-600)'}}>
                    Generate Another Recipe
                </button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-2xl mx-auto text-center animate-fade-in">
            <FeatureIntro
                title="Advanced Recipe Generator"
                description="Describe a meal, or tell us what ingredients you have, and our AI will create a unique recipe for you."
            />
            
            <div className="mt-6 mb-8 p-1 bg-gray-100/80 rounded-lg flex flex-wrap justify-center gap-1 max-w-sm mx-auto">
                <ModeButton btnMode='prompt' text="Describe Idea" />
                <ModeButton btnMode='ingredients' text="Use My Ingredients" />
            </div>

            {mode === 'prompt' ? (
                 <PromptForm
                    onSubmit={handleSubmit}
                    placeholder="e.g., 'a quick high-protein vegan breakfast'"
                    buttonText="Generate Recipe"
                    isLoading={isLoading}
                />
            ) : (
                <IngredientInput 
                    ingredients={ingredients}
                    setIngredients={setIngredients}
                    onSubmit={() => handleSubmit("User has provided ingredients.")}
                    isLoading={isLoading}
                />
            )}
            <div className="mt-8 text-center animate-fade-in" style={{animationDelay: '200ms'}}>
                <button onClick={handleShowSample} className="group inline-flex items-center gap-2 px-6 py-2 text-gray-600 font-medium rounded-full bg-gray-100/80 border border-gray-200 hover:border-primary-400 hover:text-primary-700 transition-all duration-300" style={{borderColor: 'var(--color-primary-400)', color: 'var(--color-primary-700)'}}>
                    <SparklesIcon className="w-5 h-5 text-primary-500/70 group-hover:text-primary-600 transition-colors group-hover:scale-110" />
                    See a sample recipe
                </button>
            </div>
        </div>
    );
};