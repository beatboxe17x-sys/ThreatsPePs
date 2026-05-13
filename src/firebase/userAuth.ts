import { db } from './config';
import {
  doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  collection, query, where, onSnapshot, Timestamp, type Firestore,
} from 'firebase/firestore';

const USERS_COLLECTION = 'users';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

function getDb(): Firestore | null {
  return db;
}

// Deterministic ID from email — no queries needed
function emailToDocId(email: string): string {
  // Replace @ and . with safe chars, lowercase
  return 'u_' + email.toLowerCase().replace(/[@.]/g, '_');
}

// Simple hash (works in browser)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'ng-research-salt-2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function createSessionToken(docId: string): string {
  const payload = { id: docId, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 };
  return btoa(JSON.stringify(payload));
}

function parseToken(token: string): { id: string } | null {
  try {
    const p = JSON.parse(atob(token));
    if (p.exp && p.exp < Date.now()) return null;
    return { id: p.id };
  } catch { return null; }
}

export async function registerUser(
  email: string, password: string, displayName: string
): Promise<{ success: true; user: UserProfile; token: string } | { success: false; error: string }> {
  const database = getDb();
  if (!database) return { success: false, error: 'Database unavailable' };

  try {
    const docId = emailToDocId(email);
    const userRef = doc(database, USERS_COLLECTION, docId);

    // Check if already exists — single doc read, no query needed
    const existing = await getDoc(userRef);
    if (existing.exists()) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const passwordHash = await hashPassword(password);
    const now = Timestamp.now();
    const user: UserProfile = {
      uid: docId,
      email: email.toLowerCase(),
      displayName,
      passwordHash,
      createdAt: now,
      lastLogin: now,
    };

    await setDoc(userRef, user);

    const token = createSessionToken(docId);
    localStorage.setItem('ng_auth_token', token);
    localStorage.setItem('ng_user_id', docId);

    return { success: true, user, token };
  } catch (err: any) {
    console.error('[registerUser] Error:', err);
    // Check for permission denied
    if (err?.code === 'permission-denied') {
      return { success: false, error: 'Permission denied. Check Firestore rules.' };
    }
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

export async function loginUser(
  email: string, password: string
): Promise<{ success: true; user: UserProfile; token: string } | { success: false; error: string }> {
  const database = getDb();
  if (!database) return { success: false, error: 'Database unavailable' };

  try {
    const docId = emailToDocId(email);
    const snap = await getDoc(doc(database, USERS_COLLECTION, docId));

    if (!snap.exists()) {
      return { success: false, error: 'Invalid email or password' };
    }

    const user = { ...snap.data(), uid: snap.id } as UserProfile;
    const valid = await hashPassword(password) === user.passwordHash;
    if (!valid) {
      return { success: false, error: 'Invalid email or password' };
    }

    await updateDoc(doc(database, USERS_COLLECTION, docId), { lastLogin: Timestamp.now() });

    const token = createSessionToken(docId);
    localStorage.setItem('ng_auth_token', token);
    localStorage.setItem('ng_user_id', docId);

    return { success: true, user, token };
  } catch (err: any) {
    console.error('[loginUser] Error:', err);
    if (err?.code === 'permission-denied') {
      return { success: false, error: 'Permission denied. Check Firestore rules.' };
    }
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const token = localStorage.getItem('ng_auth_token');
  if (!token) return null;

  const payload = parseToken(token);
  if (!payload) {
    localStorage.removeItem('ng_auth_token');
    localStorage.removeItem('ng_user_id');
    return null;
  }

  const database = getDb();
  if (!database) return null;

  try {
    const snap = await getDoc(doc(database, USERS_COLLECTION, payload.id));
    if (!snap.exists()) return null;
    return { ...snap.data(), uid: snap.id } as UserProfile;
  } catch {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem('ng_auth_token');
  localStorage.removeItem('ng_user_id');
}

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

// List all registered users (admin only)
export async function listAllUsers(): Promise<UserProfile[]> {
  const database = getDb();
  if (!database) return [];
  try {
    const snap = await getDocs(collection(database, USERS_COLLECTION));
    return snap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
  } catch {
    return [];
  }
}

// Delete a user and their data
export async function deleteUserAccount(uid: string): Promise<boolean> {
  const database = getDb();
  if (!database) return false;
  try {
    await deleteDoc(doc(database, USERS_COLLECTION, uid));
    return true;
  } catch {
    return false;
  }
}

// Shop settings
export async function getShopSettings(): Promise<{ requireLogin?: boolean }> {
  const database = getDb();
  if (!database) return {};
  try {
    const snap = await getDoc(doc(database, 'settings', 'shop'));
    return snap.exists() ? (snap.data() as { requireLogin?: boolean }) : {};
  } catch {
    return {};
  }
}

export async function setShopSettings(settings: { requireLogin?: boolean }): Promise<boolean> {
  const database = getDb();
  if (!database) return false;
  try {
    await setDoc(doc(database, 'settings', 'shop'), settings, { merge: true });
    return true;
  } catch {
    return false;
  }
}

export function subscribeToShopSettings(callback: (settings: { requireLogin?: boolean }) => void) {
  const database = getDb();
  if (!database) return () => {};
  return onSnapshot(doc(database, 'settings', 'shop'), snap => {
    callback(snap.exists() ? (snap.data() as { requireLogin?: boolean }) : {});
  });
}
