import { useState, useEffect } from 'react';
import { Users, Globe, Eye, ShoppingCart, ShieldCheck, Clock, Monitor, MapPin } from 'lucide-react';
import { subscribeToActiveVisitors, subscribeToRecentVisitors, maskIP, timeAgo, type VisitorSession } from '@/firebase/visitor';

export default function LiveVisitors() {
  const [activeVisitors, setActiveVisitors] = useState<VisitorSession[]>([]);
  const [recentVisitors, setRecentVisitors] = useState<VisitorSession[]>([]);
  const [filter, setFilter] = useState<'active' | 'today' | 'consented' | 'ordered'>('active');

  useEffect(() => {
    const unsubActive = subscribeToActiveVisitors(setActiveVisitors);
    const unsubRecent = subscribeToRecentVisitors(setRecentVisitors);
    return () => {
      unsubActive();
      unsubRecent();
    };
  }, []);

  const todayVisitors = recentVisitors;
  const consentedVisitors = recentVisitors.filter(v => v.consented);
  const orderedVisitors = recentVisitors.filter(v => v.orderPlaced);

  const displayList = filter === 'active' ? activeVisitors
    : filter === 'today' ? todayVisitors
    : filter === 'consented' ? consentedVisitors
    : orderedVisitors;

  const stats = [
    { label: 'Online Now', value: activeVisitors.length, icon: <Eye size={16} />, color: '#22c55e' },
    { label: 'Today', value: todayVisitors.length, icon: <Globe size={16} />, color: 'var(--accent)' },
    { label: 'Consented', value: consentedVisitors.length, icon: <ShieldCheck size={16} />, color: '#8b5cf6' },
    { label: 'Ordered', value: orderedVisitors.length, icon: <ShoppingCart size={16} />, color: '#f59e0b' },
  ];

  const activePulse = (v: VisitorSession) => {
    const lastActive = new Date(v.lastActive).getTime();
    const secondsAgo = (Date.now() - lastActive) / 1000;
    if (secondsAgo < 30) return <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />;
    if (secondsAgo < 120) return <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />;
    return <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            <Users size={16} style={{ display: 'inline', marginRight: '8px', color: 'var(--accent)' }} />
            Live Visitors
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Real-time visitor activity. Updates automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeVisitors.length} online</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {stats.map(({ label, value, icon, color }) => (
          <div key={label} style={{ background: 'var(--bg)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <div style={{ color, marginBottom: '4px' }}>{icon}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{value}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['active', 'today', 'consented', 'ordered'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="cursor-pointer border-none capitalize"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: filter === f ? 'var(--accent)' : 'var(--bg)',
              color: filter === f ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            {f} ({f === 'active' ? activeVisitors.length : f === 'today' ? todayVisitors.length : f === 'consented' ? consentedVisitors.length : orderedVisitors.length})
          </button>
        ))}
      </div>

      {/* Visitor list */}
      {displayList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Users size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>No {filter} visitors.</p>
        </div>
      ) : (
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {displayList.map((visitor) => (
            <div
              key={visitor.sessionId}
              style={{
                background: 'var(--bg)',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '8px',
                border: '1px solid var(--border)',
                fontSize: '0.8rem',
              }}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {activePulse(visitor)}
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{visitor.sessionId.split('-')[1]}</span>
                  {visitor.consented && (
                    <span style={{ fontSize: '0.6rem', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      <ShieldCheck size={10} style={{ display: 'inline' }} /> Consented
                    </span>
                  )}
                  {visitor.orderPlaced && (
                    <span style={{ fontSize: '0.6rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      <ShoppingCart size={10} style={{ display: 'inline' }} /> Ordered
                    </span>
                  )}
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <Clock size={10} style={{ display: 'inline' }} /> {timeAgo(visitor.lastActive)}
                </span>
              </div>

              {/* Details row */}
              <div className="flex items-center gap-3 mb-2" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1"><MapPin size={10} /> {maskIP(visitor.ip)}</span>
                <span className="flex items-center gap-1"><Monitor size={10} /> {visitor.platform}</span>
                <span className="flex items-center gap-1">{visitor.screenResolution}</span>
              </div>

              {/* Page and timezone */}
              <div className="flex items-center justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>On: <strong style={{ color: 'var(--text)' }}>{visitor.currentPage}</strong></span>
                <span>{visitor.timezone}</span>
              </div>

              {/* Order info if placed */}
              {visitor.orderPlaced && visitor.orderId && (
                <div className="mt-2 p-2" style={{ background: 'rgba(245,158,11,0.05)', borderRadius: '6px', fontSize: '0.75rem' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>Order: {visitor.orderId}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
