import { doc, setDoc, updateDoc, onSnapshot, collection, query, where, Timestamp } from 'firebase/firestore';
import { db } from './config';

const VISITORS_COLLECTION = 'visitors';
const HEARTBEAT_INTERVAL = 30000;
const SESSION_TIMEOUT = 120000;

function getDb() {
  if (!db) { console.warn('[Visitor] Firestore not available'); return null; }
  return db;
}

export interface VisitorSession {
  sessionId: string;
  deviceId: string;
  ip: string;
  userAgent: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  language: string;
  entryTime: string;
  lastActive: string;
  pageViews: { page: string; time: string }[];
  isActive: boolean;
  consented: boolean;
  consentId?: string;
  ageGatePassed: boolean;
  orderPlaced: boolean;
  orderId?: string;
  currentPage: string;
  referrer: string;
}

function genId(p: string) { return p + Math.random().toString(36).substring(2, 9) + Date.now().toString(36); }
function getDevId() { let id = localStorage.getItem('ng_device_id'); if (!id) { id = genId('dev-'); localStorage.setItem('ng_device_id', id); } return id; }

let currentSessionId = '';
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

async function getIP(): Promise<string> {
  try { const r = await fetch('https://api.ipify.org?format=json'); const d = await r.json(); return d.ip; } catch { return 'unknown'; }
}

export async function startVisitorSession() {
  const d = getDb(); if (!d) return;
  const sid = genId('sess-'); currentSessionId = sid;
  const ip = await getIP();
  const s: VisitorSession = {
    sessionId: sid, deviceId: getDevId(), ip,
    userAgent: navigator.userAgent.substring(0, 200), platform: navigator.platform,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, language: navigator.language,
    entryTime: new Date().toISOString(), lastActive: new Date().toISOString(),
    pageViews: [{ page: window.location.pathname, time: new Date().toISOString() }],
    isActive: true, consented: false, ageGatePassed: false, orderPlaced: false,
    currentPage: window.location.pathname, referrer: document.referrer || 'direct',
  };
  try {
    await setDoc(doc(d, VISITORS_COLLECTION, sid), { ...s, createdAt: Timestamp.now() });
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(async () => {
      try { const db2 = getDb(); if (!db2) return; await updateDoc(doc(db2, VISITORS_COLLECTION, sid), { lastActive: new Date().toISOString(), isActive: true }); } catch {}
    }, HEARTBEAT_INTERVAL);
    window.addEventListener('beforeunload', async () => { clearInterval(heartbeatTimer!); try { const db2 = getDb(); if (!db2) return; await updateDoc(doc(db2, VISITORS_COLLECTION, sid), { isActive: false, lastActive: new Date().toISOString() }); } catch {} });
    sessionStorage.setItem('ng_current_session', sid);
  } catch (err) { console.warn('[Visitor] Session failed:', err); }
}

export async function markVisitorConsented(consentId: string) {
  if (!currentSessionId) return; const d = getDb(); if (!d) return;
  try { await updateDoc(doc(d, VISITORS_COLLECTION, currentSessionId), { consented: true, consentId, ageGatePassed: true, lastActive: new Date().toISOString() }); } catch {}
}

export async function markVisitorOrderPlaced(orderId: string) {
  if (!currentSessionId) return; const d = getDb(); if (!d) return;
  try { await updateDoc(doc(d, VISITORS_COLLECTION, currentSessionId), { orderPlaced: true, orderId, lastActive: new Date().toISOString() }); } catch {}
}

export async function trackPageView(page: string) {
  if (!currentSessionId) return; const d = getDb(); if (!d) return;
  try { await updateDoc(doc(d, VISITORS_COLLECTION, currentSessionId), { currentPage: page, lastActive: new Date().toISOString() }); } catch {}
}

export function subscribeToActiveVisitors(cb: (v: VisitorSession[]) => void) {
  const d = getDb(); if (!d) return () => {};
  // Listen to ALL visitors and filter client-side (avoids needing Firestore indexes)
  return onSnapshot(collection(d, VISITORS_COLLECTION), s => {
    const v = s.docs.map(d2 => ({ ...d2.data(), sessionId: d2.id } as VisitorSession))
      .filter(v2 => v2.isActive === true && Date.now() - new Date(v2.lastActive).getTime() < SESSION_TIMEOUT)
      .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
    cb(v);
  });
}

export function subscribeToRecentVisitors(cb: (v: VisitorSession[]) => void) {
  const d = getDb(); if (!d) return () => {};
  const ago = Date.now() - 86400000;
  // Listen to ALL visitors and filter client-side
  return onSnapshot(collection(d, VISITORS_COLLECTION), s => {
    const v = s.docs.map(d2 => ({ ...d2.data(), sessionId: d2.id } as VisitorSession))
      .filter(v2 => new Date(v2.entryTime).getTime() > ago)
      .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
    cb(v);
  });
}

export function maskIP(ip: string): string {
  if (ip === 'unknown') return 'unknown';
  const p = ip.split('.'); if (p.length === 4) return `${p[0]}.${p[1]}.xxx.${p[3]}`;
  return ip.substring(0, 7) + '...';
}

export function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`; return `${Math.floor(s / 86400)}d ago`;
}
