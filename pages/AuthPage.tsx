import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { FirebaseError } from 'firebase/app';

interface AuthPageProps {
    onBack: () => void;
}

// Function to get a user-friendly error message
const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Invalid email or password.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters long.';
        case 'auth/email-not-verified':
            return 'Your email is not verified. We have sent a new verification link to your inbox. Please also check your spam folder.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
};


export const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
    const { signIn, signUp, sendPasswordResetEmail } = useAuth();
    const [view, setView] = useState<'signin' | 'signup' | 'reset'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setIsLoading(true);

        try {
            if (view === 'signup') {
                await signUp(name, email, password);
                setMessage(`A verification link has been sent to ${email}. Please check your inbox (and spam folder) to activate your account.`);
                setView('signin');
            } else if (view === 'signin') {
                await signIn(email, password);
                // On success, the onAuthStateChanged listener in AuthContext will handle navigation.
            } else if (view === 'reset') {
                await sendPasswordResetEmail(email);
                setMessage('Password reset link sent! Please check your inbox and spam folder.');
                setView('signin');
            }
        } catch (err) {
            if (err instanceof FirebaseError) {
                setError(getAuthErrorMessage(err.code));
            } else if (err instanceof Error && err.name === 'auth/email-not-verified') {
                setError(getAuthErrorMessage(err.name));
            }
            else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const isSignUp = view === 'signup';
    const isReset = view === 'reset';

    const getTitle = () => {
        if (isSignUp) return 'Create Account';
        if (isReset) return 'Reset Password';
        return 'Welcome Back';
    }
    
    const getDescription = () => {
        if (isSignUp) return 'Join EatLens to start your journey.';
        if (isReset) return 'Enter your email to receive a password reset link.';
        return 'Sign in to access your dashboard.';
    }

    const getButtonText = () => {
        if (isLoading) {
            if (isSignUp) return 'Creating Account...';
            if (isReset) return 'Sending Link...';
            return 'Signing In...';
        }
        if (isSignUp) return 'Sign Up';
        if (isReset) return 'Send Reset Link';
        return 'Sign In';
    }


    return (
        <div className="flex flex-col items-center justify-center p-4 w-full">
            <Card className="w-full max-w-md animate-fade-in-fast">
                <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 mb-4">&larr; Back to Home</button>
                <h2 className="text-3xl font-bold text-center text-slate-900">{getTitle()}</h2>
                <p className="text-center text-slate-600 mt-2">{getDescription()}</p>
                
                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    {isSignUp && (
                        <div>
                            <label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full mt-1 p-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full mt-1 p-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>

                    {!isReset && (
                        <div>
                            <div className="flex justify-between items-baseline">
                                <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                                {!isSignUp && (
                                    <button type="button" onClick={() => { setView('reset'); setError(null); setMessage(null); }} className="text-sm font-semibold text-primary-700 hover:text-primary-600" style={{color: 'var(--color-primary-700)'}}>
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full mt-1 p-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required={!isReset}
                            />
                        </div>
                    )}
                    
                    {error && <p className="text-sm text-rose-600 text-center">{error}</p>}
                    {message && <p className="text-sm text-green-600 text-center">{message}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-8 py-3 font-semibold text-white rounded-full shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{backgroundColor: 'var(--color-primary-600)'}}
                    >
                        {getButtonText()}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-600">
                        {isSignUp ? 'Already have an account?' : (isReset ? '' : "Don't have an account?")}
                        {isReset ? 
                            <button onClick={() => { setView('signin'); setError(null); }} className="ml-2 font-semibold text-primary-700 hover:text-primary-600" style={{color: 'var(--color-primary-700)'}}>
                                Back to Sign In
                            </button>
                            :
                            <button onClick={() => { setView(isSignUp ? 'signin' : 'signup'); setError(null); setMessage(null); }} className="ml-2 font-semibold text-primary-700 hover:text-primary-600" style={{color: 'var(--color-primary-700)'}}>
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        }
                    </p>
                </div>
            </Card>
        </div>
    );
};