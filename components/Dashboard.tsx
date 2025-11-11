import React from 'react';
import type { View } from './Navigation';
import { Card } from './ui/Card';

const AnalyzeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>;
const RecipeBookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const PlannerCalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a1.125 1.125 0 01-1.59 0L13.5 18.5h-3.375a1.125 1.125 0 01-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125H10.5a.75.75 0 000-1.5H8.25a2.25 2.25 0 00-2.25 2.25v1.5a2.25 2.25 0 002.25 2.25h3.375m9.06-9.183c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a1.125 1.125 0 01-1.59 0L13.5 18.5h-3.375a1.125 1.125 0 01-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125H10.5a.75.75 0 000-1.5H8.25a2.25 2.25 0 00-2.25 2.25v1.5a2.25 2.25 0 002.25 2.25h3.375M15 3.75a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    className: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onClick, className }) => {
    return (
        <div
            className={`p-6 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/20 cursor-pointer transform hover:-translate-y-1 transition-transform duration-300 flex flex-col text-left ${className}`}
            onClick={onClick}
            style={{ animationDelay: '100ms' }}
        >
            <div className="w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-white">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <p className="mt-2 text-slate-600 flex-grow">{description}</p>
            <div className="mt-4 font-semibold flex items-center gap-2">
                Go to Tool <ArrowRightIcon />
            </div>
        </div>
    );
};

interface DashboardProps {
    onNavigate: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    return (
        <div className="w-full animate-fade-in-fast">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard
                    icon={<AnalyzeIcon />}
                    title="Analyze Meal"
                    description="Snap a photo of your food to get an instant, detailed nutritional breakdown."
                    onClick={() => onNavigate('analyze')}
                    className="bg-primary-50 text-primary-700 [&>div:first-child]:bg-primary-500"
                />
                <FeatureCard
                    icon={<RecipeBookIcon />}
                    title="Get a Recipe"
                    description="Describe a meal or list ingredients to generate a unique, healthy recipe from our AI."
                    onClick={() => onNavigate('recipe')}
                    className="bg-sky-50 text-sky-700 [&>div:first-child]:bg-sky-500"
                />
                <FeatureCard
                    icon={<PlannerCalendarIcon />}
                    title="Plan My Week"
                    description="Tell us your dietary goals to get a balanced 7-day meal plan, complete with a shopping list."
                    onClick={() => onNavigate('planner')}
                    className="bg-amber-50 text-amber-700 [&>div:first-child]:bg-amber-500"
                />
                <FeatureCard
                    icon={<ChatIcon />}
                    title="Chat with Food"
                    description="Upload a food photo and start an interactive conversation with our AI nutritionist."
                    onClick={() => onNavigate('foodchat')}
                    className="bg-violet-50 text-violet-700 [&>div:first-child]:bg-violet-500"
                />
            </div>
        </div>
    );
};
