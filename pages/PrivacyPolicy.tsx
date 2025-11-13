import React from 'react';
import { Card } from '../components/ui/Card';

export const PrivacyPolicy: React.FC = () => (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 animate-fade-in">
        <Card className="text-left">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Privacy Policy</h1>
            <div className="prose prose-lg text-gray-700 max-w-none space-y-4">
                <p><em>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>
                <p>Your privacy is important to us. It is EatLens's policy to respect your privacy regarding any information we may collect from you across our application.</p>
                
                <h2 className="text-2xl font-bold text-gray-800 !mt-8 !mb-3">1. Information We Collect</h2>
                <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Account Information:</strong> When you register for an account, we collect your name, email address, and password. This is stored securely via Firebase Authentication.</li>
                    <li><strong>Usage Data:</strong> We collect information about your interactions with the service, such as your meal analysis count. This data is used to enforce plan limits and improve our service.</li>
                    <li><strong>Uploaded Images:</strong> Images you upload for analysis are sent to the Google Gemini API for processing. We do not store these images on our servers after the analysis is complete.</li>
                    <li><strong>Payment Details:</strong> For Pro plan upgrades, we collect transaction details (your name and UTR number) to verify manual payments. This information is stored securely in Firestore and is only accessible to administrators for verification purposes.</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-800 !mt-8 !mb-3">2. How We Use Your Information</h2>
                <p>We use the information we collect in various ways, including to:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>Provide, operate, and maintain our service</li>
                    <li>Improve, personalize, and expand our service</li>
                    <li>Understand and analyze how you use our service</li>
                    <li>Communicate with you for customer service and to provide you with updates</li>
                    <li>Process your transactions and manage your upgrades</li>
                    <li>Find and prevent fraud</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-800 !mt-8 !mb-3">3. Security of Your Information</h2>
                <p>We are committed to protecting your personal information. We use Firebase's built-in security features to protect your data. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.</p>

                <h2 className="text-2xl font-bold text-gray-800 !mt-8 !mb-3">4. Changes to This Policy</h2>
                <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
                
                <h2 className="text-2xl font-bold text-gray-800 !mt-8 !mb-3">Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:support@eatlens.com" className="text-primary-700 hover:underline" style={{color: 'var(--color-primary-700)'}}>support@eatlens.com</a></p>
            </div>
        </Card>
    </div>
);