import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from './config';

const SETTINGS_DOC = 'settings/webhook';

// Read webhook URL from Firestore
export async function getWebhookUrlFromFirestore(): Promise<string> {
  if (!db) {
    console.warn('[WebhookSettings] Firestore unavailable');
    return localStorage.getItem('ng_discord_webhook_url') || '';
  }
  try {
    const snap = await getDoc(doc(db, SETTINGS_DOC));
    if (snap.exists() && snap.data().url) {
      return snap.data().url;
    }
  } catch (err) {
    console.warn('[WebhookSettings] Firestore read failed:', err);
  }
  return localStorage.getItem('ng_discord_webhook_url') || '';
}

// Save webhook URL to Firestore
export async function saveWebhookUrlToFirestore(url: string) {
  localStorage.setItem('ng_discord_webhook_url', url);
  if (!db) {
    console.warn('[WebhookSettings] Firestore unavailable, saved to localStorage only');
    return;
  }
  try {
    await setDoc(doc(db, SETTINGS_DOC), {
      url,
      updatedAt: new Date().toISOString(),
    });
    console.log('[WebhookSettings] Saved to Firestore');
  } catch (err) {
    console.error('[WebhookSettings] Firestore write failed:', err);
  }
}

// Subscribe to webhook URL changes in real-time
export function subscribeToWebhookUrl(callback: (url: string) => void) {
  if (!db) {
    console.warn('[WebhookSettings] Firestore unavailable, using localStorage');
    callback(localStorage.getItem('ng_discord_webhook_url') || '');
    return () => {};
  }
  return onSnapshot(doc(db, SETTINGS_DOC), snap => {
    const url = snap.exists() ? (snap.data().url || '') : '';
    callback(url);
  }, err => {
    console.warn('[WebhookSettings] Snapshot error:', err);
    callback(localStorage.getItem('ng_discord_webhook_url') || '');
  });
}
