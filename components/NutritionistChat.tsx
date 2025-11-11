import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ImageUploader } from './ImageUploader';
import { Card } from './ui/Card';
import { Spinner } from './Spinner';
import { FeatureIntro } from './ui/FeatureIntro';
import type { UiChatMessage } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';

declare const jspdf: any;

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
};

const DownloadIcon = ({ className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

const ChatBubble: React.FC<{ message: UiChatMessage }> = ({ message }) => {
    const { isUser, text, isLoading } = message;
    
    // A simple regex-based markdown renderer for **bold** and *italic*
    const renderText = (txt: string) => {
        return txt
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-lg lg:max-w-2xl px-5 py-3 rounded-2xl ${
                    isUser
                        ? 'bg-primary-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
                style={{ backgroundColor: isUser ? 'var(--color-primary-600)' : '' }}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mx-1"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mx-1" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mx-1" style={{animationDelay: '0.2s'}}></div>
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderText(text) }}></p>
                )}
            </div>
        </div>
    );
};

export const FoodChat: React.FC = () => {
    const { user, incrementChatCount } = useAuth();
    const { openUpgradeModal } = useUI();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<UiChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [error, setError] = useState<string | null>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    const ai = useMemo(() => {
        if (!process.env.API_KEY) {
            console.error("API_KEY is not set");
            return null;
        }
        return new GoogleGenAI({ apiKey: process.env.API_KEY });
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleImageSelect = useCallback((file: File) => {
        if (!user) return;
        if (user.plan === 'free' && user.chatCount >= 5) {
            openUpgradeModal();
            return;
        }
        if (user.plan === 'pending') {
            alert("Your Pro plan is awaiting approval. You can perform more analyses once approved.");
            return;
        }
        resetChat();
        const previewUrl = URL.createObjectURL(file);
        setImageFile(file);
        setImagePreviewUrl(previewUrl);
    }, [user, openUpgradeModal]);

    const handleSend = async (prompt: string) => {
        const text = prompt.trim();
        if (!text || isLoading || !ai || !user) return;

        if (user.plan === 'free' && user.chatCount >= 5) {
            openUpgradeModal();
            return;
        }

        setIsLoading(true);
        setError(null);
        setChatHistory(prev => [...prev, { isUser: true, text }]);
        
        try {
            if (user.plan === 'free') {
                await incrementChatCount();
            }

            let currentChat = chatSession;
            // Initialize chat on first message
            if (!currentChat) {
                const systemInstruction = `You are a friendly, expert nutritionist and chef. Your goal is to help users understand the food in the image they've provided. Critically, tailor your advice to the user's primary health goal, which is: "${user.healthGoal || 'General Health'}". Start your first response with 'Hello!' or 'Heyy!'. Do not use greetings like 'Namaste'. Be encouraging and provide actionable, helpful advice. Analyze the image first, then answer their question. Render your responses in simple markdown.`;
                const newChat = ai.chats.create({ model: 'gemini-2.5-flash',
                    config: {
                         systemInstruction: systemInstruction
                    }
                });
                setChatSession(newChat);
                currentChat = newChat;
            }

            // Add loading indicator for model response
            setChatHistory(prev => [...prev, { isUser: false, text: '', isLoading: true }]);

            let responseStream;
            // If it's the first message, send the image
            if (chatHistory.length === 2 && imageFile) {
                 const base64Data = await fileToBase64(imageFile);
                 const imagePart = { inlineData: { mimeType: imageFile.type, data: base64Data } };
                 const textPart = { text };
                 responseStream = await currentChat.sendMessageStream({ message: [textPart, imagePart] });
            } else {
                 responseStream = await currentChat.sendMessageStream({ message: text });
            }
           
            let fullResponseText = '';
            for await (const chunk of responseStream) {
                const chunkText = chunk.text;
                fullResponseText += chunkText;
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { ...newHistory[newHistory.length - 1], text: fullResponseText };
                    return newHistory;
                });
            }

            // Final update to remove loading state
             setChatHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { isUser: false, text: fullResponseText, isLoading: false };
                return newHistory;
            });

        } catch (err) {
            console.error("Error sending message:", err);
            setError("Sorry, something went wrong. Please try again.");
            // Remove the loading bubble on error
            setChatHistory(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
            setUserInput('');
        }
    };
    
    const resetChat = useCallback(() => {
        setImageFile(null);
        if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreviewUrl);
        }
        setImagePreviewUrl(null);
        setChatSession(null);
        setChatHistory([]);
        setIsLoading(false);
        setUserInput('');
        setError(null);
    }, [imagePreviewUrl]);

    const handleDownloadChatPdf = async () => {
        if (user?.plan !== 'pro') {
            openUpgradeModal();
            return;
        }
        setIsDownloading(true);
        try {
            const { jsPDF } = jspdf;
            const doc = new jsPDF();
            let yPos = 15;
            const margin = 10;
            const pageWidth = doc.internal.pageSize.getWidth();
            const usableWidth = pageWidth - (2 * margin);
            
            doc.setFontSize(18);
            doc.text("EatLens - Food Chat Transcript", margin, yPos);
            yPos += 10;
            
            for (const message of chatHistory) {
                if (message.isLoading) continue;

                if (yPos > 270) { // New page check
                    doc.addPage();
                    yPos = 15;
                }

                doc.setFontSize(10);
                const textLines = doc.splitTextToSize(message.text, usableWidth * 0.7);
                const bubbleHeight = (textLines.length * 4) + 8;

                const isUser = message.isUser;
                const bubbleX = isUser ? (pageWidth - margin - (usableWidth * 0.75)) : margin;
                
                // Set colors
                isUser ? doc.setFillColor(13, 148, 136) : doc.setFillColor(241, 245, 249);
                isUser ? doc.setTextColor(255, 255, 255) : doc.setTextColor(15, 23, 42);

                doc.roundedRect(bubbleX, yPos, usableWidth * 0.75, bubbleHeight, 3, 3, 'F');
                doc.text(textLines, bubbleX + 3, yPos + 6);
                yPos += bubbleHeight + 5;
            }
            doc.save('eatlens-chat-transcript.pdf');
        } catch(err) {
            console.error("PDF generation failed:", err);
            alert("Could not generate PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    const suggestedPrompts = [
        "What is this dish called?",
        "Estimate the calories and macros.",
        "How can I make this healthier?",
        "Suggest a recipe for this.",
    ];
    
    if (!imageFile || !imagePreviewUrl) {
        return (
            <div className="w-full max-w-2xl mx-auto text-center animate-fade-in">
                <FeatureIntro
                    title="Chat with Your Food"
                    description="Upload a photo of your meal to start an interactive conversation. Ask about its nutrition, get recipe ideas, and more!"
                />
                <ImageUploader onImageSelect={handleImageSelect} />
            </div>
        );
    }

    const isProFeatureLocked = user?.plan === 'free' || user?.plan === 'pending';

    return (
         <Card className="w-full max-w-4xl mx-auto animate-fade-in flex flex-col h-[80vh]">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                     <img src={imagePreviewUrl} alt="Your meal" className="w-16 h-16 rounded-lg object-cover" />
                     <div>
                        <h2 className="text-xl font-bold text-gray-900">Food Conversation</h2>
                        <p className="text-sm text-gray-500">Ask me anything about this dish!</p>
                     </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleDownloadChatPdf}
                        disabled={isDownloading || chatHistory.length === 0}
                        className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                    >
                         {isDownloading ? <Spinner/> : <DownloadIcon className="w-5 h-5"/>}
                         {isProFeatureLocked && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-violet-500 ring-2 ring-white"></span>}
                    </button>
                    <button onClick={resetChat} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                        New Chat
                    </button>
                </div>
            </div>
            
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.map((msg, index) => <ChatBubble key={index} message={msg} />)}
                {error && <p className="text-rose-600 text-sm text-center">{error}</p>}
            </div>

             {chatHistory.length === 0 && (
                <div className="p-4 border-t border-gray-200">
                    <p className="text-sm text-center text-gray-500 mb-2">Try asking one of these:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {suggestedPrompts.map(p => (
                            <button key={p} onClick={() => handleSend(p)} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors">
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-4 border-t border-gray-200">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(userInput); }} className="flex items-center gap-3">
                     <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={user?.plan === 'free' ? `Ask... (${5 - (user?.chatCount || 0)} left)` : "Ask about your meal..."}
                        className="flex-grow p-3 bg-white border border-gray-300 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !userInput}
                        className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                         style={{backgroundColor: 'var(--color-primary-600)'}}
                    >
                        {isLoading ? <Spinner/> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>}
                    </button>
                </form>
            </div>
        </Card>
    );
};