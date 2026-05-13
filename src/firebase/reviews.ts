import { db } from './config';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc, Timestamp } from 'firebase/firestore';

const REVIEWS_COLLECTION = 'product_reviews';

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}

// Check if user has reviewed this product in the last week
export async function canUserReview(userId: string, productId: string): Promise<boolean> {
  if (!db) return false;
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('userId', '==', userId),
      where('productId', '==', productId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return true;
    // Check if last review was > 7 days ago
    const reviews = snap.docs.map(d => d.data() as ProductReview);
    const lastReview = reviews.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())[0];
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return lastReview.createdAt.toMillis() < weekAgo;
  } catch {
    return false;
  }
}

// Submit a review
export async function submitReview(data: Omit<ProductReview, 'id' | 'createdAt'>): Promise<boolean> {
  if (!db) return false;
  try {
    const id = `rev_${data.userId}_${data.productId}_${Date.now()}`;
    await setDoc(doc(db, REVIEWS_COLLECTION, id), {
      ...data,
      id,
      createdAt: Timestamp.now(),
    });
    return true;
  } catch {
    return false;
  }
}

// Get reviews for a product
export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, REVIEWS_COLLECTION), where('productId', '==', productId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as ProductReview).sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  } catch {
    return [];
  }
}

// Delete a review (admin)
export async function deleteReview(reviewId: string): Promise<boolean> {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId));
    return true;
  } catch {
    return false;
  }
}

// Get all reviews (admin)
export async function getAllReviews(): Promise<ProductReview[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, REVIEWS_COLLECTION));
    return snap.docs.map(d => d.data() as ProductReview).sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  } catch {
    return [];
  }
}
