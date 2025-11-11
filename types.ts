export interface Micronutrient {
  name: string;
  amount: string;
  description: string;
}

export interface ProsCons {
  pros: string[];
  cons: string[];
}

export interface AlternativeSuggestion {
    dishName: string;
    description: string;
    justification: string;
    suggestionType: string; // New: e.g., 'Quick Swap', 'Ideal Meal'
}

export interface NutritionData {
  protein: number;
  carbohydrates: number;
  fat: number;
  calories: number;
  sugar: number;
  sodium: number;
  dishName: string;
  ingredients: string[];
  healthScore: string;
  healthTip: string;
  micronutrients: Micronutrient[];
  prosCons: ProsCons;
  goalBasedVerdict?: string;
}

export interface RecipeData {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  servings: string;
  prepTime: string;
  nutritionInfo?: Omit<NutritionData, 'micronutrients' | 'prosCons' | 'goalBasedVerdict'>;
  suggestions?: string[]; // New: AI suggestions for the recipe
}

export interface Meal {
  dishName: string;
  description:string;
  ingredients: string[];
}

export interface DailyMealPlan {
  dayOfWeek: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal;
}

export interface MealPlanReview {
    overview: string;
    weeklyTips: string[];
}

export interface WeeklyMealPlan {
  title: string;
  days: DailyMealPlan[];
  review?: MealPlanReview; // New: AI review of the meal plan
}

export interface ShoppingList {
    categories: {
        categoryName: string;
        items: string[];
    }[];
}

export interface UiChatMessage {
  isUser: boolean;
  text: string;
  isLoading?: boolean;
}


// --- Auth and User Management Types ---

export type Plan = 'free' | 'pro' | 'pending';

export interface User {
  uid: string;
  name: string;
  email: string;
  plan: Plan;
  analysisCount: number;
  chatCount: number;
  lastResetDate: number;
  planExpiryDate?: number;
  role?: 'admin' | 'user';
  healthGoal?: string;
}

export interface UpgradeRequest {
  id: string;
  userId: string;
  userEmail: string;
  nameOnPayment: string;
  utrNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
  approvedAt?: any;
  rejectedAt?: any;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  reviewText: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read';
  submittedAt: any;
  userId?: string;
}


export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  incrementAnalysisCount: () => Promise<void>;
  incrementChatCount: () => Promise<void>;
  submitUpgradeRequest: (details: { nameOnPayment: string, utrNumber: string }) => Promise<void>;
  submitReview: (details: { reviewText: string, rating: number }) => Promise<void>;
  submitContactForm: (details: { name: string; email: string; message: string }) => Promise<void>;
  updateUserGoal: (goal: string) => Promise<void>;
}

export interface UIContextType {
    isUpgradeModalOpen: boolean;
    openUpgradeModal: () => void;
    closeUpgradeModal: () => void;
}