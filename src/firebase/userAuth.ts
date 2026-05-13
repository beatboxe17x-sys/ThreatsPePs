import { db } from './config';
import {
  collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc,
  Timestamp, type Firestore,
} from 'firebase/firestore';

const USERS_COLLECTION = 'users';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  passwordHash: string;
  shippingAddresses: {
    name: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    country: string;
    isDefault: boolean;
  }[];
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

function getDb(): Firestore | null {
  return db;
}

// Simple hash function (crypto-like but works in browser)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'ng-research-salt-2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

function generateUid(): string {
  return 'usr_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// JWT-like session token
function createSessionToken(uid: string): string {
  const payload = { uid, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 }; // 30 days
  return btoa(JSON.stringify(payload));
}

export function parseSessionToken(token: string): { uid: string } | null {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp && payload.exp < Date.now()) return null; // expired
    return { uid: payload.uid };
  } catch {
    return null;
  }
}

// Register new user
export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<{ success: true; user: UserProfile; token: string } | { success: false; error: string }> {
  const database = getDb();
  if (!database) return { success: false, error: 'Database unavailable' };

  try {
    // Check if email already exists
    const q = query(collection(database, USERS_COLLECTION), where('email', '==', email.toLowerCase()));
    const existing = await getDocs(q);
    if (!existing.empty) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const uid = generateUid();
    const passwordHash = await hashPassword(password);
    const now = Timestamp.now();

    const user: UserProfile = {
      uid,
      email: email.toLowerCase(),
      displayName,
      passwordHash,
      shippingAddresses: [],
      createdAt: now,
      lastLogin: now,
    };

    await setDoc(doc(database, USERS_COLLECTION, uid), user);

    const token = createSessionToken(uid);
    localStorage.setItem('ng_auth_token', token);
    localStorage.setItem('ng_user_id', uid);

    return { success: true, user, token };
  } catch (err) {
    console.error('[registerUser] Error:', err);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

// Login
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: true; user: UserProfile; token: string } | { success: false; error: string }> {
  const database = getDb();
  if (!database) return { success: false, error: 'Database unavailable' };

  try {
    const q = query(collection(database, USERS_COLLECTION), where('email', '==', email.toLowerCase()));
    const snap = await getDocs(q);
    if (snap.empty) {
      return { success: false, error: 'Invalid email or password' };
    }

    const userDoc = snap.docs[0];
    const user = { ...userDoc.data(), uid: userDoc.id } as UserProfile;

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Update last login
    await updateDoc(doc(database, USERS_COLLECTION, user.uid), { lastLogin: Timestamp.now() });

    const token = createSessionToken(user.uid);
    localStorage.setItem('ng_auth_token', token);
    localStorage.setItem('ng_user_id', user.uid);

    return { success: true, user, token };
  } catch (err) {
    console.error('[loginUser] Error:', err);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

// Get current user from session
export async function getCurrentUser(): Promise<UserProfile | null> {
  const token = localStorage.getItem('ng_auth_token');
  if (!token) return null;

  const payload = parseSessionToken(token);
  if (!payload) {
    localStorage.removeItem('ng_auth_token');
    localStorage.removeItem('ng_user_id');
    return null;
  }

  const database = getDb();
  if (!database) return null;

  try {
    const snap = await getDoc(doc(database, USERS_COLLECTION, payload.uid));
    if (!snap.exists()) return null;
    return { ...snap.data(), uid: snap.id } as UserProfile;
  } catch {
    return null;
  }
}

// Logout
export function logoutUser() {
  localStorage.removeItem('ng_auth_token');
  localStorage.removeItem('ng_user_id');
}

// Update user profile
export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<UserProfile, 'displayName' | 'shippingAddresses'>>
): Promise<boolean> {
  const database = getDb();
  if (!database) return false;
  try {
    await updateDoc(doc(database, USERS_COLLECTION, uid), updates);
    return true;
  } catch {
    return false;
  }
}

// Get user's orders from Firestore
export async function getUserOrders(userId: string) {
  const database = getDb();
  if (!database) return [];
  try {
    const q = query(collection(database, 'orders'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch {
    return [];
  }
}
