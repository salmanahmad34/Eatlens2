import React, { useState, useEffect } from 'react';
import { getApprovedReviews } from '../services/userService';
import type { Review } from '../types';
import { AnimatedHero } from '../components/AnimatedHero';

// --- ICONS ---
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 00-1.622-3.385m0 5.043a15.998 15.998 0 01-3.388-1.62m-5.043-.025a15.998 15.998 0 00-3.388-1.622m0 5.043a15.998 15.998 0 01-1.622 3.385m3.388-1.622a15.998 15.998 0 00-1.622 3.385" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" style={{color: 'var(--color-primary-600)'}} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>;


// Feature Icons
const AnalyzerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104l-2.286 9.144a3.375 3.375 0 003.375 4.254h2.172a3.375 3.375 0 003.375-4.254L14.25 3.104m-4.5 0v1.071c0 .552-.448 1-1 1s-1-.448-1-1V3.104M9.75 3.104h4.5m-4.5 0a9 9 0 1011.25 0M9.75 3.104a9 9 0 11-11.25 0" /></svg>;
const RecipeBookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const PlannerCalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ScalesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>;


// --- SUB-COMPONENTS ---
const LandingPriceCard = ({ title, price, description, features, onSelect, buttonText, isFeatured = false }: { title: string, price: string, description: string, features: string[], onSelect: () => void, buttonText: string, isFeatured?: boolean }) => (
    <div className={`relative flex flex-col p-8 bg-white border rounded-2xl shadow-lg shadow-slate-200/20 ${isFeatured ? 'border-primary-500 ring-2 ring-primary-500/50' : 'border-slate-200'}`}>
        {isFeatured && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 text-sm font-semibold text-white bg-primary-600 rounded-full" style={{backgroundColor: 'var(--color-primary-600)'}}>Most Popular</div>}
        <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-slate-600">{description}</p>
        <div className="mt-6">
            <span className="text-5xl font-extrabold text-slate-900">{price}</span>
            <span className="text-slate-500 ml-2">/ one-time payment</span>
        </div>
        <ul className="mt-6 space-y-4 flex-grow">
            {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="text-slate-700">{feature}</span>
                </li>
            ))}
        </ul>
        <button 
            onClick={onSelect} 
            className={`w-full mt-8 py-3 font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${isFeatured ? 'text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
            style={{backgroundColor: isFeatured ? 'var(--color-primary-600)' : 'var(--color-slate-100)'}}
        >
            {buttonText}
        </button>
    </div>
);

const FaqItem = ({ q, a }: { q: string, a: string }) => {
    return (
        <details className="group border-b border-slate-200 py-4">
            <summary className="w-full flex justify-between items-center text-left font-semibold text-slate-800 cursor-pointer list-none">
                <span className="text-lg">{q}</span>
                <div className="text-slate-500 group-open:text-primary-600 transition-colors duration-300 transform group-open:rotate-180">
                  <PlusIcon className="group-open:hidden" />
                  <MinusIcon className="hidden group-open:block" />
                </div>
            </summary>
            <div className="mt-4 text-slate-600">
                <p>{a}</p>
            </div>
        </details>
    );
};


interface LandingPageProps {
    onGetStartedClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStartedClick }) => {
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const approvedReviews = await getApprovedReviews(3);
                setReviews(approvedReviews);
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            }
        };
        fetchReviews();
    }, []);

    return (
        <div className="w-full bg-white">
            {/* Hero Section */}
            <section className="relative text-center py-20 md:py-32 px-4 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-slate-50 [mask-image:radial-gradient(100%_50%_at_50%_0%,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0)_100%)]"></div>
                <div className="max-w-4xl mx-auto">
                    <h1 
                        className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tighter animate-fade-in"
                    >
                        Snap Your Food,
                        <span className="block mt-2 bg-gradient-to-r from-primary-600 to-primary-500 text-transparent bg-clip-text" style={{color: 'var(--color-primary-600)'}}>
                            Unlock Its Secrets.
                        </span>
                    </h1>
                   <AnimatedHero onGetStartedClick={onGetStartedClick} />
                </div>
            </section>
            
            {/* How It Works Section */}
            <section className="py-20 px-4 scroll-mt-24 bg-slate-50">
                 <div className="max-w-5xl mx-auto animate-fade-in text-center">
                    <h2 className="text-4xl font-extrabold mb-4 text-slate-900">Healthier Eating in 3 Simple Steps</h2>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-16">Go from a photo to a full nutritional breakdown in under a minute. It's that easy to make informed decisions about what you eat.</p>
                    <div className="relative grid md:grid-cols-3 gap-8 items-start">
                         <div className="hidden md:block absolute top-12 left-0 w-full h-px">
                            <svg width="100%" height="2" className="text-slate-300">
                                <line x1="0" y1="1" x2="100%" y2="1" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
                            </svg>
                        </div>
                        
                        <div className="relative flex flex-col items-center">
                            <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full text-primary-600 ring-8" style={{backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-600)', ringColor: 'var(--color-slate-50)'}}><CameraIcon /></div>
                            <h3 className="text-xl font-semibold text-slate-800">1. Snap Your Meal</h3>
                            <p className="mt-1 text-slate-500">Use your camera or upload a photo. Our AI identifies the ingredients in seconds.</p>
                        </div>
                        <div className="relative flex flex-col items-center">
                            <div className="w-24 h-24 mb-4 flex items-center justify-center bg-violet-100 rounded-full text-violet-600 ring-8" style={{ringColor: 'var(--color-slate-50)'}}><SparklesIcon /></div>
                            <h3 className="text-xl font-semibold text-slate-800">2. Confirm & Analyze</h3>
                            <p className="mt-1 text-slate-500">Quickly confirm the identified ingredients to ensure maximum accuracy for your analysis.</p>
                        </div>
                        <div className="relative flex flex-col items-center">
                            <div className="w-24 h-24 mb-4 flex items-center justify-center bg-sky-100 rounded-full text-sky-600 ring-8" style={{ringColor: 'var(--color-slate-50)'}}><ChartIcon /></div>
                            <h3 className="text-xl font-semibold text-slate-800">3. Get Actionable Insights</h3>
                            <p className="mt-1 text-slate-500">Receive a detailed report with macros, calories, micronutrients, and a health score.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Detailed Features Section */}
            <section id="features" className="py-24 bg-white scroll-mt-24">
                <div className="max-w-6xl mx-auto px-4 animate-fade-in text-center">
                    <h2 className="text-4xl font-extrabold text-center mb-4 text-slate-900">A Complete Suite of AI Nutrition Tools</h2>
                    <p className="text-center text-lg text-slate-600 mb-16 max-w-3xl mx-auto">Beyond simple calorie counting, EatLens gives you a holistic view of your diet and the tools to improve it.</p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 text-left">
                            <div className="w-16 h-16 mb-4 flex items-center justify-center bg-primary-100 rounded-xl text-primary-600" style={{backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-600)'}}><AnalyzerIcon /></div>
                            <h3 className="text-xl font-bold text-slate-800">Instant Nutritional Analysis</h3>
                            <p className="mt-2 text-slate-600">Snap a photo to get a full breakdown of macros, calories, key micronutrients, a health score, and actionable tips.</p>
                        </div>
                         <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 text-left">
                            <div className="w-16 h-16 mb-4 flex items-center justify-center bg-sky-100 rounded-xl text-sky-600"><RecipeBookIcon /></div>
                            <h3 className="text-xl font-bold text-slate-800">Recipes Tailored to You</h3>
                            <p className="mt-2 text-slate-600">Describe what you want to eat, and our AI chef will generate a unique, healthy recipe complete with ingredients and instructions.</p>
                        </div>
                         <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 text-left">
                            <div className="w-16 h-16 mb-4 flex items-center justify-center bg-amber-100 rounded-xl text-amber-600"><PlannerCalendarIcon /></div>
                            <h3 className="text-xl font-bold text-slate-800">Intelligent Weekly Planning</h3>
                            <p className="mt-2 text-slate-600">Tell us your dietary goals, and our AI will craft a balanced 7-day meal plan, saving you time and guesswork.</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 text-left">
                            <div className="w-16 h-16 mb-4 flex items-center justify-center bg-violet-100 rounded-xl text-violet-600"><ScalesIcon /></div>
                            <h3 className="text-xl font-bold text-slate-800">Make Smarter Choices</h3>
                            <p className="mt-2 text-slate-600">Enter any two foods to get a side-by-side comparison and an AI verdict on which is better for your specific goals.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* From Our Users Section */}
            {reviews.length > 0 && (
                <section className="py-24 bg-slate-50">
                    <div className="max-w-5xl mx-auto px-4 animate-fade-in text-center">
                        <h2 className="text-4xl font-extrabold text-center mb-4 text-slate-900">What Our Users Say</h2>
                        <p className="text-center text-lg text-slate-600 mb-12">We're helping people everywhere make smarter food choices.</p>
                        <div className="grid md:grid-cols-3 gap-8 text-left">
                            {reviews.map(review => (
                                <div key={review.id} className="bg-white border border-slate-200/60 rounded-2xl p-6 flex flex-col shadow-lg shadow-slate-200/20">
                                    <div className="flex items-center mb-4">
                                        {'★'.repeat(review.rating).split('').map((_, i) => <span key={i} className="text-yellow-400 text-xl">&#9733;</span>)}
                                        {'☆'.repeat(5 - review.rating).split('').map((_, i) => <span key={i} className="text-slate-300 text-xl">&#9733;</span>)}
                                    </div>
                                    <p className="text-slate-600 flex-grow">"{review.reviewText}"</p>
                                    <p className="mt-4 font-bold text-slate-800">- {review.userName}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-white scroll-mt-24">
                <div className="max-w-5xl mx-auto px-4 animate-fade-in">
                    <h2 className="text-4xl font-extrabold text-center mb-4 text-slate-900">Choose Your Plan</h2>
                    <p className="text-center text-lg text-slate-600 mb-12 max-w-2xl mx-auto">Start for free and upgrade when you're ready for unlimited power.</p>
                    <div className="grid md:grid-cols-2 gap-8 items-stretch">
                        <LandingPriceCard 
                            title="Free"
                            price="Free"
                            description="Perfect for getting started and casual tracking."
                            features={[
                                "3 Meal Analyses per month",
                                "Basic Macro & Calorie Tracking",
                                "Access to all AI Tools",
                                "Email Support"
                            ]}
                            onSelect={onGetStartedClick}
                            buttonText="Get Started"
                        />
                        <LandingPriceCard 
                            title="Pro"
                            price="₹149"
                            description="For the dedicated user committed to their health."
                            features={[
                                "Unlimited Meal Analyses",
                                "Detailed Micronutrient & Health Scores",
                                "Save & Export Meal Plans (PDF)",
                                "AI-Generated Shopping Lists",
                                "Priority Support"
                            ]}
                            isFeatured={true}
                            onSelect={onGetStartedClick}
                            buttonText="Upgrade to Pro"
                        />
                    </div>
                </div>
            </section>

             {/* FAQ Section */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-3xl mx-auto px-4 animate-fade-in">
                    <h2 className="text-4xl font-extrabold text-center mb-12 text-slate-900">Frequently Asked Questions</h2>
                    <div className="space-y-2">
                        <FaqItem 
                            q="How accurate is the nutritional analysis?"
                            a="Our AI provides a highly accurate estimate based on visual analysis and a vast database of food items. While it's a powerful tool for guidance, it should be treated as an estimate and not a lab-certified analysis."
                        />
                        <FaqItem 
                            q="Is my data and are my photos private?"
                            a="Yes. Your privacy is our priority. Images are sent to the AI for analysis and are not stored on our servers. All your personal account information is securely managed and never shared."
                        />
                        <FaqItem 
                            q="What happens after my 3 free analyses are used?"
                            a="After you use your 3 free analyses for the month, you can upgrade to the Pro plan for unlimited analyses. Your free count will reset 30 days after your first analysis."
                        />
                         <FaqItem 
                            q="Is the Pro plan a recurring subscription?"
                            a="No, the current Pro plan is a one-time payment for 30 days of access. You can choose to upgrade again after the period expires."
                        />
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-4xl mx-auto px-4 text-center animate-fade-in">
                    <h2 className="text-5xl font-extrabold text-slate-900 leading-tight">Ready to Transform Your Health?</h2>
                    <p className="mt-4 text-xl text-slate-600">Join thousands of users who are taking control of their nutrition with EatLens.</p>
                    <button onClick={onGetStartedClick} className="mt-8 px-10 py-5 font-semibold text-white rounded-full shadow-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 text-lg" style={{backgroundColor: 'var(--color-primary-600)',  boxShadow: '0 10px 15px -3px rgba(234, 88, 12, 0.3), 0 4px 6px -2px rgba(234, 88, 12, 0.2)'}}>
                        Get Started for Free
                    </button>
                </div>
            </section>
        </div>
    );
};