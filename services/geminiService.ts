import { GoogleGenAI, Type } from "@google/genai";
import type { NutritionData, RecipeData, WeeklyMealPlan, AlternativeSuggestion, ShoppingList, MealPlanReview } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

const getAi = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

// --- SCHEMAS ---
const ingredientSchema = {
    type: Type.OBJECT,
    properties: {
        isFood: { 
            type: Type.BOOLEAN, 
            description: "Set to true if the image contains edible food, otherwise false." 
        },
        ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of the primary ingredients identified in the dish. Return an empty array if isFood is false."
        }
    },
    required: ['isFood', 'ingredients']
};

const nutritionSchema = {
  type: Type.OBJECT,
  properties: {
    protein: { type: Type.NUMBER, description: "Estimated protein content in grams." },
    carbohydrates: { type: Type.NUMBER, description: "Estimated carbohydrate content in grams." },
    fat: { type: Type.NUMBER, description: "Estimated fat content in grams." },
    calories: { type: Type.NUMBER, description: "Estimated calorie content." },
    sugar: { type: Type.NUMBER, description: "Estimated sugar content in grams." },
    sodium: { type: Type.NUMBER, description: "Estimated sodium content in milligrams." },
    dishName: { type: Type.STRING, description: "A short, descriptive name for the dish in the image." },
    ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The provided list of primary ingredients for the dish." },
    healthScore: { type: Type.STRING, description: "A brief, encouraging health rating for the dish, like 'Excellent Choice', 'A Balanced Meal', or 'Enjoy in Moderation'." },
    healthTip: { type: Type.STRING, description: "A single, actionable tip to make this dish healthier." },
    micronutrients: { 
        type: Type.ARRAY, 
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                amount: { type: Type.STRING },
                description: { type: Type.STRING }
            },
            required: ['name', 'amount', 'description']
        },
        description: "A list of 3-5 key vitamins or minerals in the dish, their estimated amount, and a brief description of their benefit."
    },
    prosCons: {
        type: Type.OBJECT,
        properties: {
            pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 positive aspects of the dish." },
            cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 potential negative aspects or things to be mindful of." },
        },
        required: ['pros', 'cons']
    },
    goalBasedVerdict: { type: Type.STRING, description: "A specific verdict on how this meal aligns with the user's provided health goal. This field is mandatory." }
  },
  required: ['protein', 'carbohydrates', 'fat', 'calories', 'sugar', 'sodium', 'dishName', 'ingredients', 'healthScore', 'healthTip', 'micronutrients', 'prosCons', 'goalBasedVerdict'],
};

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The title of the recipe." },
    description: { type: Type.STRING, description: "A short, enticing description of the dish." },
    ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of ingredients with quantities." },
    instructions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step-by-step cooking instructions." },
    servings: { type: Type.STRING, description: "The number of servings the recipe makes." },
    prepTime: { type: Type.STRING, description: "The estimated preparation and cooking time." },
  },
  required: ['title', 'description', 'ingredients', 'instructions', 'servings', 'prepTime'],
};

const mealPlanSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A title for the meal plan, e.g., 'High-Protein Vegetarian Week'."},
        days: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    dayOfWeek: { type: Type.STRING },
                    breakfast: { type: Type.OBJECT, properties: { dishName: { type: Type.STRING }, description: { type: Type.STRING }, ingredients: { type: Type.ARRAY, items: {type: Type.STRING}}}},
                    lunch: { type: Type.OBJECT, properties: { dishName: { type: Type.STRING }, description: { type: Type.STRING }, ingredients: { type: Type.ARRAY, items: {type: Type.STRING}}}},
                    dinner: { type: Type.OBJECT, properties: { dishName: { type: Type.STRING }, description: { type: Type.STRING }, ingredients: { type: Type.ARRAY, items: {type: Type.STRING}}}},
                    snacks: { type: Type.OBJECT, properties: { dishName: { type: Type.STRING }, description: { type: Type.STRING }, ingredients: { type: Type.ARRAY, items: {type: Type.STRING}}}},
                },
                required: ['dayOfWeek', 'breakfast', 'lunch', 'dinner', 'snacks']
            }
        }
    },
    required: ['title', 'days'],
};

const alternativeSuggestionSchema = {
    type: Type.ARRAY,
    description: "A list of two healthier alternative dishes.",
    items: {
        type: Type.OBJECT,
        properties: {
            suggestionType: { type: Type.STRING, description: "A category for the suggestion, e.g., 'Quick Swap' or 'Ideal Meal'." },
            dishName: { type: Type.STRING, description: "The name of the healthier alternative dish." },
            description: { type: Type.STRING, description: "A brief, appealing description of the alternative." },
            justification: { type: Type.STRING, description: "A short explanation of WHY this alternative is a healthier choice for the user's goal." }
        },
        required: ['suggestionType', 'dishName', 'description', 'justification']
    }
};

const shoppingListSchema = {
    type: Type.OBJECT,
    properties: {
        categories: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    categoryName: { type: Type.STRING, description: "The name of the category, e.g., 'Produce', 'Protein', 'Dairy & Alternatives', 'Pantry', 'Spices & Oils'." },
                    items: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['categoryName', 'items']
            }
        }
    },
    required: ['categories']
};

const recipeSuggestionsSchema = {
    type: Type.ARRAY,
    items: { type: Type.STRING },
    description: "A list of 2-3 actionable suggestions to make the recipe healthier for the user's goal."
};

const mealPlanReviewSchema = {
    type: Type.OBJECT,
    properties: {
        overview: { type: Type.STRING, description: "A brief, encouraging overview of how the meal plan aligns with the user's goal." },
        weeklyTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-3 key tips for the user to keep in mind throughout the week."
        }
    },
    required: ['overview', 'weeklyTips']
};


// --- API FUNCTIONS ---
export const identifyIngredients = async (file: File): Promise<string[]> => {
    const ai = getAi();
    const base64Data = await fileToBase64(file);

    const imagePart = { inlineData: { mimeType: file.type, data: base64Data } };
    const textPart = { text: "Analyze the image. Does it contain edible food? If yes, identify the main ingredients. If not, just indicate it's not food by setting isFood to false and providing an empty ingredients array. Provide only the JSON response based on the schema." };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: { responseMimeType: "application/json", responseSchema: ingredientSchema }
        });
        const parsed = JSON.parse(response.text.trim());
        
        if (!parsed.isFood) {
            throw new Error("The uploaded image does not appear to contain food.");
        }
        return parsed.ingredients || [];
    } catch (error) {
        console.error("Gemini API call failed (identifyIngredients):", error);
        if (error instanceof Error && error.message.includes("does not appear to contain food")) {
            throw error; // Re-throw the specific error
        }
        throw new Error("Failed to identify ingredients with Gemini API.");
    }
};


export const analyzeImage = async (file: File, ingredients: string[], goal: string): Promise<NutritionData> => {
  const ai = getAi();
  const base64Data = await fileToBase64(file);

  const imagePart = { inlineData: { mimeType: file.type, data: base64Data } };
  const textPart = { text: `Analyze the food in this image. The user has confirmed it contains: ${ingredients.join(', ')}. The user's primary health goal is "${goal}". Provide a detailed nutritional analysis. CRITICALLY, you must include a 'goalBasedVerdict' that directly addresses how this meal aligns with their specific goal. Provide only the JSON response based on the schema.` };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: { responseMimeType: "application/json", responseSchema: nutritionSchema }
    });
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini API call failed (analyzeImage):", error);
    throw new Error("Failed to analyze image with Gemini API.");
  }
};

export const generateRecipe = async (prompt: string, ingredients: string[] | null): Promise<RecipeData> => {
    const ai = getAi();
    let contents: string;
    if (ingredients && ingredients.length > 0) {
        contents = `Generate a healthy recipe that primarily uses the following ingredients: "${ingredients.join(', ')}". You can add common pantry staples if needed. The user also provided this context: "${prompt}". Ensure the recipe is easy to follow. Provide only the JSON response based on the schema.`;
    } else {
        contents = `Generate a healthy recipe based on the following request: "${prompt}". Ensure the recipe is easy to follow. Provide only the JSON response based on the schema.`;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: { responseMimeType: "application/json", responseSchema: recipeSchema }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Gemini API call failed (generateRecipe):", error);
        throw new Error("Failed to generate recipe with Gemini API.");
    }
};

export const generateMealPlan = async (prompt: string): Promise<WeeklyMealPlan> => {
    const ai = getAi();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Create a healthy, 7-day meal plan based on this request: "${prompt}". For each meal (breakfast, lunch, dinner, snacks), provide a dish name, a brief description, AND a list of its primary ingredients. Ensure the days are labeled Monday through Sunday. Provide only the JSON response based on the schema.`,
            config: { responseMimeType: "application/json", responseSchema: mealPlanSchema }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Gemini API call failed (generateMealPlan):", error);
        throw new Error("Failed to generate meal plan with Gemini API.");
    }
};

export const suggestAlternative = async (originalDish: string, goal: string): Promise<AlternativeSuggestion[]> => {
    const ai = getAi();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `The user ate "${originalDish}" but wants healthier alternatives that align with their goal of "${goal}". Suggest TWO distinct alternatives. For each, provide a dish name, a brief description, a justification, and a suggestionType. One suggestion should be a 'Quick Swap' (an easy, minor change), and the other should be an 'Ideal Meal' (a more comprehensively healthy option). Provide only the JSON response based on the schema.`,
            config: { responseMimeType: "application/json", responseSchema: alternativeSuggestionSchema }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Gemini API call failed (suggestAlternative):", error);
        throw new Error("Failed to suggest an alternative with Gemini API.");
    }
};

export const getNutritionForRecipe = async (recipe: RecipeData): Promise<Omit<NutritionData, 'micronutrients' | 'prosCons' | 'goalBasedVerdict'>> => {
    const ai = getAi();
    const recipeNutritionSchema = {
        type: Type.OBJECT,
        properties: {
          protein: { type: Type.NUMBER },
          carbohydrates: { type: Type.NUMBER },
          fat: { type: Type.NUMBER },
          calories: { type: Type.NUMBER },
          sugar: { type: Type.NUMBER },
          sodium: { type: Type.NUMBER },
          dishName: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          healthScore: { type: Type.STRING },
          healthTip: { type: Type.STRING },
        },
        required: ['protein', 'carbohydrates', 'fat', 'calories', 'sugar', 'sodium', 'dishName', 'ingredients', 'healthScore', 'healthTip'],
      };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following recipe, provide a nutritional analysis per serving. Title: ${recipe.title}. Ingredients: ${recipe.ingredients.join(', ')}. Instructions: ${recipe.instructions.join(' ')}. Servings: ${recipe.servings}. Provide only the JSON response based on the schema.`,
            config: { responseMimeType: "application/json", responseSchema: recipeNutritionSchema }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Gemini API call failed (getNutritionForRecipe):", error);
        throw new Error("Failed to get nutrition for recipe with Gemini API.");
    }
};

export const generateShoppingList = async (plan: WeeklyMealPlan): Promise<ShoppingList> => {
    const ai = getAi();
    const allIngredients = plan.days.flatMap(day => [
        ...day.breakfast.ingredients,
        ...day.lunch.ingredients,
        ...day.dinner.ingredients,
        ...day.snacks.ingredients
    ]);
    
    const uniqueIngredients = [...new Set(allIngredients)];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Here is a list of all ingredients needed for a 7-day meal plan: ${uniqueIngredients.join(', ')}. Please consolidate this list and organize it into logical shopping categories (e.g., Produce, Protein, Dairy & Alternatives, Pantry, Spices & Oils). Combine similar items (e.g., '1 onion', 'diced onion' should just be 'Onion'). Provide only the JSON response based on the schema.`,
            config: { responseMimeType: "application/json", responseSchema: shoppingListSchema }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Gemini API call failed (generateShoppingList):", error);
        throw new Error("Failed to generate shopping list with Gemini API.");
    }
};

export const getRecipeSuggestions = async (recipe: RecipeData, goal: string): Promise<string[]> => {
    const ai = getAi();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Given this recipe title: "${recipe.title}", and ingredients: "${recipe.ingredients.join(', ')}", and the user's health goal of "${goal}", provide 2-3 actionable suggestions to make this recipe even better aligned with their goal. The suggestions could be about ingredient swaps, cooking method changes, or portion control. The tone should be encouraging. Provide only the JSON array of strings based on the schema.`,
            config: { responseMimeType: "application/json", responseSchema: recipeSuggestionsSchema }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Gemini API call failed (getRecipeSuggestions):", error);
        throw new Error("Failed to get recipe suggestions with Gemini API.");
    }
};

export const getMealPlanReview = async (plan: WeeklyMealPlan, goal: string): Promise<MealPlanReview> => {
    const ai = getAi();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this 7-day meal plan for a user whose goal is "${goal}". The plan title is "${plan.title}". Provide a brief, encouraging overview of the plan and 2-3 key tips for them to keep in mind throughout the week to maximize their success (e.g., tips on hydration, meal prep, managing cravings). Provide only the JSON response based on the schema.`,
            config: { responseMimeType: "application/json", responseSchema: mealPlanReviewSchema }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Gemini API call failed (getMealPlanReview):", error);
        throw new Error("Failed to get meal plan review with Gemini API.");
    }
};