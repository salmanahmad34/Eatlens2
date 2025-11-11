import React, { useState, useRef } from 'react';
import { generateMealPlan, generateShoppingList, getMealPlanReview } from '../services/geminiService';
import type { WeeklyMealPlan, DailyMealPlan, Meal, ShoppingList, MealPlanReview } from '../types';
import { Card } from './ui/Card';
import { PromptForm } from './ui/PromptForm';
import { FeatureIntro } from './ui/FeatureIntro';
import { LoadingState } from './ui/LoadingState';
import { ErrorState } from './ui/ErrorState';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { Spinner } from './Spinner';

declare const jspdf: any;

const DownloadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);
const ListIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);
const SparklesIcon = ({ className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm12 1a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V3a1 1 0 011-1zM5 12a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM11 5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM11 9a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM11 13a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"/></svg>;


const ShoppingListModal: React.FC<{ list: ShoppingList, onClose: () => void }> = ({ list, onClose }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        const textToCopy = list.categories.map(cat => 
            `${cat.categoryName.toUpperCase()}\n- ${cat.items.join('\n- ')}`
        ).join('\n\n');
        
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-fast" onClick={onClose}>
            <Card className="w-full max-w-lg animate-slide-in-from-bottom relative" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Shopping List</h2>
                <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
                    {list.categories.map(category => (
                        <div key={category.categoryName}>
                            <h3 className="font-semibold text-primary-700" style={{color: 'var(--color-primary-700)'}}>{category.categoryName}</h3>
                            <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                                {category.items.map(item => <li key={item}>{item}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4 mt-6">
                    <button onClick={onClose} className="flex-1 px-6 py-2 font-semibold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200">Close</button>
                    <button onClick={handleCopy} className="flex-1 px-6 py-2 font-semibold text-white rounded-full" style={{backgroundColor: 'var(--color-primary-600)'}}>
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                </div>
            </Card>
         </div>
    )
};


const MealCard: React.FC<{title: string, meal: Meal, icon: React.ReactNode}> = ({ title, meal, icon }) => (
    <div className="bg-gray-50 p-4 rounded-lg flex gap-4 border border-gray-200">
        <div className="mt-1 flex-shrink-0 w-6 h-6" style={{color: 'var(--color-primary-600)'}}>{icon}</div>
        <div>
            <h4 className="font-bold" style={{color: 'var(--color-primary-700)'}}>{title}</h4>
            <h5 className="font-semibold text-gray-800 mt-1">{meal.dishName}</h5>
            <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
        </div>
    </div>
);

const DailyPlanDisplay: React.FC<{plan: DailyMealPlan}> = ({ plan }) => (
    <div className="w-full text-left animate-fade-in-fast">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MealCard title="Breakfast" meal={plan.breakfast} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
            <MealCard title="Lunch" meal={plan.lunch} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M20 12a8 8 0 11-16 0 8 8 0 0116 0z" /><path d="M12 18a6 6 0 100-12 6 6 0 000 12z" /></svg>} />
            <MealCard title="Dinner" meal={plan.dinner} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>} />
            <MealCard title="Snacks" meal={plan.snacks} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l1.414 1.414M12 6.586l3.536 3.535M17 5l-1.414 1.414M12 17.414l-3.536-3.535" /></svg>} />
        </div>
    </div>
);

export const MealPlanner: React.FC = () => {
    const { user } = useAuth();
    const { openUpgradeModal } = useUI();
    const [plan, setPlan] = useState<WeeklyMealPlan | null>(null);
    const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isGeneratingList, setIsGeneratingList] = useState(false);
    const [isGeneratingReview, setIsGeneratingReview] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const planRef = useRef<HTMLDivElement>(null);

    const handleGenerateReview = async () => {
        if (!plan) return;
        if (user?.plan !== 'pro') {
            openUpgradeModal();
            return;
        }
        setIsGeneratingReview(true);
        try {
            const review = await getMealPlanReview(plan, user.healthGoal || 'General Health');
            setPlan({ ...plan, review });
        } catch (err) {
            alert("Could not generate AI plan review at this time.");
        } finally {
            setIsGeneratingReview(false);
        }
    };

    const handleGenerateList = async () => {
        if (!plan) return;
        if (user?.plan === 'free' || user?.plan === 'pending') {
            openUpgradeModal();
            return;
        }
        setIsGeneratingList(true);
        try {
            const list = await generateShoppingList(plan);
            setShoppingList(list);
            setIsListModalOpen(true);
        } catch (err) {
            alert("Could not generate shopping list at this time.");
        } finally {
            setIsGeneratingList(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (user?.plan === 'pending') {
            alert("Your Pro plan is awaiting approval. PDF downloads will be available once your plan is activated.");
            return;
        }
        if (user?.plan === 'free') {
            openUpgradeModal();
            return;
        }
        if (!plan) return;
        setIsDownloading(true);

        try {
            const { jsPDF } = jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            let y = 15;
            const margin = 15;
            const pageHeight = doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.getWidth();
            const usableWidth = pageWidth - (2 * margin);

            // Add main title
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(22);
            doc.text(plan.title, pageWidth / 2, y, { align: 'center' });
            y += 15;

            // Helper function to render a meal
            const renderMeal = (mealType: string, meal: Meal) => {
                const mealTitle = `${mealType}: ${meal.dishName}`;
                const descriptionLines = doc.splitTextToSize(meal.description, usableWidth - 5);
                const mealBlockHeight = 8 + (descriptionLines.length * 5) + 5;

                if (y + mealBlockHeight > pageHeight - 15) {
                    doc.addPage();
                    y = 15;
                }
                
                doc.setFont('Helvetica', 'bold');
                doc.setFontSize(12);
                doc.setTextColor(13, 148, 136); // Primary color
                doc.text(mealTitle, margin, y);
                y += 6;

                doc.setFont('Helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(100, 116, 139); // Gray color
                doc.text(descriptionLines, margin + 2, y);
                y += descriptionLines.length * 5 + 4;
            };

            // Loop through each day
            plan.days.forEach((day, index) => {
                const dayBlockHeight = 10 + (4 * 25); // Rough estimate
                if (y + dayBlockHeight > pageHeight - 15) {
                    doc.addPage();
                    y = 15;
                }

                // Day of week heading
                doc.setFont('Helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(15, 23, 42); // Slate 900
                doc.text(day.dayOfWeek, margin, y);
                doc.setDrawColor(226, 232, 240); // Slate 200
                doc.line(margin, y + 2, pageWidth - margin, y + 2);
                y += 10;
                
                renderMeal('Breakfast', day.breakfast);
                renderMeal('Lunch', day.lunch);
                renderMeal('Dinner', day.dinner);
                renderMeal('Snacks', day.snacks);
                
                if (index < plan.days.length - 1) {
                    y += 5; // Extra space between days
                }
            });

            // Add page numbers
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                doc.text('Your EatLens Meal Plan', margin, pageHeight - 10);
            }

            doc.save(`eatlens-7-day-plan-${plan.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
        } catch (err) {
            console.error("Failed to generate PDF", err);
            alert("Could not generate the PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };


    const handleSubmit = async (prompt: string) => {
        setIsLoading(true);
        setError(null);
        setPlan(null);

        try {
            const result = await generateMealPlan(prompt);
            setPlan(result);
            setSelectedDay(0);
        } catch (err) {
            setError('Sorry, we couldn\'t generate that meal plan. Please try a different request.');
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setPlan(null);
        setError(null);
    };
    
    if (isLoading) {
        return <LoadingState title="Planning your week..." message="Our AI nutritionist is crafting your 7-day plan." />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={reset} />;
    }
    
    if (plan) {
        const isProFeature = user?.plan === 'free' || user?.plan === 'pending';
        return (
            <>
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 animate-fade-in">
                <Card className="w-full">
                    <h2 className="text-3xl font-bold text-gray-900 text-center">{plan.title}</h2>
                     <div className="mt-6 p-1 bg-gray-100/80 rounded-lg flex flex-wrap justify-center gap-1">
                        {plan.days.map((day, index) => (
                             <button 
                                key={index} 
                                onClick={() => setSelectedDay(index)}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors flex-grow text-center ${selectedDay === index ? 'text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
                                style={{backgroundColor: selectedDay === index ? 'var(--color-primary-600)' : 'transparent'}}
                            >
                                {day.dayOfWeek}
                            </button>
                        ))}
                    </div>
                </Card>
                
                {plan.review ? (
                     <Card className="w-full bg-violet-50 border-violet-200">
                        <h3 className="text-lg font-semibold text-violet-800 flex items-center gap-2 mb-2"><SparklesIcon className="w-5 h-5"/>AI Plan Review</h3>
                        <p className="text-violet-900 mb-3">{plan.review.overview}</p>
                        <h4 className="font-semibold text-violet-800">Weekly Tips:</h4>
                        <ul className="list-disc list-inside text-violet-900 space-y-1 mt-1">
                            {plan.review.weeklyTips.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                    </Card>
                ) : (
                    <div className="w-full">
                        <button 
                            onClick={handleGenerateReview}
                            disabled={isGeneratingReview}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-gray-700 bg-gray-100 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {isGeneratingReview ? <Spinner /> : <SparklesIcon className="w-5 h-5" />}
                            {isGeneratingReview ? 'Reviewing...' : 'Get AI Plan Review'}
                            {isProFeature && <span className="ml-2 text-xs font-bold bg-violet-500 text-white px-2 py-0.5 rounded-full">PRO</span>}
                        </button>
                    </div>
                )}
                
                <Card ref={planRef} className="w-full p-6">
                    <DailyPlanDisplay plan={plan.days[selectedDay]} />
                </Card>

                 <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center gap-4">
                     <button 
                        onClick={reset} 
                        className="w-full sm:w-auto flex-1 px-8 py-3 font-semibold text-white rounded-full shadow-lg hover:opacity-90 transition-all duration-300"
                        style={{backgroundColor: 'var(--color-primary-600)'}}
                    >
                        Create Another Plan
                    </button>
                    <button 
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                        className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-gray-700 bg-gray-100 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        {isDownloading ? 'Downloading...' : 'Download 7-Day Plan'}
                         {isProFeature && <span className="ml-2 text-xs font-bold bg-violet-500 text-white px-2 py-0.5 rounded-full">PRO</span>}
                    </button>
                     <button 
                        onClick={handleGenerateList}
                        disabled={isGeneratingList}
                        className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-gray-700 bg-gray-100 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {isGeneratingList ? <Spinner /> : <ListIcon className="w-5 h-5" />}
                        {isGeneratingList ? 'Generating...' : 'Shopping List'}
                         {isProFeature && <span className="ml-2 text-xs font-bold bg-violet-500 text-white px-2 py-0.5 rounded-full">PRO</span>}
                    </button>
                 </div>
            </div>
            {isListModalOpen && shoppingList && <ShoppingListModal list={shoppingList} onClose={() => setIsListModalOpen(false)} />}
            </>
        )
    }

    return (
        <div className="w-full max-w-2xl mx-auto text-center animate-fade-in">
             <FeatureIntro
                title="Weekly Meal Planner"
                description="Tell us your dietary goals, and our AI will create a balanced 7-day meal plan for you."
            />
            <PromptForm
                onSubmit={handleSubmit}
                placeholder="e.g., 'a low-carb week around 1800 calories'"
                buttonText="Plan My Week"
                isLoading={isLoading}
            />
        </div>
    );
};