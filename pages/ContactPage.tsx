import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/Spinner';

export const ContactPage: React.FC = () => {
    const { user, submitContactForm } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() === '' || name.trim() === '' || email.trim() === '') {
            setError('Please fill out all fields.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await submitContactForm({ name, email, message });
            setSuccess(true);
        } catch (err) {
            setError('Failed to send message. Please try again later.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="w-full max-w-2xl mx-auto py-12 px-4 text-center">
                <Card>
                    <h2 className="text-3xl font-bold text-primary-800" style={{color: 'var(--color-primary-800)'}}>Message Sent!</h2>
                    <p className="mt-2 text-gray-600">Thank you for contacting us. We'll get back to you as soon as possible.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto py-12 px-4 animate-fade-in">
            <Card>
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900">Contact Us</h1>
                    <p className="mt-2 text-lg text-gray-600">Have questions? We'd love to hear from you.</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mt-1 p-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                            required
                            disabled={!!user}
                        />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 p-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                            required
                            disabled={!!user}
                        />
                    </div>
                     <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                        <textarea
                            id="message"
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="How can we help you today?"
                            className="w-full mt-1 p-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                     {error && <p className="text-rose-600 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 font-semibold text-white rounded-full shadow-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{backgroundColor: 'var(--color-primary-600)'}}
                    >
                        {isSubmitting && <Spinner />}
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </Card>
        </div>
    );
};