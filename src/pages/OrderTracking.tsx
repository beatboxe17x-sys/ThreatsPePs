import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, CheckCircle, Truck, Home, X, Clock, AlertCircle, ChevronRight, RefreshCw, MessageCircle, ExternalLink } from 'lucide-react';
import { db } from '@/firebase/config';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import type { Order } from '@/firebase/services';

const STATUS_STEPS: { key: Order['status']; label: string; icon: typeof Package; desc: string }[] = [
  { key: 'processing', label: 'Processing', icon: Clock, desc: 'Payment verification pending' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, desc: 'Payment verified, preparing order' },
  { key: 'shipped', label: 'Shipped', icon: Truck, desc: 'Order is on the way' },
  { key: 'delivered', label: 'Delivered', icon: Home, desc: 'Package delivered' },
];

export default function OrderTracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storedOrders, setStoredOrders] = useState<Order[]>([]);
  const unsubRef = useRef<(() => void) | null>(null);

  // Load only THIS DEVICE's orders on mount (privacy — can't see other people's orders)
  useEffect(() => {
    try {
      const deviceId = localStorage.getItem('ng_device_id');
      const allOrders = JSON.parse(localStorage.getItem('ng_order_history') || '[]');
      // Only show orders placed from this browser/device
      const myOrders = deviceId
        ? allOrders.filter((o: Order & { deviceId?: string }) => o.deviceId === deviceId)
        : allOrders;
      setStoredOrders(myOrders);
      console.log('[TrackOrder] Loaded', myOrders.length, 'orders for device', deviceId);
    } catch (e) {
      console.error('[TrackOrder] Failed to load orders:', e);
    }
  }, []);

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!order?.id) return;
    if (!db) return;

    unsubRef.current?.();
    const unsub = onSnapshot(doc(db, 'orders', order.id), (snap) => {
      if (snap.exists()) {
        setOrder({ ...snap.data(), id: snap.id } as Order);
      }
    });
    unsubRef.current = unsub;
    return () => unsub();
  }, [order?.id]);

  const lookupOrder = async (id?: string) => {
    const lookupId = id || orderId;
    if (!lookupId.trim()) { setError('Enter an order number'); return; }
    setLoading(true);
    setError('');
    setOrder(null);

    // Try Firebase first
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'orders', lookupId.trim()));
        if (snap.exists()) {
          const data = { ...snap.data(), id: snap.id } as Order;
          setOrder(data);
          setLoading(false);
          setSearchParams({ id: lookupId.trim() });
          return;
        }
      } catch (e) { console.warn('[TrackOrder] Firebase lookup failed:', e); }
    }

    // Fallback: check localStorage (only THIS device's orders)
    try {
      const deviceId = localStorage.getItem('ng_device_id');
      const allOrders = JSON.parse(localStorage.getItem('ng_order_history') || '[]');
      const found = allOrders.find((o: Order & { deviceId?: string }) => o.id === lookupId.trim() && (!deviceId || o.deviceId === deviceId));
      if (found) {
        setOrder(found);
        setLoading(false);
        setSearchParams({ id: lookupId.trim() });
        return;
      }
    } catch (e) { console.warn('[TrackOrder] localStorage lookup failed:', e); }

    // Fallback 2: check if the ID is in myOrders list (ID-only tracking)
    try {
      const idsOnly = JSON.parse(localStorage.getItem('ng_my_orders') || '[]');
      if (idsOnly.includes(lookupId.trim())) {
        setOrder({
          id: lookupId.trim(),
          date: new Date().toISOString(),
          items: [{ id: 'unknown', name: 'Order details synced from cloud', qty: 1, price: 0 }],
          total: 0,
          crypto: 'N/A',
          txHash: 'pending-verification',
          status: 'processing',
          shipping: { name: '', email: '', address: '', city: '', zip: '', country: '' },
        });
        setLoading(false);
        setSearchParams({ id: lookupId.trim() });
        return;
      }
    } catch (_) { /* noop */ }

    setLoading(false);
    setError('Order not found. Check your order number and try again.');
  };

  const refreshOrders = () => {
    try {
      const deviceId = localStorage.getItem('ng_device_id');
      const allOrders = JSON.parse(localStorage.getItem('ng_order_history') || '[]');
      const myOrders = deviceId
        ? allOrders.filter((o: Order & { deviceId?: string }) => o.deviceId === deviceId)
        : allOrders;
      setStoredOrders(myOrders);
    } catch (_) {}
  };

  const getStatusIndex = (status: string) => STATUS_STEPS.findIndex(s => s.key === status);
  const currentStatusIdx = order ? getStatusIndex(order.status) : -1;

  // Auto-lookup if URL has id param
  useEffect(() => {
    const id = searchParams.get('id');
    if (id && !order) {
      setOrderId(id);
      lookupOrder(id);
    }
  }, []);

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Track Your Order
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Enter your order number to check the status
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-8" style={{ maxWidth: '560px', margin: '0 auto 40px' }}>
          <div className="flex-1 flex items-center gap-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 18px' }}>
            <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              value={orderId}
              onChange={e => { setOrderId(e.target.value); setError(''); }}
              placeholder="e.g. NG-AB12CD34"
              onKeyDown={e => e.key === 'Enter' && lookupOrder()}
              className="flex-1 bg-transparent border-none outline-none"
              style={{ color: 'var(--text)', fontSize: '0.95rem', fontFamily: 'monospace' }}
            />
            {orderId && (
              <button onClick={() => { setOrderId(''); setOrder(null); setError(''); }} className="bg-transparent border-none cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => lookupOrder()}
            disabled={loading}
            className="cursor-pointer border-none transition-all duration-300"
            style={{ background: 'var(--accent)', color: '#fff', padding: '14px 28px', borderRadius: '14px', fontWeight: 700, fontSize: '0.95rem', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? '...' : 'Track'}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 mb-6" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', maxWidth: '560px', margin: '0 auto 32px' }}>
            <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>{error}</span>
          </div>
        )}

        {/* Stored Orders List */}
        {!order && (
          <div style={{ maxWidth: '560px', margin: '0 auto 40px' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {storedOrders.length > 0 ? 'Your Orders' : 'No Orders Found'}
              </h3>
              <button onClick={refreshOrders} className="cursor-pointer bg-transparent border-none flex items-center gap-1" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            {storedOrders.length === 0 && (
              <div className="p-6 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <Package size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No orders found on this device.
                  <br />After you place an order, it will appear here.
                </p>
              </div>
            )}

            {storedOrders.map((o: Order) => (
              <button
                key={o.id}
                onClick={() => { setOrderId(o.id); lookupOrder(o.id); }}
                className="w-full flex items-center justify-between cursor-pointer border-none"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', marginBottom: '8px', color: 'var(--text)', fontSize: '0.85rem' }}
              >
                <div className="flex items-center gap-3">
                  <Package size={16} style={{ color: 'var(--accent)' }} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{o.id}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {o.items.map(i => `${i.name} x${i.qty}`).join(', ')} — ${o.total.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '0.7rem', textTransform: 'capitalize', background: o.status === 'delivered' ? 'rgba(34,197,94,0.15)' : 'rgba(56,138,177,0.15)', color: o.status === 'delivered' ? 'var(--success)' : 'var(--accent)', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>
                    {o.status}
                  </span>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              </button>
            ))}

            {/* Also show ID-only orders */}
            {(() => {
              try {
                const idsOnly: string[] = JSON.parse(localStorage.getItem('ng_my_orders') || '[]');
                const historyIds = new Set(storedOrders.map(o => o.id));
                const missingIds = idsOnly.filter(id => !historyIds.has(id));
                if (missingIds.length === 0) return null;
                return (
                  <>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '16px', marginBottom: '8px' }}>
                      Additional Order IDs
                    </h3>
                    {missingIds.map(id => (
                      <button
                        key={id}
                        onClick={() => { setOrderId(id); lookupOrder(id); }}
                        className="w-full flex items-center justify-between cursor-pointer border-none"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', marginBottom: '8px', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'monospace' }}
                      >
                        <span>{id}</span>
                        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    ))}
                  </>
                );
              } catch { return null; }
            })()}
          </div>
        )}

        {/* Order Status Display */}
        {order && (
          <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            {/* Order Card */}
            <div className="p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px' }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Order Number</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700 }}>{order.id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Placed On</div>
                  <div style={{ fontSize: '0.9rem' }}>{new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>${order.total.toFixed(2)}</div>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Payment</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{order.crypto}</div>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Items</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{order.items.length}</div>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Status</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize', color: order.status === 'delivered' ? 'var(--success)' : order.status === 'cancelled' ? '#ef4444' : 'var(--accent)' }}>
                    {order.status}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="mb-4">
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Items</div>
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: '0.85rem' }}>{item.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>x{item.qty} — ${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Shipping Info */}
              {order.shipping && order.shipping.name && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Shipping To</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6 }}>
                    {order.shipping.name}<br />
                    {order.shipping.address && <>{order.shipping.address}<br /></>}
                    {order.shipping.city}{order.shipping.city && order.shipping.zip ? ', ' : ''}{order.shipping.zip}<br />
                    {order.shipping.country}
                  </div>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            <div className="p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px' }}>Order Progress</h3>
              <div className="flex flex-col gap-0">
                {STATUS_STEPS.map((step, i) => {
                  const isCompleted = i <= currentStatusIdx;
                  const isCurrent = i === currentStatusIdx;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex gap-4" style={{ opacity: order.status === 'cancelled' ? 0.4 : 1 }}>
                      <div className="flex flex-col items-center" style={{ width: '36px', flexShrink: 0 }}>
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: isCompleted ? 'var(--accent)' : 'var(--bg)',
                            border: isCurrent ? '2px solid var(--accent)' : isCompleted ? '2px solid var(--accent)' : '2px solid var(--border)',
                            boxShadow: isCurrent ? '0 0 20px rgba(56,138,177,0.3)' : 'none',
                            transition: 'all 0.3s',
                          }}
                        >
                          <Icon size={16} style={{ color: isCompleted ? '#fff' : 'var(--text-muted)' }} />
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div style={{ width: '2px', height: '40px', background: i < currentStatusIdx ? 'var(--accent)' : 'var(--border)', marginTop: '4px', transition: 'all 0.3s' }} />
                        )}
                      </div>
                      <div className="pb-8" style={{ paddingTop: '6px' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: isCurrent ? 700 : 600, color: isCompleted ? 'var(--text)' : 'var(--text-muted)', transition: 'all 0.3s' }}>
                          {step.label}
                          {isCurrent && <span style={{ fontSize: '0.7rem', background: 'rgba(56,138,177,0.15)', color: 'var(--accent)', padding: '2px 10px', borderRadius: '20px', marginLeft: '8px', fontWeight: 600 }}>Current</span>}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Discord CTA when order is confirmed or beyond */}
              {(order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered') && (
                <div className="flex items-center gap-4 p-5 mt-6" style={{ background: 'rgba(88,101,242,0.08)', border: '1px solid rgba(88,101,242,0.2)', borderRadius: '14px' }}>
                  <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#5865F2', flexShrink: 0 }}>
                    <MessageCircle size={24} style={{ color: '#fff' }} />
                  </div>
                  <div className="flex-1">
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>Join Our Discord Community</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Get real-time updates, connect with our team, and access exclusive member deals.
                    </div>
                  </div>
                  <a
                    href="https://discord.gg/4hENXJWUax"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 no-underline transition-all duration-300"
                    style={{ background: '#5865F2', color: '#fff', padding: '10px 18px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#4752C4'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#5865F2'; }}
                  >
                    Join <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {order.status === 'cancelled' && (
                <div className="flex items-center gap-3 p-4 mt-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px' }}>
                  <AlertCircle size={18} style={{ color: '#ef4444' }} />
                  <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>This order has been cancelled.</span>
                </div>
              )}

              <button
                onClick={() => { setOrder(null); setOrderId(''); setError(''); refreshOrders(); }}
                className="cursor-pointer border-none mt-4"
                style={{ background: 'var(--bg)', color: 'var(--text-muted)', padding: '10px 20px', borderRadius: '8px', fontSize: '0.8rem' }}
              >
                Back to My Orders
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
