import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User, AuthContextType } from '../types';
import { auth, db } from '../services/firebase';
import { 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    User as FirebaseUser,
    sendEmailVerification,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to check if a month (30 days) has passed
const hasMonthPassed = (timestamp: number): boolean => {
    const monthInMs = 30 * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp > monthInMs;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser && firebaseUser.emailVerified) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    let userData = userDocSnap.data() as Omit<User, 'uid'>;
                    let appUser: User = { uid: firebaseUser.uid, ...userData };

                    // Check for Pro plan expiration
                    if (appUser.plan === 'pro' && appUser.planExpiryDate && Date.now() > appUser.planExpiryDate) {
                        const newLastResetDate = Date.now();
                        const updates = {
                            plan: 'free' as const,
                            analysisCount: 0,
                            chatCount: 0,
                            lastResetDate: newLastResetDate,
                            planExpiryDate: undefined,
                        };
                        appUser = { ...appUser, ...updates };
                        await updateDoc(userDocRef, {
                            plan: 'free',
                            analysisCount: 0,
                            chatCount: 0,
                            lastResetDate: newLastResetDate,
                            planExpiryDate: deleteField() 
                        });
                    }
                    
                    // Check for free plan analysis count reset
                    if (appUser.plan === 'free' && hasMonthPassed(appUser.lastResetDate)) {
                        appUser = { ...appUser, analysisCount: 0, chatCount: 0, lastResetDate: Date.now() };
                        await updateDoc(userDocRef, { analysisCount: 0, chatCount: 0, lastResetDate: Date.now() });
                    }
                    setUser(appUser);
                } else {
                    console.error("User document not found in Firestore for UID:", firebaseUser.uid);
                    await firebaseSignOut(auth);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signUp = async (name: string, email: string, password: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Send verification email
        await sendEmailVerification(firebaseUser);

        const isAdmin = email.toLowerCase() === 'admin@eatlens.com';

        const newUser: Omit<User, 'uid'> = {
            name,
            email,
            plan: 'free',
            analysisCount: 0,
            chatCount: 0,
            lastResetDate: Date.now(),
            role: isAdmin ? 'admin' : 'user',
            healthGoal: 'General Health',
        };
        await setDoc(doc(db, "users", firebaseUser.uid), newUser);
        
        // Sign the user out until they verify
        await firebaseSignOut(auth);
    };

    const signIn = async (email: string, password: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            // If email is not verified, resend the verification email and sign them out.
            await sendEmailVerification(userCredential.user);
            await firebaseSignOut(auth);
            const error = new Error("Please verify your email before signing in. We've sent a new link.");
            error.name = 'auth/email-not-verified';
            throw error;
        }
    };

    const sendPasswordResetEmail = async (email: string) => {
        await firebaseSendPasswordResetEmail(auth, email);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUser(null);
    };
    
    const incrementAnalysisCount = async () => {
        if (!user) throw new Error("No user is signed in.");
        if (user.plan === 'pro') return; // Pro users have unlimited analyses

        const userDocRef = doc(db, 'users', user.uid);
        const newCount = user.analysisCount + 1;

        setUser(currentUser => currentUser ? { ...currentUser, analysisCount: newCount } : null);
        
        await updateDoc(userDocRef, {
            analysisCount: newCount
        });
    };
    
    const incrementChatCount = async () => {
        if (!user) throw new Error("No user is signed in.");
        if (user.plan === 'pro') return;

        const userDocRef = doc(db, 'users', user.uid);
        const newCount = user.chatCount + 1;

        setUser(currentUser => currentUser ? { ...currentUser, chatCount: newCount } : null);
        
        await updateDoc(userDocRef, {
            chatCount: newCount
        });
    };

    const submitUpgradeRequest = async (details: { nameOnPayment: string, utrNumber: string }) => {
        if (!user) throw new Error("No user is signed in.");

        // 1. Create a request in the `upgradeRequests` collection
        await addDoc(collection(db, 'upgradeRequests'), {
            userId: user.uid,
            userEmail: user.email,
            nameOnPayment: details.nameOnPayment,
            utrNumber: details.utrNumber,
            status: 'pending',
            submittedAt: serverTimestamp()
        });

        // 2. Update the user's plan to 'pending'
        const userDocRef = doc(db, 'users', user.uid);
        setUser(currentUser => currentUser ? { ...currentUser, plan: 'pending' } : null);
        await updateDoc(userDocRef, {
            plan: 'pending'
        });
    };

    const submitReview = async (details: { reviewText: string; rating: number }) => {
        if (!user) throw new Error("No user is signed in.");

        await addDoc(collection(db, 'reviews'), {
            userId: user.uid,
            userName: user.name,
            reviewText: details.reviewText,
            rating: details.rating,
            status: 'pending',
            submittedAt: serverTimestamp()
        });
    };

    const submitContactForm = async (details: { name: string; email: string; message: string }) => {
        await addDoc(collection(db, 'contactMessages'), {
            ...details,
            status: 'new',
            submittedAt: serverTimestamp(),
            userId: auth.currentUser ? auth.currentUser.uid : null,
        });
    };
    
    const updateUserGoal = async (goal: string) => {
        if (!user) throw new Error("No user is signed in.");
        const userDocRef = doc(db, 'users', user.uid);
        
        setUser(currentUser => currentUser ? { ...currentUser, healthGoal: goal } : null);
        
        await updateDoc(userDocRef, {
            healthGoal: goal
        });
    };

    const value: AuthContextType = {
        user,
        loading,
        signUp,
        signIn,
        signOut,
        sendPasswordResetEmail,
        incrementAnalysisCount,
        incrementChatCount,
        submitUpgradeRequest,
        submitReview,
        submitContactForm,
        updateUserGoal,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};