import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/Card';

interface IngredientConfirmationProps {
    imagePreviewUrl: string | null;
    initialIngredients: string[];
    onConfirm: (ingredients: string[]) => void;
    onCancel: () => void;
}

const IngredientPill: React.FC<{ text: string; onRemove: () => void }> = ({ text, onRemove }) => (
    <div className="flex items-center bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full animate-fade-in-fast">
        <span>{text}</span>
        <button onClick={onRemove} className="ml-2 text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
);

export const IngredientConfirmation: React.FC<IngredientConfirmationProps> = ({ imagePreviewUrl, initialIngredients, onConfirm, onCancel }) => {
    const [ingredients, setIngredients] = useState<string[]>(initialIngredients);
    const [newIngredient, setNewIngredient] = useState('');
    const addIngredientInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        addIngredientInput.current?.focus();
    }, []);

    const handleRemove = (indexToRemove: number) => {
        setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newIngredient.trim() && !ingredients.map(i=>i.toLowerCase()).includes(newIngredient.toLowerCase().trim())) {
            setIngredients([...ingredients, newIngredient.trim()]);
            setNewIngredient('');
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto flex flex-col items-center animate-slide-in-from-bottom">
            {imagePreviewUrl && (
                <img src={imagePreviewUrl} alt="Meal preview" className="rounded-lg max-h-64 mb-6 shadow-lg" />
            )}
            <h2 className="text-2xl font-bold text-gray-900">Confirm Ingredients</h2>
            <p className="text-gray-600 mt-2 text-center">
                We've identified these ingredients. Add or remove any to improve accuracy.
            </p>

            <div className="w-full my-6 p-4 bg-gray-50 rounded-lg min-h-[8rem] border border-gray-200">
                <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient, index) => (
                        <IngredientPill key={index} text={ingredient} onRemove={() => handleRemove(index)} />
                    ))}
                </div>
            </div>

            <form onSubmit={handleAdd} className="w-full flex gap-3">
                <input
                    ref={addIngredientInput}
                    type="text"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    placeholder="Add a missing ingredient..."
                    className="flex-grow p-3 bg-white border border-gray-300 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />
                <button type="submit" className="px-5 py-3 font-semibold text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                    Add
                </button>
            </form>

            <div className="w-full mt-6 flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onCancel}
                    className="w-full px-8 py-3 font-semibold text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onConfirm(ingredients)}
                    className="w-full px-8 py-3 font-semibold text-white rounded-full shadow-lg transition-all duration-300"
                    style={{backgroundColor: 'var(--color-primary-600)'}}
                >
                    Analyze Ingredients
                </button>
            </div>
        </Card>
    );
};