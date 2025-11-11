import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Review } from '../types';

export const getApprovedReviews = async (reviewLimit: number = 3): Promise<Review[]> => {
    const reviewsRef = collection(db, 'reviews');
    // Query for all approved reviews. This only requires a single-field index on 'status'.
    const q = query(
        reviewsRef,
        where('status', '==', 'approved')
    );
    
    const querySnapshot = await getDocs(q);
    const approvedReviews: Review[] = [];
    querySnapshot.forEach((doc) => {
        approvedReviews.push({ id: doc.id, ...doc.data() } as Review);
    });

    // Sort the results by submission date descending on the client side.
    approvedReviews.sort((a, b) => {
        const timeA = a.submittedAt?.seconds ?? 0;
        const timeB = b.submittedAt?.seconds ?? 0;
        return timeB - timeA; // Newest first
    });
    
    // Return the specified number of reviews.
    return approvedReviews.slice(0, reviewLimit);
};