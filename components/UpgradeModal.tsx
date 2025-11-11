import React, { useState } from 'react';
import { Card } from './ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from './Spinner';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" style={{color: 'var(--color-primary-600)'}} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const { submitUpgradeRequest } = useAuth();
    const [nameOnPayment, setNameOnPayment] = useState('');
    const [utrNumber, setUtrNumber] = useState('');
    const [view, setView] = useState<'form' | 'success' | 'submitting'>('form');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nameOnPayment.trim() || !utrNumber.trim()) {
            setError('Please fill out all fields.');
            return;
        }
        setError('');
        setView('submitting');
        try {
            await submitUpgradeRequest({ nameOnPayment, utrNumber });
            setView('success');
        } catch (err) {
            setError('There was an error submitting your request. Please try again.');
            setView('form');
        }
    };

    const handleClose = () => {
        onClose();
        // Reset state after a delay to allow for closing animation
        setTimeout(() => {
            setView('form');
            setNameOnPayment('');
            setUtrNumber('');
            setError('');
        }, 300);
    };

    if (!isOpen) return null;

    const qrCodeSrc = `/1762754117745.Screenshot_20251110-112453.jpg`;

    return (
        <div 
            className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-8 flex items-start justify-center bg-black/60 backdrop-blur-sm animate-fade-in-fast"
            onClick={handleClose}
        >
            <Card 
                className="w-full max-w-lg animate-slide-in-from-bottom relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <CloseIcon />
                </button>
                
                {view === 'success' ? (
                    <div className="text-center p-8">
                        <CheckIcon />
                        <h2 className="text-2xl font-bold text-gray-900 mt-4">Request Submitted!</h2>
                        <p className="text-gray-600 mt-2">
                            Your request to upgrade to the Pro plan has been received. Our team will review it and activate your plan within 24 hours.
                        </p>
                        <button 
                            onClick={handleClose} 
                            className="mt-6 px-8 py-3 font-semibold text-white rounded-full shadow-lg"
                            style={{backgroundColor: 'var(--color-primary-600)'}}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold text-center text-gray-900">Upgrade to Pro</h2>
                        <p className="text-center text-gray-600 mt-2">Unlock unlimited access to all features.</p>
                        
                        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <h3 className="font-semibold text-lg text-gray-800">Payment Instructions</h3>
                            <ol className="list-decimal list-inside text-gray-600 mt-2 space-y-1 text-sm">
                                <li>Scan the QR code below with any UPI app.</li>
                                <li>Pay the amount of <strong>₹149 (one-time)</strong>.</li>
                                <li>Enter the details from your payment confirmation below.</li>
                                <li>Submit your request. Your plan will be activated within 24 hours.</li>
                            </ol>
                            <div className="mt-4 flex justify-center">
                                <img src={qrCodeSrc} alt="UPI QR Code for Payment" className="w-48 h-48 rounded-lg border border-gray-300" />
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="nameOnPayment" className="text-sm font-medium text-gray-700">Name on Payment Account</label>
                                <input
                                    id="nameOnPayment"
                                    type="text"
                                    value={nameOnPayment}
                                    onChange={(e) => setNameOnPayment(e.target.value)}
                                    placeholder="e.g., John Doe"
                                    className="w-full mt-1 p-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="utrNumber" className="text-sm font-medium text-gray-700">UTR / Transaction ID</label>
                                <input
                                    id="utrNumber"
                                    type="text"
                                    value={utrNumber}
                                    onChange={(e) => setUtrNumber(e.target.value)}
                                    placeholder="e.g., 212345678901"
                                    className="w-full mt-1 p-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                            </div>

                            {error && <p className="text-sm text-rose-600 text-center">{error}</p>}

                            <button
                                type="submit"
                                disabled={view === 'submitting'}
                                className="w-full px-8 py-3 font-semibold text-white rounded-full shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{backgroundColor: 'var(--color-primary-600)'}}
                            >
                                {view === 'submitting' && <Spinner />}
                                {view === 'submitting' ? 'Submitting Request...' : 'Submit and Upgrade'}
                            </button>
                        </form>
                    </>
                )}
            </Card>
        </div>
    );
};