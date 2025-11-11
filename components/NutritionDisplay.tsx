import React, { useState, useRef } from 'react';
import type { NutritionData, AlternativeSuggestion } from '../types';
import { Card } from './ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { suggestAlternative } from '../services/geminiService';
import { Spinner } from './Spinner';

declare const jspdf: any;
declare const html2canvas: any;

// ICONS
const ArrowRightIcon = ({ className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const CheckCircleIcon = ({ className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const XCircleIcon = ({ className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
const DnaIcon = ({ className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>;
const LockIcon = ({ className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002 2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>;
const SparklesIcon = ({ className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm12 1a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V3a1 1 0 011-1zM5 12a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM11 5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM11 9a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM11 13a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"/></svg>;
const DownloadIcon = ({ className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;


// SUB-COMPONENTS
const HealthScoreBadge = ({ score }: { score: string }) => {
    const lowerCaseScore = score.toLowerCase();
    const colorClass = lowerCaseScore.includes('excellent') || lowerCaseScore.includes('nutritious') ? 'bg-green-100 text-green-800 ring-green-200'
        : lowerCaseScore.includes('balanced') || lowerCaseScore.includes('good') ? 'bg-sky-100 text-sky-800 ring-sky-200'
        : lowerCaseScore.includes('moderation') || lowerCaseScore.includes('occasional') ? 'bg-amber-100 text-amber-800 ring-amber-200'
        : 'bg-rose-100 text-rose-800 ring-rose-200';
    return <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ring-1 ring-inset ${colorClass}`}>{score}</span>;
};

const MacroCircle = ({ radius, stroke, progress, color, rotation }: { radius: number, stroke: number, progress: number, color: string, rotation: number }) => {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  return <circle cx={radius + stroke / 2} cy={radius + stroke / 2} r={radius} fill="transparent" stroke={color} strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" transform={`rotate(${rotation} ${radius + stroke / 2} ${radius + stroke / 2})`} style={{ transition: 'stroke-dashoffset 1s ease-out' }} />;
};

const MacroLegend = ({ color, label, value }: { color: string, label: string, value: string }) => (
    <div className="flex items-center"><span className={`w-3 h-3 rounded-full mr-3 ${color}`}></span><div className="flex justify-between w-full"><p className="font-semibold text-gray-700">{label}</p><p className="text-gray-500 text-sm">{value}</p></div></div>
);

const AlternativeSuggestionDisplay: React.FC<{ dishName: string; goal: string; }> = ({ dishName, goal }) => {
    const [suggestions, setSuggestions] = useState<AlternativeSuggestion[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSuggest = async () => {
        setIsLoading(true);
        setError('');
        try {
            const result = await suggestAlternative(dishName, goal);
            setSuggestions(result);
        } catch (err) {
            setError('Could not generate suggestions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (suggestions) {
        return (
            <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                     <Card key={index} className="bg-primary-50 border-primary-200 animate-fade-in-fast" style={{backgroundColor: 'var(--color-primary-50)', borderColor: 'var(--color-primary-200)'}}>
                        <div className="flex justify-between items-start">
                             <h4 className="font-bold text-lg text-primary-800" style={{color: 'var(--color-primary-800)'}}>{suggestion.dishName}</h4>
                             <span className="px-2 py-0.5 text-xs font-bold text-sky-800 bg-sky-200 rounded-full">{suggestion.suggestionType}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{suggestion.description}</p>
                        <p className="text-sm text-gray-600 mt-2 italic"><strong>Why it's better:</strong> {suggestion.justification}</p>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="text-center">
            <button onClick={handleSuggest} disabled={isLoading} className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50" style={{backgroundColor: 'var(--color-primary-600)'}}>
                {isLoading ? <Spinner /> : <SparklesIcon className="w-5 h-5"/>}
                {isLoading ? 'Thinking...' : 'Suggest Healthier Alternatives'}
            </button>
            {error && <p className="text-rose-600 text-sm mt-2">{error}</p>}
        </div>
    );
};


// TABS CONTENT
const OverviewTab = ({ data }: { data: NutritionData }) => {
    const { protein, carbohydrates, fat, calories, healthTip } = data;
    const totalMacros = protein + carbohydrates + fat || 1;
    const proteinPercent = (protein / totalMacros) * 100;
    const carbsPercent = (carbohydrates / totalMacros) * 100;
    const fatPercent = (fat / totalMacros) * 100;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-fast">
            <Card className="flex flex-col sm:flex-row items-center justify-start gap-8">
                <div className="relative w-36 h-36 flex-shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 124 124">
                        <circle cx="62" cy="62" r="50" fill="transparent" stroke="#E5E7EB" strokeWidth="12" />
                        <MacroCircle radius={50} stroke={12} progress={proteinPercent} color="#0ea5e9" rotation={-90} />
                        <MacroCircle radius={50} stroke={12} progress={carbsPercent} color="#14b8a6" rotation={-90 + proteinPercent * 3.6} />
                        <MacroCircle radius={50} stroke={12} progress={fatPercent} color="#ec4899" rotation={-90 + (proteinPercent + carbsPercent) * 3.6} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center"><span className="text-3xl font-bold text-gray-800">{Math.round(calories)}</span><span className="text-sm text-gray-500 -mt-1">Calories</span></div>
                </div>
                <div className="space-y-3 w-full">
                    <MacroLegend color="bg-sky-500" label="Protein" value={`${protein.toFixed(1)}g`} />
                    <MacroLegend color="bg-teal-500" label="Carbs" value={`${carbohydrates.toFixed(1)}g`} />
                    <MacroLegend color="bg-pink-500" label="Fat" value={`${fat.toFixed(1)}g`} />
                </div>
            </Card>
            <Card>
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">Key Nutrients</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-baseline"><span className="text-gray-600">Sugar</span><span className="font-bold text-gray-900 text-lg">{data.sugar.toFixed(1)}g</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full fill-bar-animation" style={{ width: `${Math.min((data.sugar / 50) * 100, 100)}%` }}></div></div>
                    <div className="flex justify-between items-baseline"><span className="text-gray-600">Sodium</span><span className="font-bold text-gray-900 text-lg">{data.sodium.toFixed(0)}mg</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-sky-500 h-2 rounded-full fill-bar-animation" style={{ width: `${Math.min((data.sodium / 2300) * 100, 100)}%` }}></div></div>
                </div>
            </Card>
             <Card className="md:col-span-2 border-l-4 p-4" style={{backgroundColor: 'var(--color-primary-50)', borderColor: 'var(--color-primary-500)'}}>
                <p className="text-sm font-semibold" style={{color: 'var(--color-primary-800)'}}>💡 Health Tip</p>
                <p className="mt-1" style={{color: 'var(--color-primary-900)'}}>{healthTip}</p>
            </Card>
        </div>
    );
};

const MicronutrientsTab = ({ data }: { data: NutritionData }) => (
    <div className="animate-fade-in-fast">
        <Card>
            <h3 className="font-semibold text-gray-800 mb-4 text-lg">Key Vitamins & Minerals</h3>
            <div className="space-y-4 animate-fade-in-stagger">
                {data.micronutrients.map((micro, i) => (
                     <div key={micro.name} className="flex gap-4 items-start" style={{animationDelay: `${i * 100}ms`}}>
                        <div className="mt-1 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg" style={{backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-600)'}}><DnaIcon className="w-5 h-5"/></div>
                        <div>
                            <p className="font-bold text-gray-900">{micro.name} <span className="text-sm font-medium text-gray-500 ml-1">{micro.amount}</span></p>
                            <p className="text-sm text-gray-600">{micro.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    </div>
);

const VerdictTab = ({ data }: { data: NutritionData }) => (
    <div className="space-y-6 animate-fade-in-fast">
        {data.goalBasedVerdict && (
            <Card className="border-l-4 border-violet-500 bg-violet-50">
                <p className="text-sm font-semibold text-violet-800">🎯 Verdict for Your Goal: "{useAuth().user?.healthGoal}"</p>
                <p className="mt-1 text-violet-900">{data.goalBasedVerdict}</p>
            </Card>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <h3 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2"><CheckCircleIcon className="w-6 h-6 text-green-500"/>Pros</h3>
                <ul className="space-y-2">
                    {data.prosCons.pros.map((pro, i) => <li key={i} className="flex items-start gap-2 text-gray-700"><span className="text-green-500 mt-1">✓</span>{pro}</li>)}
                </ul>
            </Card>
            <Card>
                <h3 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2"><XCircleIcon className="w-6 h-6 text-rose-500"/>Cons</h3>
                <ul className="space-y-2">
                    {data.prosCons.cons.map((con, i) => <li key={i} className="flex items-start gap-2 text-gray-700"><span className="text-rose-500 mt-1">✗</span>{con}</li>)}
                </ul>
            </Card>
        </div>
        {useAuth().user?.plan === 'pro' && (
            <AlternativeSuggestionDisplay dishName={data.dishName} goal={useAuth().user?.healthGoal || 'General Health'} />
        )}
    </div>
);

// MAIN COMPONENT
type Tab = 'overview' | 'micronutrients' | 'verdict';

export const NutritionDisplay: React.FC<{ data: NutritionData; imageUrl: string; onReset: () => void; }> = ({ data, imageUrl, onReset }) => {
    const { user } = useAuth();
    const { openUpgradeModal } = useUI();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [isDownloading, setIsDownloading] = useState(false);
    const displayRef = useRef<HTMLDivElement>(null);

    const handleDownloadPdf = async () => {
        if (user?.plan !== 'pro') {
            openUpgradeModal();
            return;
        }
        if (!displayRef.current) return;
        setIsDownloading(true);

        try {
            const canvas = await html2canvas(displayRef.current, {
                backgroundColor: '#ffffff', // Set a white background
                scale: 2, // Increase resolution
                useCORS: true, // Handle cross-origin images
                onclone: (document) => {
                    // Hide buttons during capture
                    const buttons = document.querySelectorAll('.hide-on-pdf');
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
            pdf.save(`eatlens-analysis-${data.dishName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
        } catch (err) {
            console.error("Failed to generate PDF", err);
            alert("Could not generate PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };
    
    const handleTabClick = (tabId: Tab) => {
        const isProFeature = tabId === 'micronutrients' || tabId === 'verdict';
        if (!isProFeature) {
            setActiveTab(tabId);
            return;
        }

        if (user?.plan === 'pro') {
            setActiveTab(tabId);
        } else if (user?.plan === 'pending') {
            alert("Your Pro plan is awaiting approval. This feature will be available once your plan is activated.");
        } else {
            openUpgradeModal();
        }
    };

    const isFeatureLocked = (user?.plan === 'free' || user?.plan === 'pending');

    const TabButton = ({ id, label, isPro = false }: { id: Tab, label: string, isPro?: boolean }) => (
        <button 
            onClick={() => handleTabClick(id)} 
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === id ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`}
             style={{backgroundColor: activeTab === id ? 'var(--color-primary-600)' : 'transparent'}}
        >
            {label}
            {isFeatureLocked && isPro && <LockIcon className="w-4 h-4 text-violet-500" />}
        </button>
    );

    return (
        <div ref={displayRef} className="w-full max-w-7xl mx-auto animate-slide-in-from-bottom">
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* Left Column */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <Card className="p-0 overflow-hidden"><img src={imageUrl} alt="Analyzed meal" className="w-full h-auto object-cover" /></Card>
                    <Card>
                        <h3 className="text-lg font-bold text-gray-800 mb-3">Confirmed Ingredients</h3>
                        <div className="flex flex-wrap gap-2">{data.ingredients.map((item, i) => <span key={i} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">{item}</span>)}</div>
                    </Card>
                    <div className="flex flex-col sm:flex-row gap-4 hide-on-pdf">
                        <button onClick={onReset} className="flex-1 bg-gray-800 text-white font-bold py-3 px-6 rounded-full hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg">Analyze Another <ArrowRightIcon className="w-5 h-5 ml-2" /></button>
                        <button 
                            onClick={handleDownloadPdf}
                            disabled={isDownloading}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-gray-700 bg-gray-100 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {isDownloading ? <Spinner/> : <DownloadIcon className="w-5 h-5"/>}
                            {isDownloading ? 'Downloading...' : 'Download PDF'}
                            {isFeatureLocked && <span className="ml-2 text-xs font-bold bg-violet-500 text-white px-2 py-0.5 rounded-full">PRO</span>}
                        </button>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium" style={{color: 'var(--color-primary-700)'}}>Analysis Result</p>
                                <h2 className="text-4xl font-extrabold text-gray-900 capitalize mt-1">{data.dishName}</h2>
                            </div>
                            <HealthScoreBadge score={data.healthScore} />
                        </div>
                    </Card>

                    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                        <TabButton id="overview" label="Overview" />
                        <TabButton id="micronutrients" label="Micronutrients" isPro />
                        <TabButton id="verdict" label="AI Verdict" isPro />
                    </div>

                    {activeTab === 'overview' && <OverviewTab data={data} />}
                    {activeTab === 'micronutrients' && user?.plan === 'pro' && <MicronutrientsTab data={data} />}
                    {activeTab === 'verdict' && user?.plan === 'pro' && <VerdictTab data={data} />}
                </div>
            </div>
        </div>
    );
};