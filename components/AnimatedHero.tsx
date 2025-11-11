import React, { useState, useEffect, useCallback } from 'react';

type AnimationStep = 'initial' | 'analyzing' | 'results' | 'chatting';

const foodImage = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2940&auto=format&fit=crop';

const SkeletonLoader: React.FC = () => (
    <div className="space-y-3 animate-pulse">
        <div className="h-5 w-3/4 mx-auto bg-gray-200 rounded"></div>
        <div className="flex items-center justify-center gap-4 pt-2">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
            </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
    </div>
);

const AnimatedStat: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
    <div className="flex-1">
        <p className="text-xs font-bold" style={{ color }}>{value}</p>
        <p className="text-[10px] text-gray-500 -mt-1">{label}</p>
    </div>
);

const AnimatedCalorieCounter: React.FC<{ endValue: number, active: boolean }> = ({ endValue, active }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (active) {
            let start = 0;
            const duration = 1200;
            const frameRate = 60;
            const increment = endValue / (duration / (1000 / frameRate));

            const counter = setInterval(() => {
                start += increment;
                if (start >= endValue) {
                    setCount(endValue);
                    clearInterval(counter);
                } else {
                    setCount(Math.ceil(start));
                }
            }, 1000 / frameRate);
            return () => clearInterval(counter);
        } else {
            setCount(0);
        }
    }, [active, endValue]);

    return <span className="text-4xl font-extrabold text-gray-800">{count}</span>;
};

export const AnimatedHero: React.FC<{ onGetStartedClick: () => void }> = ({ onGetStartedClick }) => {
    const [step, setStep] = useState<AnimationStep>('initial');
    const [key, setKey] = useState(0);

    const runAnimation = useCallback(() => {
        setKey(prev => prev + 1);
        setStep('initial');
        setTimeout(() => setStep('analyzing'), 500);
        setTimeout(() => setStep('results'), 2800);
        setTimeout(() => setStep('chatting'), 7000);
    }, []);

    useEffect(() => {
        runAnimation();
        const interval = setInterval(runAnimation, 11000); // Loop duration
        return () => clearInterval(interval);
    }, [runAnimation]);

    const renderScreenContent = () => {
        const isAnalyzing = step === 'analyzing';
        const isResults = step === 'results';
        const isChatting = step === 'chatting';

        return (
            <div key={key} className="w-full h-full bg-slate-50 font-sans text-sm overflow-hidden relative">
                {/* Analysis View (Image + Results) */}
                <div className={`absolute inset-0 p-3 transition-all duration-700 ease-in-out ${isChatting ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}>
                    <img src={foodImage} alt="Salad" className="w-full h-24 object-cover rounded-lg shadow-md" />
                    
                    {/* Content container */}
                    <div className="relative h-full">
                        {/* Analyzing Skeleton */}
                        <div className={`absolute inset-x-0 top-2 transition-opacity duration-300 ${isAnalyzing ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="relative text-center">
                                <h3 className="font-bold text-gray-700 text-lg">Analyzing...</h3>
                            </div>
                            <div className="shimmer-wrapper mt-3">
                                <SkeletonLoader />
                            </div>
                        </div>

                        {/* Results */}
                        <div className={`absolute inset-x-0 top-2 transition-opacity duration-500 ease-out ${isResults ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="flex justify-between items-start animate-fade-in-fast">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Chicken Salad</h3>
                                    <p className="text-xs text-gray-500 -mt-1">Analysis Result</p>
                                </div>
                                <span className="px-2 py-0.5 text-xs font-bold text-green-800 bg-green-200 rounded-full animate-scale-in" style={{animationDelay: '200ms'}}>Good Choice</span>
                            </div>
                            <div className="text-center my-3 animate-fade-in" style={{animationDelay: '400ms'}}>
                                <AnimatedCalorieCounter endValue={485} active={isResults} />
                                <p className="text-xs text-gray-500 -mt-1">Calories</p>
                            </div>
                            <div className="flex justify-around items-center text-center p-2 bg-white rounded-lg shadow-inner animate-fade-in" style={{animationDelay: '600ms'}}>
                                 <AnimatedStat label="Protein" value="25g" color="#38bdf8" />
                                 <AnimatedStat label="Carbs" value="15g" color="#fbbf24" />
                                 <AnimatedStat label="Fat" value="18g" color="#f472b6" />
                            </div>
                            <div className="mt-3 bg-primary-50 text-primary-900 text-center text-xs p-2 rounded-lg animate-slideInUp" style={{backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-900)', animationDelay: '800ms'}}>
                               💡 <span className="font-semibold">Health Tip:</span> Swap dressing for a light vinaigrette!
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat View */}
                <div className={`absolute inset-0 p-3 bg-slate-50 transition-all duration-700 ease-in-out ${isChatting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                        <img src={foodImage} alt="Salad thumbnail" className="w-8 h-8 rounded-full object-cover"/>
                        <p className="font-bold text-gray-800">Food Chat</p>
                    </div>
                    <div className="mt-2 space-y-2">
                        <div className="animate-slideInUp" style={{animationDelay: '0.2s'}}>
                           <div className="bg-white border border-gray-200 text-gray-800 p-2 rounded-lg rounded-bl-none max-w-[80%]">
                                Looks delicious! What would you like to know?
                           </div>
                        </div>
                        <div className="flex justify-end animate-slideInUp" style={{animationDelay: '1.2s'}}>
                           <div className="bg-primary-600 text-white p-2 rounded-lg rounded-br-none max-w-[80%]" style={{backgroundColor: 'var(--color-primary-600)'}}>
                                How can I make this healthier?
                           </div>
                        </div>
                         <div className="animate-slideInUp" style={{animationDelay: '2.5s'}}>
                           <div className="bg-white border border-gray-200 text-gray-800 p-2 rounded-lg rounded-bl-none max-w-[80%]">
                               Swap the dressing for a light vinaigrette to save on calories and fat!
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="mt-8 flex flex-col items-center animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div onClick={runAnimation} className="w-64 h-[480px] bg-slate-800 rounded-3xl p-2.5 shadow-2xl shadow-slate-300 cursor-pointer">
                <div className="w-full h-full bg-slate-50 rounded-2xl overflow-hidden relative">
                    {renderScreenContent()}
                </div>
            </div>
            <p className="mt-4 text-slate-500 text-sm">Eat smarter, not harder. See how it works.</p>
            <div className="mt-6">
                <button onClick={onGetStartedClick} className="px-8 py-4 font-semibold text-white rounded-full shadow-lg shadow-primary-500/30 hover:opacity-90 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-500/50" style={{backgroundColor: 'var(--color-primary-600)'}}>
                    Get Started for Free
                </button>
            </div>
        </div>
    );
};