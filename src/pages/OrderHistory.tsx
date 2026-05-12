import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Copy, Trash2 } from 'lucide-react';

interface OrderRecord {
  id: string;
  date: string;
  items: { id: string; name: string; qty: number; price: number }[];
  total: number;
  crypto: string;
  txHash: string;
  status: 'processing' | 'shipped' | 'delivered';
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ng_order_history');
    if (saved) {
      try { setOrders(JSON.parse(saved)); } catch { /* empty */ }
    }
  }, []);

  const copyTx = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearHistory = () => {
    if (!confirm('Delete all order history?')) return;
    localStorage.removeItem('ng_order_history');
    setOrders([]);
  };

  const statusIcon = (s: string) => {
    if (s === 'delivered') return <CheckCircle size={16} style={{ color: 'var(--success)' }} />;
    if (s === 'shipped') return <Package size={16} style={{ color: 'var(--accent2)' }} />;
    return <Clock size={16} style={{ color: 'var(--accent)' }} />;
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px' }}>
      <section style={{ padding: '40px var(--container-pad) 80px' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800 }}>Order History</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                {orders.length === 0 ? 'No orders yet.' : `${orders.length} order${orders.length > 1 ? 's' : ''} placed`}
              </p>
            </div>
            {orders.length > 0 && (
              <button
                onClick={clearHistory}
                className="cursor-pointer flex items-center gap-1"
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem' }}
              >
                <Trash2 size={14} /> Clear
              </button>
            )}
          </div>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px' }}>
              <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>No orders yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Your completed orders will appear here after checkout.
              </p>
              <Link
                to="/"
                style={{ background: 'var(--accent)', color: '#fff', padding: '12px 28px', borderRadius: '10px', fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.map((order) => (
                <div
                  key={order.id}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {statusIcon(order.status)}
                      <span style={{ fontWeight: 700 }}>{order.id}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize', background: 'var(--bg)', padding: '2px 8px', borderRadius: '4px' }}>
                        {order.status}
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between" style={{ fontSize: '0.85rem' }}>
                        <span>{item.name} x{item.qty}</span>
                        <span style={{ color: 'var(--accent)' }}>${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Paid with {order.crypto}
                      {order.txHash && (
                        <button
                          onClick={() => copyTx(order.txHash, order.id)}
                          className="bg-transparent border-none cursor-pointer ml-2"
                          style={{ color: copiedId === order.id ? 'var(--success)' : 'var(--accent)', fontSize: '0.7rem' }}
                        >
                          {copiedId === order.id ? 'Copied!' : <Copy size={12} style={{ display: 'inline' }} />}
                        </button>
                      )}
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--accent)' }}>${order.total.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer style={{ padding: '40px var(--container-pad)', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <img src="/images/logo.png" alt="NG Research" style={{ height: '70px', objectFit: 'contain', marginBottom: '16px' }} />
        </Link>
        <p>&copy; 2026 NG Research Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
