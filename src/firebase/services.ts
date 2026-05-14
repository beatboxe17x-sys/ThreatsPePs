import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, orderBy, Timestamp, writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { db, hasFirebaseConfig } from './config';
import type { Product, ConsentLog, Crypto } from '@/types';

// Helper: safely get db
function getDb(): Firestore | null {
  return db;
}

// ============================================
// PRODUCTS
// ============================================
const PRODUCTS_COLLECTION = 'products';

export async function loadProductsFromFirestore(): Promise<Record<string, Product> | null> {
  const database = getDb();
  if (!database) return null;
  const snap = await getDocs(collection(database, PRODUCTS_COLLECTION));
  if (snap.empty) return null;
  const products: Record<string, Product> = {};
  snap.forEach(d => { products[d.id] = d.data() as Product; });
  return products;
}

export function subscribeToProducts(callback: (products: Record<string, Product>) => void) {
  const database = getDb();
  if (!database) return () => {};
  return onSnapshot(collection(database, PRODUCTS_COLLECTION), snap => {
    const products: Record<string, Product> = {};
    snap.forEach(d => { products[d.id] = d.data() as Product; });
    callback(products);
  });
}

export async function saveProductToFirestore(id: string, product: Product) {
  const database = getDb();
  if (!database) return;
  await setDoc(doc(database, PRODUCTS_COLLECTION, id), product);
}

export async function saveAllProductsToFirestore(products: Record<string, Product>) {
  const database = getDb();
  if (!database) return;
  const batch = writeBatch(database);
  Object.entries(products).forEach(([id, product]) => {
    batch.set(doc(database, PRODUCTS_COLLECTION, id), product);
  });
  await batch.commit();
}

export async function deleteProductFromFirestore(id: string) {
  const database = getDb();
  if (!database) return;
  await deleteDoc(doc(database, PRODUCTS_COLLECTION, id));
}

// ============================================
// CRYPTO ADDRESSES
// ============================================

export async function loadCryptoAddressesFromFirestore(): Promise<Record<Crypto, string> | null> {
  const database = getDb();
  if (!database) return null;
  const snap = await getDoc(doc(database, 'crypto', 'addresses'));
  if (!snap.exists()) return null;
  return snap.data() as Record<Crypto, string>;
}

export function subscribeToCryptoAddresses(callback: (addresses: Record<Crypto, string>) => void) {
  const database = getDb();
  if (!database) return () => {};
  return onSnapshot(doc(database, 'crypto', 'addresses'), snap => {
    if (snap.exists()) callback(snap.data() as Record<Crypto, string>);
  });
}

export async function saveCryptoAddressesToFirestore(addresses: Record<Crypto, string>) {
  const database = getDb();
  if (!database) return;
  await setDoc(doc(database, 'crypto', 'addresses'), addresses);
}

// ============================================
// ORDERS
// ============================================
const ORDERS_COLLECTION = 'orders';

export interface Order {
  id: string;
  date: string;
  items: { id: string; name: string; qty: number; price: number }[];
  total: number;
  subtotal?: number;
  promo?: { code: string; discount: number; amountSaved: number } | null;
  crypto: string;
  cryptoAmount?: string;
  txHash: string;
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping: {
    name: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    country: string;
  };
  deviceId?: string;
  userId?: string | null;
  createdAt?: Timestamp;
  archived?: boolean;
}

export async function saveOrderToFirestore(order: Order) {
  const database = getDb();
  if (!database) return;
  await setDoc(doc(database, ORDERS_COLLECTION, order.id), {
    ...order,
    createdAt: Timestamp.now(),
  });
}

export async function loadOrdersFromFirestore(): Promise<Order[]> {
  const database = getDb();
  if (!database) return [];
  const q = query(collection(database, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Order));
}

export function subscribeToOrders(callback: (orders: Order[]) => void) {
  const database = getDb();
  if (!database) return () => {};
  const q = query(collection(database, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ ...d.data(), id: d.id } as Order)));
  });
}

export async function updateOrderStatus(id: string, status: Order['status']) {
  const database = getDb();
  if (!database) return;
  await updateDoc(doc(database, ORDERS_COLLECTION, id), { status });
}

export async function archiveOrder(id: string) {
  const database = getDb();
  if (!database) return;
  await updateDoc(doc(database, ORDERS_COLLECTION, id), { archived: true });
}

export async function unarchiveOrder(id: string) {
  const database = getDb();
  if (!database) return;
  await updateDoc(doc(database, ORDERS_COLLECTION, id), { archived: false });
}

export function subscribeToActiveOrders(callback: (orders: Order[]) => void) {
  const database = getDb();
  if (!database) return () => {};
  // Query non-archived orders - use a simple query and filter client-side
  // to avoid needing a composite index
  const q = query(collection(database, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => {
    const orders = snap.docs
      .map(d => ({ ...d.data(), id: d.id } as Order))
      .filter(o => !o.archived);
    callback(orders);
  });
}

export function subscribeToArchivedOrders(callback: (orders: Order[]) => void) {
  const database = getDb();
  if (!database) return () => {};
  const q = query(collection(database, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => {
    const orders = snap.docs
      .map(d => ({ ...d.data(), id: d.id } as Order))
      .filter(o => o.archived);
    callback(orders);
  });
}

export async function loadOrdersByDeviceId(deviceId: string): Promise<Order[]> {
  const database = getDb();
  if (!database) return [];
  const q = query(
    collection(database, ORDERS_COLLECTION),
    where('deviceId', '==', deviceId)
  );
  const snap = await getDocs(q);
  const orders = snap.docs.map(d => ({ ...d.data(), id: d.id } as Order));
  orders.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || new Date(a.date).getTime() || 0;
    const bTime = b.createdAt?.toMillis?.() || new Date(b.date).getTime() || 0;
    return bTime - aTime;
  });
  return orders;
}

export function subscribeToOrdersByDeviceId(deviceId: string, callback: (orders: Order[]) => void) {
  const database = getDb();
  if (!database) return () => {};
  // Simple where query — no composite index needed (auto-index handles equality)
  const q = query(
    collection(database, ORDERS_COLLECTION),
    where('deviceId', '==', deviceId)
  );
  return onSnapshot(q, snap => {
    const orders = snap.docs.map(d => ({ ...d.data(), id: d.id } as Order));
    // Client-side sort by date descending
    orders.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || new Date(a.date).getTime() || 0;
      const bTime = b.createdAt?.toMillis?.() || new Date(b.date).getTime() || 0;
      return bTime - aTime;
    });
    callback(orders);
  }, err => {
    console.error('[subscribeToOrdersByDeviceId] Error:', err.message);
  });
}

// ============================================
// CONSENT LOGS
// ============================================
const CONSENTS_COLLECTION = 'consentLogs';

export async function saveConsentLogToFirestore(log: ConsentLog) {
  const database = getDb();
  if (!database) return;
  await setDoc(doc(database, CONSENTS_COLLECTION, log.id), {
    ...log,
    createdAt: Timestamp.now(),
  });
}

export async function loadConsentLogsFromFirestore(): Promise<ConsentLog[]> {
  const database = getDb();
  if (!database) return [];
  const q = query(collection(database, CONSENTS_COLLECTION), orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      ...(data as unknown as ConsentLog),
      id: d.id,
      createdAt: data.createdAt?.toDate?.() || data.timestamp,
    };
  });
}

export function subscribeToConsentLogs(callback: (logs: ConsentLog[]) => void) {
  const database = getDb();
  if (!database) return () => {};
  const q = query(collection(database, CONSENTS_COLLECTION), orderBy('timestamp', 'desc'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => {
      const data = d.data();
      return {
        ...(data as unknown as ConsentLog),
        id: d.id,
        createdAt: data.createdAt?.toDate?.() || data.timestamp,
      };
    }));
  });
}

export async function updateConsentLogStatus(id: string, status: 'active' | 'banned') {
  const database = getDb();
  if (!database) return;
  await updateDoc(doc(database, CONSENTS_COLLECTION, id), { status });
}

export async function deleteConsentLogFromFirestore(id: string) {
  const database = getDb();
  if (!database) return;
  await deleteDoc(doc(database, CONSENTS_COLLECTION, id));
}

// ============================================
// EOD (End of Day) Reset
// ============================================

export async function runEODReset(): Promise<{ visitorsDeleted: number; ordersArchived: number }> {
  const database = getDb();
  if (!database) return { visitorsDeleted: 0, ordersArchived: 0 };

  let visitorsDeleted = 0;
  let ordersArchived = 0;

  // 1. Delete old visitor sessions (older than 24h)
  try {
    const dayAgo = Date.now() - 86400000;
    const visitorSnap = await getDocs(collection(database, 'visitors'));
    const batch = writeBatch(database);
    visitorSnap.forEach(d => {
      const data = d.data();
      const entryTime = data.entryTime ? new Date(data.entryTime).getTime() : 0;
      if (entryTime && entryTime < dayAgo) {
        batch.delete(doc(database, 'visitors', d.id));
        visitorsDeleted++;
      }
    });
    if (visitorsDeleted > 0) await batch.commit();
  } catch (e) { console.error('[EOD] Visitor cleanup failed:', e); }

  // 2. Auto-archive old delivered/cancelled orders (older than 30 days)
  try {
    const monthAgo = Date.now() - 30 * 86400000;
    const ordersSnap = await getDocs(collection(database, ORDERS_COLLECTION));
    const batch = writeBatch(database);
    ordersSnap.forEach(d => {
      const data = d.data() as Order;
      const orderDate = data.date ? new Date(data.date).getTime() : 0;
      if ((data.status === 'delivered' || data.status === 'cancelled') && orderDate && orderDate < monthAgo && !data.archived) {
        batch.update(doc(database, ORDERS_COLLECTION, d.id), { archived: true });
        ordersArchived++;
      }
    });
    if (ordersArchived > 0) await batch.commit();
  } catch (e) { console.error('[EOD] Order archive failed:', e); }

  return { visitorsDeleted, ordersArchived };
}

export async function clearAllVisitorSessions(): Promise<number> {
  const database = getDb();
  if (!database) return 0;
  const snap = await getDocs(collection(database, 'visitors'));
  const batch = writeBatch(database);
  snap.forEach(d => { batch.delete(doc(database, 'visitors', d.id)); });
  await batch.commit();
  return snap.size;
}

// ============================================
// CONFIG CHECK
// ============================================
export { hasFirebaseConfig };
