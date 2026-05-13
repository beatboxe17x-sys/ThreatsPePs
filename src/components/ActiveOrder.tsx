import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle, Truck, Home, Ban, Link2, ExternalLink } from 'lucide-react';
import { db } from '@/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import type { Order } from '@/firebase/services';

interface ActiveOrderProps {
  compact?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Clock; blocks: number }> = {
  processing: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Clock, blocks: 1 },
  confirmed: { label: 'Confirmed', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle, blocks: 3 },
  shipped: { label: 'Shipped', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: Truck, blocks: 4 },
  delivered: { label: 'Delivered', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: Home, blocks: 6 },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: Ban, blocks: 0 },
};

export default function ActiveOrder({ compact = false }: ActiveOrderProps) {
  const navigate = useNavigate();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevIds = useRef<string[]>([]);

  // Subscribe to user's order IDs
  useEffect(() => {
    const database = db;
    if (!database) return;

    const allIds: string[] = JSON.parse(localStorage.getItem('ng_order_ids') || '[]');
    const legacyIds: string[] = JSON.parse(localStorage.getItem('ng_my_orders') || '[]');
    const ids = [...new Set([...allIds, ...legacyIds])].slice(0, 10);

    if (ids.length === 0) return;

    // Store for tracking
    prevIds.current = ids;

    const orders: Order[] = [];
    const unsubscribes = ids.map(orderId =>
      onSnapshot(
        doc(database, 'orders', orderId),
        snap => {
          if (!snap.exists()) return;
          const data = { ...snap.data(), id: snap.id } as Order;
          const idx = orders.findIndex(o => o.id === data.id);
          if (idx >= 0) orders[idx] = data;
          else orders.push(data);
          // Filter out delivered/cancelled older than 7 days
          const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
          const active = orders
            .filter(o => o.status !== 'cancelled')
            .filter(o => {
              const orderTime = new Date(o.date).getTime() || 0;
              return o.status !== 'delivered' || orderTime > cutoff;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setActiveOrders(active);
        },
        () => {} // silent error
      )
    );

    return () => unsubscribes.forEach(fn => fn());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expanded]);

  if (activeOrders.length === 0) return null;

  const primary = activeOrders[0];
  const cfg = STATUS_CONFIG[primary.status] || STATUS_CONFIG.processing;
  const Icon = cfg.icon;

  // Blockchain confirmation blocks
  const totalBlocks = 6;
  const filledBlocks = cfg.blocks;
  const confirmations = Math.round((filledBlocks / totalBlocks) * 12);

  if (compact) {
    return (
      <button
        onClick={() => navigate(`/track-order?id=${primary.id}`)}
        className="flex items-center gap-1.5 cursor-pointer border-none transition-all duration-300"
        style={{
          background: cfg.bg,
          color: cfg.color,
          padding: '5px 10px',
          borderRadius: '8px',
          fontSize: '0.7rem',
          fontWeight: 600,
        }}
      >
        <Package size={12} />
        <span>{cfg.label}</span>
        {primary.status === 'processing' && (
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.color, animation: 'pulse 1.5s infinite' }} />
        )}
      </button>
    );
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Header pill */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 cursor-pointer border-none transition-all duration-300"
        style={{
          background: cfg.bg,
          color: cfg.color,
          padding: '7px 14px',
          borderRadius: '10px',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
      >
        <Package size={14} />
        <span>Order {cfg.label}</span>
        {primary.status === 'processing' && (
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: cfg.color,
              display: 'inline-block',
              animation: 'pulse 1.5s infinite',
            }}
          />
        )}
        {primary.status !== 'processing' && <CheckCircle size={12} />}
        <ChevronRight
          size={12}
          style={{
            transform: expanded ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      {/* Dropdown */}
      {expanded && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '320px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '16px',
            zIndex: 1001,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            animation: 'fadeInUp 0.3s ease-out',
          }}
        >
          {activeOrders.map(order => {
            const oCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.processing;
            const OIcon = oCfg.icon;
            return (
              <div key={order.id} style={{ marginBottom: '12px' }}>
                {/* Order ID + Status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <OIcon size={14} style={{ color: oCfg.color }} />
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700 }}>{order.id}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: oCfg.color,
                      background: oCfg.bg,
                      padding: '2px 8px',
                      borderRadius: '20px',
                    }}
                  >
                    {oCfg.label}
                  </span>
                </div>

                {/* Blockchain Confirmation Blocks */}
                {order.status !== 'cancelled' && (
                  <div className="mb-2">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Link2 size={10} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        Blockchain Confirmations
                      </span>
                      <span style={{ fontSize: '0.65rem', color: cfg.color, fontWeight: 700, marginLeft: 'auto' }}>
                        {confirmations}/12
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: totalBlocks }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: '6px',
                            borderRadius: '3px',
                            background: i < filledBlocks ? cfg.color : 'var(--border)',
                            opacity: i < filledBlocks ? 1 : 0.3,
                            transition: 'all 0.5s ease',
                            boxShadow: i < filledBlocks ? `0 0 6px ${cfg.color}40` : 'none',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Total + Items */}
                <div className="flex items-center justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>${order.total.toFixed(2)} · {order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                  <button
                    onClick={() => { setExpanded(false); navigate(`/track-order?id=${order.id}`); }}
                    className="flex items-center gap-1 cursor-pointer border-none bg-transparent"
                    style={{ color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 600 }}
                  >
                    Track <ExternalLink size={10} />
                  </button>
                </div>

                {order !== activeOrders[activeOrders.length - 1] && (
                  <div style={{ borderBottom: '1px solid var(--border)', marginTop: '12px' }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
