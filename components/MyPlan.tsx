import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { Card } from './ui/Card';

// Re-using the star rating component from LandingPage.tsx
const StarRatingInput = ({ rating, setRating }: { rating: number, setRating: (r: number) => void }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex justify-center text-3xl">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button
                        type="button"
                        key={ratingValue}
                        className={`transition-colors duration-200 ${ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-slate-300'}`}
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                    >
                        <span className="star">&#9733;</span>
                    </button>
                );
            })}
        </div>
    );
};


const LeaveReviewForm = () => {
    const { submitReview } = useAuth();
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (success) {
        return (
            <div className="text-center bg-primary-50 border border-primary-200 rounded-2xl p-8" style={{backgroundColor: 'var(--color-primary-50)', borderColor: 'var(--color-primary-200)'}}>
                <h3 className="text-xl font-bold" style={{color: 'var(--color-primary-800)'}}>Thank you for your review!</h3>
                <p className="mt-2 text-slate-600">Your feedback will be reviewed by our team.</p>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 || reviewText.trim() === '') {
            setError('Please provide a rating and a review.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await submitReview({ reviewText, rating });
            setSuccess(true);
        } catch (err) {
            setError('Failed to submit review. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
             <h3 className="text-xl font-bold text-gray-800 text-center">Share Your Experience</h3>
            <div>
                <label className="block text-center text-sm font-medium text-slate-700 mb-2">Your Rating</label>
                <StarRatingInput rating={rating} setRating={setRating} />
            </div>
            <div>
                <label htmlFor="review" className="block text-sm font-medium text-slate-700 sr-only">Your Review</label>
                <textarea
                    id="review"
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us what you like about the app..."
                    className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>
            {error && <p className="text-rose-600 text-sm text-center">{error}</p>}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 font-semibold text-white rounded-full shadow-lg transition-colors disabled:opacity-50"
                style={{backgroundColor: 'var(--color-primary-600)'}}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};


export const MyPlan: React.FC = () => {
    const { user, updateUserGoal } = useAuth();
    const { openUpgradeModal } = useUI();
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [newGoal, setNewGoal] = useState(user?.healthGoal || '');

    if (!user) {
        return <p>Loading user data...</p>;
    }

    const handleGoalUpdate = async () => {
        if (newGoal.trim() && newGoal !== user.healthGoal) {
            try {
                await updateUserGoal(newGoal);
            } catch (error) {
                console.error("Failed to update goal:", error);
                // Optionally reset newGoal to the original goal
                setNewGoal(user.healthGoal || '');
            }
        }
        setIsEditingGoal(false);
    };

    const analysisPercentage = user.plan === 'free' ? (user.analysisCount / 3) * 100 : 100;
    const chatPercentage = user.plan === 'free' ? (user.chatCount / 5) * 100 : 100;
    const expiryDate = user.planExpiryDate ? new Date(user.planExpiryDate).toLocaleDateString() : 'N/A';

    return (
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
            {/* Left column for user info */}
            <div className="md:col-span-1 space-y-6">
                <Card>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">My Profile</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-semibold text-gray-900">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Primary Goal</p>
                            {isEditingGoal ? (
                                <div className="flex gap-2 mt-1">
                                    <input 
                                        type="text"
                                        value={newGoal}
                                        onChange={(e) => setNewGoal(e.target.value)}
                                        className="w-full p-2 bg-white border-b-2 border-gray-300 text-gray-800 focus:outline-none focus:border-primary-500 transition text-sm"
                                    />
                                    <button onClick={handleGoalUpdate} className="text-primary-600 text-sm font-semibold">Save</button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-gray-900">{user.healthGoal}</p>
                                    <button onClick={() => { setIsEditingGoal(true); setNewGoal(user.healthGoal || ''); }} className="text-sm text-primary-600 hover:underline">Edit</button>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Right column for plan and review */}
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">My Plan</h3>
                    {user.plan === 'free' && (
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-baseline mb-2">
                                    <p className="font-semibold text-gray-800">Free Analyses</p>
                                    <p className="text-sm text-gray-500 font-medium">{user.analysisCount} / 3 used</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${analysisPercentage}%`, backgroundColor: 'var(--color-primary-600)' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-baseline mb-2">
                                    <p className="font-semibold text-gray-800">Free Chats</p>
                                    <p className="text-sm text-gray-500 font-medium">{user.chatCount} / 5 used</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${chatPercentage}%`}}></div>
                                </div>
                            </div>
                            <button
                                onClick={openUpgradeModal}
                                className="w-full mt-6 py-3 font-semibold text-white rounded-full shadow-lg transition-colors"
                                style={{backgroundColor: 'var(--color-primary-600)'}}
                            >
                                ✨ Upgrade to Pro
                            </button>
                        </div>
                    )}
                    {user.plan === 'pro' && (
                        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="font-bold text-lg text-green-800">PRO PLAN ACTIVE</p>
                            <p className="text-sm text-gray-600 mt-1">You have unlimited access to all features.</p>
                            <p className="text-sm text-gray-500 mt-1">Expires on: {expiryDate}</p>
                        </div>
                    )}
                    {user.plan === 'pending' && (
                        <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="font-bold text-lg text-amber-800">UPGRADE PENDING</p>
                            <p className="text-sm text-gray-600 mt-1">Your request is under review. Access will be granted shortly.</p>
                        </div>
                    )}
                </Card>
                 <Card>
                    <LeaveReviewForm />
                </Card>
            </div>
        </div>
    );
};