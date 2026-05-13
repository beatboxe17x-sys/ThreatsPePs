import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Package, Users, ShoppingBag, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { db } from '@/firebase/config';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import type { Order } from '@/firebase/services';

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  avgOrderValue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  topProducts: { name: string; qty: number; revenue: number }[];
  salesByDay: { day: string; amount: number }[];
  statusBreakdown: Record<string, number>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    if (!db) return;
    setLoading(true);

    try {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const orders = ordersSnap.docs.map(d => ({ ...d.data(), id: d.id } as Order));

      const now = Date.now();
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const weekStart = now - 7 * 24 * 60 * 60 * 1000;
      const monthStart = now - 30 * 24 * 60 * 60 * 1000;

      const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
      const todayRevenue = orders.filter(o => new Date(o.date).getTime() > todayStart.getTime()).reduce((s, o) => s + (o.total || 0), 0);
      const weekRevenue = orders.filter(o => new Date(o.date).getTime() > weekStart).reduce((s, o) => s + (o.total || 0), 0);
      const monthRevenue = orders.filter(o => new Date(o.date).getTime() > monthStart).reduce((s, o) => s + (o.total || 0), 0);

      // Top products
      const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
      orders.forEach(o => {
        o.items.forEach(item => {
          if (!productMap[item.id]) productMap[item.id] = { name: item.name, qty: 0, revenue: 0 };
          productMap[item.id].qty += item.qty;
          productMap[item.id].revenue += (item.price || 0) * item.qty;
        });
      });
      const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

      // Sales by day (last 7 days)
      const salesByDay: { day: string; amount: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * 24 * 60 * 60 * 1000);
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
        const amount = orders.filter(o => {
          const t = new Date(o.date).getTime();
          return t >= dayStart.getTime() && t <= dayEnd.getTime();
        }).reduce((s, o) => s + (o.total || 0), 0);
        salesByDay.push({ day: dayStr, amount });
      }

      // Status breakdown
      const statusBreakdown: Record<string, number> = {};
      orders.forEach(o => {
        statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
      });

      // Unique customers (by userId + deviceId)
      const customers = new Set<string>();
      orders.forEach(o => {
        if (o.userId) customers.add(o.userId);
        else if (o.deviceId) customers.add(o.deviceId);
      });

      setData({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: Object.keys(productMap).length,
        totalCustomers: customers.size,
        avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        topProducts,
        salesByDay,
        statusBreakdown,
      });
    } catch (err) {
      console.error('[Analytics] Error:', err);
    }
    setLoading(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading analytics...</div>;
  if (!data) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No data available</div>;

  const maxDaySales = Math.max(...data.salesByDay.map(d => d.amount), 1);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} style={{ color: 'var(--accent)' }} /> Analytics Dashboard
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Real-time business overview</p>
        </div>
        <button onClick={loadAnalytics} className="cursor-pointer border-none flex items-center gap-1" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem' }}>
          <TrendingUp size={12} /> Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${data.totalRevenue.toFixed(2)}`} color="#22c55e" sub={`+$${data.todayRevenue.toFixed(2)} today`} />
        <StatCard icon={ShoppingBag} label="Total Orders" value={String(data.totalOrders)} color="var(--accent)" sub={`$${data.avgOrderValue.toFixed(0)} avg`} />
        <StatCard icon={Package} label="Products Sold" value={String(data.totalProducts)} color="#8b5cf6" sub="unique SKUs" />
        <StatCard icon={Users} label="Customers" value={String(data.totalCustomers)} color="#f59e0b" sub="unique buyers" />
      </div>

      {/* Revenue Periods */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <PeriodCard label="Today" amount={data.todayRevenue} total={data.totalRevenue} />
        <PeriodCard label="This Week" amount={data.weekRevenue} total={data.totalRevenue} />
        <PeriodCard label="This Month" amount={data.monthRevenue} total={data.totalRevenue} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Chart */}
        <div style={{ background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)', padding: '16px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>Sales (Last 7 Days)</h4>
          <div className="flex items-end gap-2" style={{ height: '120px' }}>
            {data.salesByDay.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1" style={{ height: '100%' }}>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>${d.amount > 0 ? d.amount.toFixed(0) : ''}</span>
                <div style={{
                  width: '100%',
                  height: `${(d.amount / maxDaySales) * 80}%`,
                  minHeight: d.amount > 0 ? '4px' : '2px',
                  background: d.amount > 0 ? 'var(--accent)' : 'var(--border)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.5s ease',
                }} />
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div style={{ background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)', padding: '16px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>Top Products</h4>
          {data.topProducts.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No sales yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2" style={{ background: 'var(--bg-card)', borderRadius: '8px' }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', width: '16px' }}>#{i + 1}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.qty} sold</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22c55e' }}>${p.revenue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      <div style={{ background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)', padding: '16px', marginTop: '16px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>Order Status</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(data.statusBreakdown).map(([status, count]) => {
            const colors: Record<string, string> = {
              processing: '#f59e0b', confirmed: '#22c55e', shipped: '#8b5cf6',
              delivered: '#22c55e', cancelled: '#ef4444',
            };
            return (
              <div key={status} className="flex items-center gap-2" style={{ background: 'var(--bg-card)', padding: '6px 12px', borderRadius: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[status] || 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{status}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, sub }: { icon: typeof DollarSign; label: string; value: string; color: string; sub: string }) {
  return (
    <div style={{ background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)', padding: '14px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
        <Icon size={16} style={{ color }} />
        <ArrowUpRight size={12} style={{ color: '#22c55e' }} />
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontSize: '0.65rem', color: '#22c55e', marginTop: '4px' }}>{sub}</div>
    </div>
  );
}

function PeriodCard({ label, amount, total }: { label: string; amount: number; total: number }) {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  return (
    <div style={{ background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)', padding: '14px' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>${amount.toFixed(2)}</div>
      <div style={{ marginTop: '8px', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}
