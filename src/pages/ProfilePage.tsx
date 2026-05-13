import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, LogOut, Package, ChevronRight, Clock,
  CheckCircle, Truck, Home as HomeIcon, Ban, RefreshCw,
  ShoppingBag, MapPin, Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { Order } from '@/firebase/services';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  processing: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Clock },
  confirmed: { label: 'Confirmed', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle },
  shipped: { label: 'Shipped', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: Truck },
  delivered: { label: 'Delivered', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: HomeIcon },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: Ban },
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, isLoggedIn, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate('/login');
    }
  }, [loading, isLoggedIn, navigate]);

  // Subscribe to user's orders
  useEffect(() => {
    if (!user?.uid || !db) return;

    // Query by userId
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Order));
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setOrders(data);
      setOrdersLoading(false);
    }, err => {
      console.error('[Profile] Order query error:', err.message);
      setOrdersLoading(false);
    });

    return () => unsub();
  }, [user]);

  // Also check deviceId orders (for guest orders on this device)
  useEffect(() => {
    if (!db) return;
    const deviceId = localStorage.getItem('ng_device_id');
    if (!deviceId || !user) return;

    const q = query(collection(db, 'orders'), where('deviceId', '==', deviceId));
    const unsub = onSnapshot(q, snap => {
      const deviceOrders = snap.docs.map(d => ({ ...d.data(), id: d.id } as Order));
      setOrders(prev => {
        const merged = [...prev];
        deviceOrders.forEach(o => {
          if (!merged.find(m => m.id === o.id)) merged.push(o);
        });
        merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return merged;
      });
    });

    return () => unsub();
  }, [user]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid var(--border)', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isLoggedIn || !user) return null;

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8" style={{ marginTop: '80px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>My Account</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Manage your orders and account</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 cursor-pointer border-none transition-all duration-200"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '10px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600 }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-4 mb-8 p-5" style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-center" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}>
            {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{user.displayName}</h2>
            <div className="flex items-center gap-3" style={{ marginTop: '4px' }}>
              <span className="flex items-center gap-1" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Mail size={12} /> {user.email}
              </span>
              <span className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--success)', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                <Shield size={10} /> Verified
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <Package size={20} style={{ color: 'var(--accent)', margin: '0 auto 8px' }} />
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>{orders.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Orders</div>
          </div>
          <div className="text-center p-4" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <ShoppingBag size={20} style={{ color: '#8b5cf6', margin: '0 auto 8px' }} />
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>{activeOrders.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active</div>
          </div>
          <div className="text-center p-4" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <MapPin size={20} style={{ color: 'var(--success)', margin: '0 auto 8px' }} />
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>{pastOrders.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</div>
          </div>
        </div>

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div className="mb-8">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>Active Orders</h3>
            {activeOrders.map(order => (
              <OrderCard key={order.id} order={order} navigate={navigate} />
            ))}
          </div>
        )}

        {/* Past Orders */}
        {pastOrders.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>Order History</h3>
            {pastOrders.map(order => (
              <OrderCard key={order.id} order={order} navigate={navigate} />
            ))}
          </div>
        )}

        {orders.length === 0 && !ordersLoading && (
          <div className="text-center p-8" style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <Package size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>No Orders Yet</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>Your orders will appear here after you make a purchase</p>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, navigate }: { order: Order; navigate: ReturnType<typeof useNavigate> }) {
  const cfg = STATUS_MAP[order.status] || STATUS_MAP.processing;
  const Icon = cfg.icon;

  return (
    <button
      onClick={() => navigate(`/track-order?id=${order.id}`)}
      className="w-full flex items-center gap-4 cursor-pointer border-none transition-all duration-200"
      style={{
        background: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '10px',
        border: '1px solid var(--border)',
        textAlign: 'left',
      }}
    >
      <div className="flex items-center justify-center" style={{ width: '44px', height: '44px', borderRadius: '10px', background: cfg.bg, flexShrink: 0 }}>
        <Icon size={20} style={{ color: cfg.color }} />
      </div>
      <div className="flex-1" style={{ minWidth: 0 }}>
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{order.id}</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '2px 10px', borderRadius: '20px' }}>
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3" style={{ marginTop: '4px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {order.items.length} item{order.items.length > 1 ? 's' : ''}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>
            ${order.total.toFixed(2)}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {new Date(order.date).toLocaleDateString()}
          </span>
        </div>
      </div>
      <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
    </button>
  );
}
