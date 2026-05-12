import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, ChevronRight, X } from 'lucide-react';
import { db } from '@/firebase/config';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';

interface PendingOrder {
  id: string;
  status: string;
  total: number;
  date: string;
}

export default function PendingOrderBanner() {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!db) {
      // Fallback: read from localStorage
      try {
        const allOrders = JSON.parse(localStorage.getItem('ng_order_history') || '[]');
        const pending = allOrders
          .filter((o: any) => o.status === 'processing' || o.status === 'confirmed')
          .map((o: any) => ({ id: o.id, status: o.status, total: o.total || 0, date: o.date }))
          .slice(0, 3);
        setPendingOrders(pending);
      } catch { /* noop */ }
      return;
    }

    // Query Firestore for pending orders
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['processing', 'confirmed']),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const unsub = onSnapshot(q, snap => {
      const orders = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          status: data.status || 'processing',
          total: data.total || 0,
          date: data.date || new Date().toISOString(),
        };
      });
      setPendingOrders(orders);
    }, err => {
      console.warn('[PendingBanner] Firestore query failed:', err);
      // Fallback to localStorage
      try {
        const allOrders = JSON.parse(localStorage.getItem('ng_order_history') || '[]');
        const pending = allOrders
          .filter((o: any) => o.status === 'processing' || o.status === 'confirmed')
          .map((o: any) => ({ id: o.id, status: o.status, total: o.total || 0, date: o.date }))
          .slice(0, 3);
        setPendingOrders(pending);
      } catch { /* noop */ }
    });

    return () => unsub();
  }, []);

  if (dismissed || pendingOrders.length === 0) return null;

  const statusLabel = (s: string) => {
    const labels: Record<string, string> = {
      processing: 'Awaiting Verification',
      confirmed: 'Confirmed - Preparing',
      shipped: 'Shipped',
      delivered: 'Delivered',
    };
    return labels[s] || s;
  };

  return (
    <div style={{ background: 'rgba(56,138,177,0.1)', borderBottom: '1px solid rgba(56,138,177,0.2)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                {pendingOrders.length === 1 
                  ? 'You have an order pending!' 
                  : `You have ${pendingOrders.length} orders pending!`}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {pendingOrders.map(order => (
                  <Link
                    key={order.id}
                    to={`/track-order?id=${order.id}`}
                    className="no-underline flex items-center gap-1 transition-all duration-300"
                    style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--accent)', 
                      background: 'rgba(56,138,177,0.1)', 
                      padding: '4px 10px', 
                      borderRadius: '6px' 
                    }}
                  >
                    <Clock size={10} />
                    {order.id} — {statusLabel(order.status)}
                    <ChevronRight size={10} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="bg-transparent border-none cursor-pointer"
            style={{ color: 'var(--text-muted)', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
