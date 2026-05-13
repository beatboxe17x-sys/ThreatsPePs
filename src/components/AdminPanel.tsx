import { useState, useEffect } from 'react';
import { useApp } from '@/hooks/useAppContext';
import { X, Download, Upload, Save, Users, CheckCircle2, ClipboardList, Package, Copy, CircleDollarSign, Clock, ChevronDown, MapPin, Mail, MessageCircle, Settings, Check, Eye, Bell, ExternalLink, Trash2, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { notifyOrderStatusUpdate, notifyNewOrder, getWebhookUrl, setWebhookUrl, loadWebhookUrl, hasWebhook } from '@/discord/webhook';
import { subscribeToWebhookUrl } from '@/firebase/webhookSettings';
import LiveVisitors from './LiveVisitors';
import type { Crypto, Product } from '@/types';
import { CRYPTO_NAMES, CRYPTO_SYMBOLS } from '@/types';

type AdminTab = 'products' | 'crypto' | 'logs' | 'orders' | 'users' | 'discord' | 'visitors';

export default function AdminPanel() {
  const {
    products, cryptoAddresses, orders, consentLogs,
    isAdminOpen, closeAdmin, isAdminLoggedIn,
    adminLogin, adminLogout, saveProducts, saveCryptoAddresses,
    showToast, updateConsentStatus, deleteConsentLog,
  } = useApp();

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<AdminTab>('products');

  // Product form
  const [editingId, setEditingId] = useState('');
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pMg, setPMg] = useState('');
  const [pImg, setPImg] = useState('');
  const [pId, setPId] = useState('');
  const [saveMsg, setSaveMsg] = useState(false);

  // Crypto addresses form
  const [editCrypto, setEditCrypto] = useState<Record<Crypto, string>>({ ...cryptoAddresses });

  useEffect(() => {
    if (isAdminOpen) {
      setEditCrypto({ ...cryptoAddresses });
    }
  }, [isAdminOpen, cryptoAddresses]);

  const handleLogin = async () => {
    setLoginError('');
    const ok = await adminLogin(email, pass);
    if (!ok) {
      // The useApp context will show a toast with the specific error
      setLoginError('Login failed. Check the error message above or use admin/admin for fallback.');
    }
  };

  const resetProductForm = () => {
    setEditingId('');
    setPName('');
    setPPrice('');
    setPMg('');
    setPImg('');
    setPId('');
  };

  const handleSaveProduct = () => {
    const id = editingId || pId.toLowerCase().replace(/\s+/g, '');
    const price = parseFloat(pPrice);
    if (!id || !pName || !price || !pImg) {
      alert('Fill all required fields');
      return;
    }
    const existing = products[id];
    const newProduct: Product = {
      name: pName,
      price,
      img: pImg,
      mg: pMg || '10 MG',
      shopify: existing?.shopify || '#',
      description: existing?.description || '',
      highlights: existing?.highlights || [],
      coa: existing?.coa,
    };
    const newProducts = { ...products, [id]: newProduct };
    saveProducts(newProducts);
    resetProductForm();
    setSaveMsg(true);
    setTimeout(() => setSaveMsg(false), 3000);
  };

  const handleEditProduct = (id: string) => {
    const p = products[id];
    if (!p) return;
    setEditingId(id);
    setPName(p.name);
    setPPrice(p.price.toString());
    setPMg(p.mg);
    setPImg(p.img);
    setPId(id);
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm(`Delete ${products[id]?.name}?`)) return;
    const newProducts = { ...products };
    delete newProducts[id];
    saveProducts(newProducts);
  };

  const handleCloneProduct = (id: string) => {
    const p = products[id];
    if (!p) return;
    const newId = id + '_copy' + Date.now();
    const newProducts = { ...products, [newId]: { ...p } };
    saveProducts(newProducts);
    showToast('Product cloned!', '\uD83D\uDCCB');
  };

  const handleExportProducts = () => {
    const data = JSON.stringify(products, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ng_products.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProducts = (input: HTMLInputElement) => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as Record<string, Product>;
        saveProducts(data);
        showToast('Products imported!', '\uD83D\uDCE5');
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    input.value = '';
  };

  const handleSaveCrypto = () => {
    saveCryptoAddresses(editCrypto);
    showToast('Crypto addresses saved!', '\uD83D\uDCBE');
  };

  if (!isAdminOpen) return null;

  return (
    <div className="admin-overlay active" onClick={(e) => { if (e.target === e.currentTarget) closeAdmin(); }}>
      {/* Login Screen */}
      {!isAdminLoggedIn && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '40px', width: '360px', textAlign: 'center' }}>
          <h2 className="mb-2" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Panel</h2>
          <p className="mb-6" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Any email + admin password</p>
          <div className="mb-3">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Any email"
              className="w-full outline-none transition-colors duration-300"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Password"
              className="w-full outline-none transition-colors duration-300"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full cursor-pointer border-none transition-all duration-300"
            style={{ background: 'var(--accent)', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#2d6f8f')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            Login
          </button>
          {loginError && (
            <p className="mt-3" style={{ color: 'var(--accent)', fontSize: '0.8rem', lineHeight: 1.5 }}>{loginError}</p>
          )}
          <button
            onClick={closeAdmin}
            className="mt-4 bg-transparent border-none cursor-pointer"
            style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Dashboard */}
      {isAdminLoggedIn && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', width: '90vw', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Dashboard</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin Access</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportProducts}
                className="flex items-center gap-1 cursor-pointer transition-all duration-300"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem' }}
              >
                <Download size={14} /> Export JSON
              </button>
              <label className="flex items-center gap-1 cursor-pointer transition-all duration-300" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem' }}>
                <Upload size={14} /> Import JSON
                <input type="file" accept=".json" onChange={(e) => handleImportProducts(e.target)} style={{ display: 'none' }} />
              </label>
              <button onClick={() => { adminLogout(); }} className="cursor-pointer ml-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--accent)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem' }}>
                Logout
              </button>
              <button onClick={closeAdmin} className="bg-transparent border-none cursor-pointer ml-2" style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setTab('products')} className="cursor-pointer border-none bg-transparent pb-3 transition-all duration-300" style={{ color: tab === 'products' ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, borderBottom: tab === 'products' ? '2px solid var(--accent)' : '2px solid transparent' }}>Products</button>
            <button onClick={() => setTab('crypto')} className="cursor-pointer border-none bg-transparent pb-3 transition-all duration-300" style={{ color: tab === 'crypto' ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, borderBottom: tab === 'crypto' ? '2px solid var(--accent)' : '2px solid transparent' }}>Crypto Addresses</button>
            <button onClick={() => setTab('logs')} className="cursor-pointer border-none bg-transparent pb-3 transition-all duration-300" style={{ color: tab === 'logs' ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, borderBottom: tab === 'logs' ? '2px solid var(--accent)' : '2px solid transparent' }}>Customer Logs</button>
            <button onClick={() => setTab('orders')} className="cursor-pointer border-none bg-transparent pb-3 transition-all duration-300" style={{ color: tab === 'orders' ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, borderBottom: tab === 'orders' ? '2px solid var(--accent)' : '2px solid transparent' }}>Orders</button>
            <button onClick={() => setTab('users')} className="cursor-pointer border-none bg-transparent pb-3 transition-all duration-300 flex items-center gap-1" style={{ color: tab === 'users' ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, borderBottom: tab === 'users' ? '2px solid var(--accent)' : '2px solid transparent' }}><Users size={14} /> Users</button>
            <button onClick={() => setTab('visitors')} className="cursor-pointer border-none bg-transparent pb-3 transition-all duration-300 flex items-center gap-1" style={{ color: tab === 'visitors' ? '#22c55e' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, borderBottom: tab === 'visitors' ? '2px solid #22c55e' : '2px solid transparent' }}><Eye size={14} /> Visitors</button>
            <button onClick={() => setTab('discord')} className="cursor-pointer border-none bg-transparent pb-3 transition-all duration-300 flex items-center gap-1" style={{ color: tab === 'discord' ? '#5865F2' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, borderBottom: tab === 'discord' ? '2px solid #5865F2' : '2px solid transparent' }}><MessageCircle size={14} /> Discord</button>
          </div>

          {/* Products Tab */}
          {tab === 'products' && (
            <div>
              <div className="mb-6 p-6" style={{ background: 'var(--bg)', borderRadius: '16px' }}>
                <h3 className="mb-4" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {editingId ? '\u270F Edit Product' : '\u2795 Add Product'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="block mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Name</label>
                    <input type="text" value={pName} onChange={e => setPName(e.target.value)} placeholder="Product Name" className="w-full outline-none" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }} />
                  </div>
                  <div>
                    <label className="block mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Price ($)</label>
                    <input type="number" value={pPrice} onChange={e => setPPrice(e.target.value)} placeholder="49.99" step="0.01" className="w-full outline-none" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }} />
                  </div>
                  <div>
                    <label className="block mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Dosage</label>
                    <input type="text" value={pMg} onChange={e => setPMg(e.target.value)} placeholder="10 MG" className="w-full outline-none" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }} />
                  </div>
                  <div>
                    <label className="block mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Image Filename</label>
                    <input type="text" value={pImg} onChange={e => setPImg(e.target.value)} placeholder="product.png" className="w-full outline-none" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }} />
                  </div>
                  <div>
                    <label className="block mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ID</label>
                    <input type="text" value={pId} onChange={e => setPId(e.target.value)} placeholder="productid" disabled={!!editingId} className="w-full outline-none" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', color: editingId ? 'var(--text-muted)' : 'var(--text)', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }} />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={handleSaveProduct} className="cursor-pointer border-none transition-all duration-300" style={{ background: 'var(--accent)', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }} onMouseEnter={e => (e.currentTarget.style.background = '#2d6f8f')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}>
                    <Save size={14} style={{ display: 'inline', marginRight: '6px' }} /> Save
                  </button>
                  {editingId && <button onClick={resetProductForm} className="cursor-pointer transition-all duration-300" style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}>Cancel</button>}
                </div>
                {saveMsg && <p className="mt-3" style={{ color: 'var(--success)', fontSize: '0.8rem' }}>Saved! Site updated instantly.</p>}
              </div>

              <h3 className="mb-4" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Current Products</h3>
              <div className="flex flex-col gap-2">
                {Object.entries(products).map(([id, p]) => (
                  <div key={id} className="grid gap-3 items-center p-3" style={{ gridTemplateColumns: '50px 1fr 80px 80px 80px 100px', background: 'var(--bg)', borderRadius: '10px' }}>
                    <img src={p.img} alt={p.name} className="object-contain" style={{ width: '40px', height: '40px', borderRadius: '6px' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {id} | {p.mg}</div>
                    </div>
                    <div style={{ color: 'var(--accent)', fontWeight: 700 }}>${p.price.toFixed(2)}</div>
                    <button onClick={() => handleEditProduct(id)} className="cursor-pointer transition-all duration-300" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem' }}>Edit</button>
                    <button onClick={() => handleDeleteProduct(id)} className="cursor-pointer transition-all duration-300" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--accent)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem' }}>Delete</button>
                    <button onClick={() => handleCloneProduct(id)} className="cursor-pointer transition-all duration-300" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem' }}>Clone</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crypto Tab */}
          {tab === 'crypto' && (
            <div>
              <h3 className="mb-4" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Crypto Wallet Addresses</h3>
              <p className="mb-4" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Edit your cryptocurrency wallet addresses below. These addresses are displayed to customers during checkout.
              </p>
              <div className="flex flex-col gap-4 mb-6">
                {(Object.keys(editCrypto) as Crypto[]).map((crypto) => (
                  <div key={crypto} className="p-4" style={{ background: 'var(--bg)', borderRadius: '12px' }}>
                    <label className="block mb-2 font-semibold" style={{ fontSize: '0.85rem' }}>
                      {CRYPTO_NAMES[crypto]} ({CRYPTO_SYMBOLS[crypto]})
                    </label>
                    <input type="text" value={editCrypto[crypto]} onChange={(e) => setEditCrypto(prev => ({ ...prev, [crypto]: e.target.value }))} className="w-full outline-none transition-colors duration-300" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'monospace' }} onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')} onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')} />
                  </div>
                ))}
              </div>
              <button onClick={handleSaveCrypto} className="cursor-pointer border-none transition-all duration-300" style={{ background: 'var(--accent)', color: '#fff', padding: '12px 32px', borderRadius: '10px', fontWeight: 700, fontSize: '1rem' }} onMouseEnter={e => { e.currentTarget.style.background = '#2d6f8f'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; }}>
                <Save size={16} style={{ display: 'inline', marginRight: '8px' }} /> Save All Addresses
              </button>
            </div>
          )}

          {/* Customer Logs Tab */}
          {tab === 'logs' && (
            <CustomerLogsTab logs={consentLogs} onUpdateStatus={updateConsentStatus} onDelete={deleteConsentLog} />
          )}

          {/* Orders Tab */}
          {tab === 'orders' && <OrdersTab orders={orders} />}

          {/* Live Visitors Tab */}
          {tab === 'visitors' && <LiveVisitors />}

          {/* Users Tab */}
          {tab === 'users' && <UsersTab showToast={showToast} />}

          {/* Discord Settings Tab */}
          {tab === 'discord' && <DiscordSettingsTab showToast={showToast} />}
        </div>
      )}
    </div>
  );
}

/* Orders sub-component - now reads from Firestore via context */
function OrdersTab({ orders }: { orders: Array<{ id: string; date: string; items: { id: string; name: string; qty: number; price: number }[]; total: number; crypto: string; txHash: string; status: string; shipping?: { name: string; email: string; address: string; city: string; zip: string; country: string } }> }) {
  const { updateOrderStatus, showToast } = useApp();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const copyTx = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            <ClipboardList size={16} style={{ display: 'inline', marginRight: '8px', color: 'var(--accent)' }} />
            Order History
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            All orders synced from Firebase. {orders.length} order{orders.length !== 1 ? 's' : ''} total.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            const data = JSON.stringify(orders, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `orders_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }} className="cursor-pointer flex items-center gap-1" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem' }}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Orders', value: orders.length, icon: <Package size={14} /> },
          { label: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: <CircleDollarSign size={14} /> },
          { label: 'Today', value: orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).length, icon: <Clock size={14} /> },
          { label: 'This Week', value: orders.filter(o => { const d = new Date(o.date); const now = new Date(); return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000; }).length, icon: <ClipboardList size={14} /> },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ background: 'var(--bg)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            <div style={{ color: 'var(--accent)', marginBottom: '2px' }}>{icon}</div>
            <div style={{ fontSize: '1rem', fontWeight: 800 }}>{value}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Package size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>No orders yet.</p>
        </div>
      ) : (
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            const statusColors: Record<string, string> = {
              processing: 'var(--accent)',
              confirmed: 'var(--success)',
              shipped: '#8b5cf6',
              delivered: '#22c55e',
              cancelled: '#ef4444',
            };
            return (
              <div key={order.id} style={{ background: 'var(--bg)', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px', border: '1px solid var(--border)' }}>
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Package size={14} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', fontFamily: 'monospace' }}>{order.id}</span>
                    {/* Status badge */}
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: statusColors[order.status] + '20', color: statusColors[order.status], padding: '3px 10px', borderRadius: '20px' }}>
                      {order.status}
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(order.date).toLocaleDateString()}</span>
                </div>

                {/* Items */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  {order.items.map(i => `${i.name} x${i.qty}`).join(', ')}
                </div>

                {/* Status controls + actions */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    {/* Status dropdown */}
                    <select
                      value={order.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value as import('@/firebase/services').Order['status'];
                        try {
                          await updateOrderStatus(order.id, newStatus);
                          showToast(`Order ${order.id} \u2192 ${newStatus}`, '\u2705');
                          // Send Discord notification
                          notifyOrderStatusUpdate({
                            id: order.id,
                            status: newStatus,
                            total: order.total,
                            crypto: order.crypto,
                            shipping: order.shipping,
                          });
                        } catch (err: any) {
                          console.error('Status update failed:', err);
                          showToast('Failed: Check Firestore rules allow updates', '\u274C');
                        }
                      }}
                      className="cursor-pointer outline-none"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', color: 'var(--text)', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      <option value="processing">Processing</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {/* Ping Discord button */}
                    <button
                      onClick={async () => {
                        const ok = await notifyNewOrder({
                          id: order.id,
                          total: order.total,
                          crypto: order.crypto,
                          items: order.items.map(i => ({ name: i.name, qty: i.qty })),
                          shipping: order.shipping || { name: '', email: '' },
                        });
                        showToast(ok ? 'Order pinged to Discord!' : 'Webhook not configured. Set URL in Discord tab.', ok ? '\uD83D\uDCE4' : '\u274C');
                      }}
                      className="cursor-pointer flex items-center gap-1 transition-all duration-300"
                      style={{ background: 'rgba(88,101,242,0.1)', border: '1px solid rgba(88,101,242,0.3)', color: '#5865F2', padding: '6px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 600 }}
                    >
                      <Bell size={12} /> Ping Discord
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="cursor-pointer flex items-center gap-1"
                      style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.7rem' }}
                    >
                      {isExpanded ? 'Less' : 'Details'} <ChevronDown size={12} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <button onClick={() => copyTx(order.txHash, order.id)} className="bg-transparent border-none cursor-pointer" style={{ color: copiedId === order.id ? 'var(--success)' : 'var(--accent)', fontSize: '0.7rem' }}>
                        {copiedId === order.id ? 'Copied!' : <Copy size={10} style={{ display: 'inline' }} />}
                      </button>
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '0.95rem' }}>${order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ background: 'rgba(10,22,40,0.5)', borderRadius: '10px', padding: '14px', marginTop: '12px', fontSize: '0.8rem' }}>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Payment</div>
                        <div style={{ fontWeight: 600 }}>{order.crypto}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>TX Hash</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{order.txHash}</div>
                      </div>
                    </div>
                    {order.shipping && (
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Shipping Info</div>
                        <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>
                          <div className="flex items-center gap-2"><MapPin size={12} style={{ color: 'var(--accent)' }} /> {order.shipping.name}</div>
                          <div className="flex items-center gap-2"><Mail size={12} style={{ color: 'var(--accent)' }} /> {order.shipping.email}</div>
                          {order.shipping.address && <div style={{ paddingLeft: '20px', color: 'var(--text-muted)' }}>{order.shipping.address}, {order.shipping.city}, {order.shipping.zip}</div>}
                          {order.shipping.country && <div style={{ paddingLeft: '20px', color: 'var(--text-muted)' }}>{order.shipping.country}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Customer Logs sub-component - now reads from Firestore via context */
function CustomerLogsTab({
  logs,
  onUpdateStatus,
  onDelete,
}: {
  logs: import('@/types').ConsentLog[];
  onUpdateStatus: (id: string, status: 'active' | 'banned') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [filter, setFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredLogs = logs.filter(l => filter === 'all' ? true : l.status === filter);

  const handleBan = async (id: string) => await onUpdateStatus(id, 'banned');
  const handleUnban = async (id: string) => await onUpdateStatus(id, 'active');
  const handleRemove = async (id: string) => { if (confirm('Remove this log entry?')) await onDelete(id); };

  const handleExportLogs = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ng_consent_logs_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const activeCount = logs.filter(l => l.status === 'active').length;
  const bannedCount = logs.filter(l => l.status === 'banned').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            <Users size={16} style={{ display: 'inline', marginRight: '8px', color: 'var(--accent)' }} />
            Customer Consent Logs
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            IP, device fingerprint, and legal agreement records synced from Firebase.
          </p>
        </div>
        <button onClick={handleExportLogs} className="cursor-pointer flex items-center gap-1" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem' }}>
          <Download size={14} /> Export
        </button>
      </div>

      <div className="grid grid-cols-6 gap-2 mb-4">
        {[
          { label: 'Total', value: logs.length },
          { label: 'Active', value: activeCount, color: 'var(--success)' },
          { label: 'Banned', value: bannedCount, color: 'var(--accent)' },
          { label: 'Today', value: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length },
          { label: 'This Week', value: logs.filter(l => { const d = new Date(l.timestamp); const now = new Date(); return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000; }).length },
          { label: 'Unique IPs', value: new Set(logs.map(l => l.ip)).size },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--bg)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: color || 'var(--accent)' }}>{value}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'banned'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className="cursor-pointer border-none capitalize" style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, background: filter === f ? 'var(--accent)' : 'var(--bg)', color: filter === f ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>
            {f} {f === 'all' ? `(${logs.length})` : f === 'active' ? `(${activeCount})` : `(${bannedCount})`}
          </button>
        ))}
      </div>

      {filteredLogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Users size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p style={{ fontSize: '0.9rem' }}>No {filter} logs found.</p>
        </div>
      ) : (
        <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
          {filteredLogs.map((log) => {
            const isExpanded = expandedId === log.id;
            const isBanned = log.status === 'banned';
            const bg = isBanned ? 'rgba(56,138,177,0.05)' : 'var(--bg)';
            const border = isBanned ? '1px solid rgba(56,138,177,0.3)' : '1px solid var(--border)';
            const op = isBanned ? 0.6 : 1;
            return (
              <div key={log.id} style={{ background: bg, border: border, borderRadius: '12px', padding: '14px 16px', marginBottom: '8px', fontSize: '0.8rem', opacity: op }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 700 }}>{log.ip}</span>
                    {isBanned && <span style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>BANNED</span>}
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>{formatDate(log.timestamp)}</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> 21+</span>
                  <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Research</span>
                  <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> TOS</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{log.screenResolution} | {log.platform} | {log.timezone}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {isBanned ? (
                    <button onClick={() => handleUnban(log.id)} className="cursor-pointer" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>Unban</button>
                  ) : (
                    <button onClick={() => handleBan(log.id)} className="cursor-pointer" style={{ background: 'rgba(56,138,177,0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>Ban IP</button>
                  )}
                  <button onClick={() => handleRemove(log.id)} className="cursor-pointer" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.7rem' }}>Remove</button>
                  <button onClick={() => setExpandedId(isExpanded ? null : log.id)} className="cursor-pointer" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '4px', borderRadius: '6px', fontSize: '0.7rem', marginLeft: 'auto' }}>
                    {isExpanded ? 'Less' : 'More info'}
                  </button>
                </div>
                {isExpanded && (
                  <div style={{ background: 'rgba(10,22,40,0.5)', borderRadius: '8px', padding: '12px', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                    <div><strong style={{ color: 'var(--text)' }}>User Agent:</strong> {log.userAgent}</div>
                    <div><strong style={{ color: 'var(--text)' }}>Language:</strong> {log.language} ({log.languages})</div>
                    <div><strong style={{ color: 'var(--text)' }}>Platform:</strong> {log.platform} | Vendor: {log.vendor}</div>
                    <div><strong style={{ color: 'var(--text)' }}>Device:</strong> {log.hardwareConcurrency} cores | {(log as any).deviceMemory || '?'}GB RAM | {log.maxTouchPoints} touch pts | DPR: {log.pixelRatio}</div>
                    <div><strong style={{ color: 'var(--text)' }}>Screen:</strong> {log.screenResolution} | {log.colorDepth}-bit color</div>
                    <div><strong style={{ color: 'var(--text)' }}>Entry Source:</strong> Website Direct</div>
                    <div><strong style={{ color: 'var(--text)' }}>Online:</strong> {log.online ? 'Yes' : 'No'} | DNT: {log.doNotTrack} | Cookies: {log.cookieEnabled ? 'On' : 'Off'}</div>
                    {log.plugins && log.plugins.length > 0 && <div><strong style={{ color: 'var(--text)' }}>Plugins:</strong> {log.plugins.join(', ')}</div>}
                    <div><strong style={{ color: 'var(--text)' }}>Log ID:</strong> <span style={{ fontFamily: 'monospace' }}>{log.id}</span></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


/* Users sub-component */
function UsersTab({ showToast }: { showToast: (message: string, icon?: string) => void }) {
  const [users, setUsers] = useState<import('@/firebase/userAuth').UserProfile[]>([]);
  const [userOrders, setUserOrders] = useState<Record<string, any[]>>({});
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [requireLogin, setRequireLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
    loadSettings();
  }, []);

  const loadUsers = async () => {
    const { listAllUsers } = await import('@/firebase/userAuth');
    const data = await listAllUsers();
    setUsers(data);
    setLoading(false);

    // Load orders for each user
    const { getUserOrders } = await import('@/firebase/userAuth');
    const ordersMap: Record<string, any[]> = {};
    for (const u of data) {
      ordersMap[u.uid] = await getUserOrders(u.uid);
    }
    setUserOrders(ordersMap);
  };

  const loadSettings = async () => {
    const { getShopSettings } = await import('@/firebase/userAuth');
    const settings = await getShopSettings();
    setRequireLogin(!!settings.requireLogin);
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Delete this user permanently?')) return;
    const { deleteUserAccount } = await import('@/firebase/userAuth');
    const ok = await deleteUserAccount(uid);
    if (ok) {
      setUsers(prev => prev.filter(u => u.uid !== uid));
      showToast('User deleted', '\u2705');
    } else {
      showToast('Failed to delete user', '\u274C');
    }
  };

  const toggleRequireLogin = async () => {
    const newVal = !requireLogin;
    setRequireLogin(newVal);
    const { setShopSettings } = await import('@/firebase/userAuth');
    await setShopSettings({ requireLogin: newVal });
    showToast(newVal ? 'Login required for orders' : 'Guest checkout enabled', '\u2705');
  };

  return (
    <div>
      {/* Shop Settings */}
      <div className="mb-6 p-4" style={{ background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={18} style={{ color: 'var(--accent)' }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Require Account for Orders</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>When enabled, customers must register/login before checking out</div>
            </div>
          </div>
          <button
            onClick={toggleRequireLogin}
            className="cursor-pointer border-none bg-transparent"
          >
            {requireLogin ? (
              <ToggleRight size={32} style={{ color: 'var(--success)' }} />
            ) : (
              <ToggleLeft size={32} style={{ color: 'var(--text-muted)' }} />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            <Users size={16} style={{ display: 'inline', marginRight: '8px', color: 'var(--accent)' }} />
            Registered Users
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {users.length} user{users.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button onClick={loadUsers} className="cursor-pointer flex items-center gap-1" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem' }}>
          <Clock size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading users...</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Users size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>No registered users yet.</p>
        </div>
      ) : (
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {users.map(user => {
            const isExpanded = expandedUser === user.uid;
            const orders = userOrders[user.uid] || [];
            return (
              <div key={user.uid} style={{ background: 'var(--bg)', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                      {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.displayName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '20px' }}>
                      {orders.length} order{orders.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => setExpandedUser(isExpanded ? null : user.uid)}
                      className="cursor-pointer border-none bg-transparent"
                      style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}
                    >
                      {isExpanded ? 'Hide' : 'View'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.uid)}
                      className="cursor-pointer border-none bg-transparent transition-all duration-200"
                      style={{ color: '#ef4444', padding: '6px' }}
                      title="Delete user"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    {orders.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No orders placed</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {orders.map((order: any) => (
                          <div key={order.id} className="flex items-center justify-between p-2" style={{ background: 'var(--bg-card)', borderRadius: '8px', fontSize: '0.75rem' }}>
                            <div className="flex items-center gap-2">
                              <Package size={12} style={{ color: 'var(--accent)' }} />
                              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{order.id}</span>
                              <span style={{ color: 'var(--text-muted)' }}>{order.items?.length || 0} items</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>${(order.total || 0).toFixed(2)}</span>
                              <span style={{ color: order.status === 'processing' ? '#f59e0b' : order.status === 'delivered' ? '#22c55e' : 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Discord Settings sub-component */
function DiscordSettingsTab({ showToast }: { showToast: (message: string, icon?: string) => void }) {
  const [webhookUrl, setWebhookUrlState] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [isConnected, setIsConnected] = useState(false);

  // Load webhook URL from Firestore on mount
  useEffect(() => {
    // Try localStorage first (instant)
    const local = localStorage.getItem('ng_discord_webhook_url') || '';
    if (local) {
      setWebhookUrlState(local);
      setIsConnected(true);
    }
    // Then try Firestore (authoritative)
    loadWebhookUrl().then(url => {
      if (url) {
        setWebhookUrlState(url);
        setIsConnected(true);
      }
    });
  }, []);

  const saveWebhook = async () => {
    await setWebhookUrl(webhookUrl);
    setIsConnected(!!webhookUrl);
    showToast('Webhook URL saved to Firebase!', '\u2705');
  };

  const testWebhook = async () => {
    if (!webhookUrl) return;
    setTestStatus('sending');
    const ok = await notifyOrderStatusUpdate({
      id: 'TEST-123456',
      status: 'confirmed',
      total: 99.99,
      crypto: 'BTC',
      shipping: { name: 'Test User', email: 'test@test.com' },
    });
    setTestStatus(ok ? 'sent' : 'error');
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            <MessageCircle size={16} style={{ display: 'inline', marginRight: '8px', color: '#5865F2' }} />
            Discord Notifications
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Send order notifications to your Discord server automatically.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isConnected ? '#22c55e' : '#ef4444' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isConnected ? 'Connected' : 'Not configured'}</span>
        </div>
      </div>

      <div className="p-5 mb-4" style={{ background: 'var(--bg)', borderRadius: '14px' }}>
        <label className="block mb-2" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
          Discord Webhook URL
        </label>
        <p className="mb-3" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Paste your Discord webhook URL here. Right-click your Discord channel, Edit Channel, Integrations, Webhooks, New Webhook, Copy URL.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={webhookUrl}
            onChange={e => setWebhookUrlState(e.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
            className="flex-1 outline-none"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'monospace' }}
          />
          <button
            onClick={saveWebhook}
            className="cursor-pointer border-none"
            style={{ background: 'var(--accent)', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem' }}
          >
            <Save size={14} style={{ display: 'inline', marginRight: '4px' }} /> Save
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={testWebhook}
          disabled={!webhookUrl || testStatus === 'sending'}
          className="cursor-pointer border-none"
          style={{ background: '#5865F2', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', opacity: !webhookUrl ? 0.5 : 1 }}
        >
          {testStatus === 'sending' ? 'Sending...' : testStatus === 'sent' ? 'Sent!' : testStatus === 'error' ? 'Failed' : 'Test Webhook'}
        </button>
      </div>

      <h4 className="mb-3" style={{ fontSize: '0.9rem', fontWeight: 700 }}>How to Set Up</h4>
      <div className="flex flex-col gap-3">
        {[
          { step: '1', text: 'In Discord, right-click your channel → Edit Channel → Integrations → Webhooks → New Webhook → Copy URL' },
          { step: '2', text: 'Paste the URL above and click Save' },
          { step: '3', text: 'Click Test Webhook to verify it works' },
        ].map(({ step, text }) => (
          <div key={step} className="flex gap-3 p-3" style={{ background: 'var(--bg)', borderRadius: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>{step}</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.5 }}>{text}</p>
          </div>
        ))}
      </div>

      <h4 className="mt-6 mb-3" style={{ fontSize: '0.9rem', fontWeight: 700 }}>Notification Events</h4>
      <div className="flex flex-col gap-2">
        {[
          { event: 'New Order Placed', desc: 'When a customer completes checkout' },
          { event: 'Status: Confirmed', desc: 'When you confirm payment' },
          { event: 'Status: Shipped', desc: 'When you mark as shipped' },
          { event: 'Status: Delivered', desc: 'When you mark as delivered' },
        ].map(({ event, desc }) => (
          <div key={event} className="flex items-center justify-between p-3" style={{ background: 'var(--bg)', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.85rem' }}>{event}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
