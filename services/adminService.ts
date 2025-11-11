import { db } from './firebase';
import { collection, query, where, getDocs, doc, writeBatch, serverTimestamp, updateDoc, orderBy, deleteField } from 'firebase/firestore';
import type { UpgradeRequest, User, Review, ContactMessage } from '../types';

export const getPendingRequests = async (): Promise<UpgradeRequest[]> => {
    const requestsRef = collection(db, 'upgradeRequests');
    const q = query(requestsRef, where('status', '==', 'pending'));
    
    const querySnapshot = await getDocs(q);
    const requests: UpgradeRequest[] = [];
    querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() } as UpgradeRequest);
    });

    // Sort by oldest first on the client to avoid composite index
    requests.sort((a, b) => {
        const timeA = a.submittedAt?.seconds ?? 0;
        const timeB = b.submittedAt?.seconds ?? 0;
        return timeA - timeB;
    });
    
    return requests;
};

export const getCompletedRequests = async (): Promise<UpgradeRequest[]> => {
    const requestsRef = collection(db, 'upgradeRequests');
    const q = query(requestsRef, where('status', 'in', ['approved', 'rejected']));
    
    const querySnapshot = await getDocs(q);
    const requests: UpgradeRequest[] = [];
    querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() } as UpgradeRequest);
    });
    
    // Sort by most recent completion time (approved or rejected)
    requests.sort((a, b) => {
        const timeA = a.approvedAt?.seconds ?? a.rejectedAt?.seconds ?? 0;
        const timeB = b.approvedAt?.seconds ?? b.rejectedAt?.seconds ?? 0;
        return timeB - timeA;
    });

    return requests;
};

export const getProUsers = async (): Promise<User[]> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('plan', '==', 'pro'));

    const querySnapshot = await getDocs(q);
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
        users.push({ uid: doc.id, ...doc.data() } as User);
    });

    return users;
};

export const getAllReviews = async (): Promise<Review[]> => {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, orderBy('submittedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    querySnapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() } as Review);
    });
    
    return reviews;
};

export const getContactMessages = async (): Promise<ContactMessage[]> => {
    const messagesRef = collection(db, 'contactMessages');
    const q = query(messagesRef, orderBy('submittedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const messages: ContactMessage[] = [];
    querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as ContactMessage);
    });
    
    return messages;
};

export const approveRequest = async (requestId: string, userId: string): Promise<void> => {
    const batch = writeBatch(db);

    const requestRef = doc(db, 'upgradeRequests', requestId);
    batch.update(requestRef, { status: 'approved', approvedAt: serverTimestamp() });

    const userRef = doc(db, 'users', userId);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // Add 30 days for the Pro plan

    batch.update(userRef, { 
        plan: 'pro',
        planExpiryDate: expiryDate.getTime() // Store as a Unix timestamp
    });

    await batch.commit();
};

export const rejectRequest = async (requestId: string, userId: string): Promise<void> => {
    const batch = writeBatch(db);

    // 1. Update the request status to 'rejected'
    const requestRef = doc(db, 'upgradeRequests', requestId);
    batch.update(requestRef, { status: 'rejected', rejectedAt: serverTimestamp() });

    // 2. Update the user's plan back to 'free' and reset their counts
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, { 
        plan: 'free',
        analysisCount: 0,
        lastResetDate: Date.now()
    });

    await batch.commit();
};


export const downgradeUser = async (userId: string): Promise<void> => {
    const batch = writeBatch(db);
    const userRef = doc(db, 'users', userId);
    
    // Reset user to the free plan defaults
    batch.update(userRef, {
        plan: 'free',
        analysisCount: 0,
        lastResetDate: Date.now(),
        planExpiryDate: deleteField()
    });
    
    await batch.commit();
};

export const updateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected'): Promise<void> => {
    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, { status });
};

export const updateMessageStatus = async (messageId: string, status: 'new' | 'read'): Promise<void> => {
    const messageRef = doc(db, 'contactMessages', messageId);
    await updateDoc(messageRef, { status });
};