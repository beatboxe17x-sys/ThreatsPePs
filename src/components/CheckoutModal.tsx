import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '@/hooks/useAppContext';
import { useAuth } from '@/hooks/useAuth';
import {
  X, Copy, Check, Clock, ArrowRight, ArrowLeft, Shield,
  Truck, Wallet, Package, ChevronRight, Bitcoin, AlertTriangle,
  Zap, Loader2, ExternalLink, Search
} from 'lucide-react';
import type { Crypto } from '@/types';
import { CRYPTO_NAMES, CRYPTO_SYMBOLS, CRYPTO_RATES } from '@/types';
import { notifyNewOrder } from '@/discord/webhook';
import { markVisitorOrderPlaced } from '@/firebase/visitor';

/* ─── crypto config ─── */
const cryptoMeta: Record<Crypto, { color: string; icon: string; confirm: number; speed: string }> = {
  btc:  { color: '#f7931a', icon: '\u20BF', confirm: 2,  speed: '10-60 min' },
  eth:  { color: '#627eea', icon: '\u039E', confirm: 12, speed: '2-5 min' },
  usdt: { color: '#26a17b', icon: '\u20AE', confirm: 12, speed: '2-5 min' },
  ltc:  { color: '#345d9d', icon: '\u0141', confirm: 6,  speed: '5-30 min' },
  xmr:  { color: '#ff6600', icon: '\u0271', confirm: 10, speed: '10-30 min' },
  sol:  { color: '#9945ff', icon: '\u25CE', confirm: 32, speed: '~1 min' },
};

/* ─── steps ─── */
type Step = 1 | 2 | 3 | 4;
const STEP_LABELS: Record<Step, string> = {
  1: 'Review',
  2: 'Shipping',
  3: 'Payment',
  4: 'Confirm',
};

export default function CheckoutModal() {
  const {
    cart, products, cryptoAddresses, isCheckoutOpen, closeCheckout,
    selectedCrypto, selectCrypto, showToast, saveOrder,
    promo, getDiscountedTotal, getDiscountAmount, markPromoUsed,
  } = useApp();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState<'fwd' | 'back'>('fwd');
  const [timer, setTimer] = useState(3600);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedAmt, setCopiedAmt] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* shipping */
  const [shipping, setShipping] = useState({
    name: '', email: '', address: '', city: '', zip: '', country: 'United States',
  });
  const [shipErrors, setShipErrors] = useState<Record<string, string>>({});

  /* tx hash (optional payment verification) */
  const [txHash, setTxHash] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ─── calculations ─── */
  const subtotal   = cart.reduce((s, i) => s + (products[i.id]?.price || 0) * i.qty, 0);
  const totalPrice = getDiscountedTotal(subtotal);
  const discount   = getDiscountAmount(subtotal);
  const cryptoAmt  = (totalPrice * (CRYPTO_RATES[selectedCrypto] || 0)).toFixed(8);
  const address    = cryptoAddresses[selectedCrypto] || '';
  const meta       = cryptoMeta[selectedCrypto];

  /* ─── timer ─── */
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current!);
    setTimer(3600);
    timerRef.current = setInterval(
      () => setTimer(p => (p <= 1 ? (clearInterval(timerRef.current!), 0) : p - 1)),
      1000,
    );
  }, []);

  useEffect(() => {
    if (isCheckoutOpen) {
      setStep(1);
      setDirection('fwd');
      setOrderNumber('TH-' + Date.now().toString(36).toUpperCase());
      setTxHash('');
      setShipErrors({});
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isCheckoutOpen]);

  /* ─── navigation ─── */
  const go = (s: Step, d: 'fwd' | 'back') => { setDirection(d); setStep(s); };

  const validateShipping = () => {
    const e: Record<string, string> = {};
    if (!shipping.name.trim())  e.name  = 'Full name is required';
    if (!shipping.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) e.email = 'Invalid email';
    setShipErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ─── confirm payment ─── */
  const confirmPayment = async () => {
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const orderItems = cart.map(item => ({
      id: item.id,
      name: products[item.id]?.name || item.id,
      qty: item.qty,
      price: products[item.id]?.price || 0,
    }));

    const order = {
      id: orderNumber,
      date: new Date().toISOString(),
      items: orderItems,
      total: totalPrice,
      subtotal,
      promo: promo.applied ? { code: promo.code, discount: promo.discount, amountSaved: discount } : null,
      crypto: selectedCrypto.toUpperCase(),
      cryptoAmount: cryptoAmt,
      txHash: txHash.trim() || 'pending-verification',
      status: 'processing' as const,
      shipping,
      userId: user?.uid || null,
    };

    await saveOrder(order);
    if (promo.applied) markPromoUsed();

    notifyNewOrder({
      id: orderNumber,
      total: totalPrice,
      crypto: selectedCrypto.toUpperCase(),
      items: orderItems.map(i => ({ name: i.name, qty: i.qty })),
      shipping,
      promo: promo.applied ? `${promo.code} (-${(promo.discount * 100).toFixed(0)}%)` : undefined,
    });

    markVisitorOrderPlaced(orderNumber);
    setIsSubmitting(false);
    go(4, 'fwd');
  };

  const finish = () => {
    closeCheckout();
    showToast('Order placed! We will verify your payment and ship soon.', '\u2708\uFE0F');
  };

  /* ─── helpers ─── */
  const copy = (text: string, setter: () => void) => {
    navigator.clipboard.writeText(text);
    setter();
  };
  const fmtTime = (s: number) =>
    s <= 0 ? 'EXPIRED' : `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const cryptoKeys = Object.keys(cryptoAddresses) as Crypto[];
  if (!isCheckoutOpen) return null;

  /* ─── slide animation styles ─── */
  const slideStyle: React.CSSProperties = {
    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
    opacity: 1,
    transform: 'translateX(0)',
  };

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => { if (e.target === e.currentTarget) closeCheckout(); }}
      style={{ zIndex: 9999 }}
    >
      <div
        className="modal"
        style={{ maxWidth: '720px', width: '95vw', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px', padding: 0 }}
      >
        {/* Header bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between" style={{ background: 'var(--bg-card)', padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Checkout</h2>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Order #{orderNumber}</p>
          </div>
          <button onClick={closeCheckout} className="bg-transparent border-none cursor-pointer" style={{ color: 'var(--text-muted)' }}><X size={22} /></button>
        </div>

        {/* Progress steps */}
        <div style={{ padding: '20px 28px 0' }}>
          <div className="flex items-center gap-1">
            {([1, 2, 3, 4] as Step[]).map((s, idx) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className="flex flex-col items-center" style={{ cursor: s < step ? 'pointer' : 'default' }}
                  onClick={() => { if (s < step) go(s as Step, 'back'); }}>
                  <div
                    className="flex items-center justify-center rounded-full font-bold transition-all duration-300"
                    style={{
                      width: '28px', height: '28px', fontSize: '0.75rem',
                      border: '2px solid',
                      borderColor: step >= s ? (step > s ? '#22c55e' : 'var(--accent)') : 'var(--border)',
                      background: step > s ? '#22c55e' : (step === s ? 'var(--accent)' : 'var(--bg)'),
                      color: step >= s ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {step > s ? <Check size={14} /> : s}
                  </div>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, marginTop: '4px',
                    color: step >= s ? 'var(--text)' : 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.03em',
                  }}>
                    {STEP_LABELS[s]}
                  </span>
                </div>
                {idx < 3 && (
                  <div className="flex-1 h-0.5 rounded-sm transition-colors duration-500"
                    style={{ background: step > s ? '#22c55e' : 'var(--border)', marginBottom: '16px' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Content ─── */}
        <div style={{ padding: '20px 28px 28px' }}>

          {/* ═══════ STEP 1: REVIEW ═══════ */}
          {step === 1 && (
            <div style={slideStyle}>
              <h3 className="flex items-center gap-2 mb-4" style={{ fontSize: '1rem', fontWeight: 700 }}>
                <Package size={18} style={{ color: 'var(--accent)' }} /> Order Summary
              </h3>

              {/* Item list */}
              <div className="flex flex-col gap-3 mb-5">
                {cart.map(item => {
                  const p = products[item.id];
                  return (
                    <div key={item.id} className="flex items-center gap-4" style={{ background: 'var(--bg)', borderRadius: '12px', padding: '12px' }}>
                      <img src={p?.img || '/images/vial-generic.png?v=5'} alt={p?.name} style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '8px' }} />
                      <div className="flex-1">
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p?.name || item.id}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p?.mg}</div>
                      </div>
                      <div className="text-right">
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>${((p?.price || 0) * item.qty).toFixed(2)}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>x{item.qty}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '16px' }}>
                <div className="flex justify-between mb-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                </div>
                {promo.applied && (
                  <div className="flex justify-between mb-2" style={{ fontSize: '0.85rem', color: '#22c55e' }}>
                    <span>Discount ({promo.code} -{(promo.discount * 100).toFixed(0)}%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between mb-3" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>Shipping</span><span style={{ color: '#22c55e', fontWeight: 600 }}>Free</span>
                </div>
                <div className="flex justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: '1.15rem', color: promo.applied ? '#22c55e' : 'var(--accent)' }}>
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                {promo.applied && (
                  <div className="text-right mt-1" style={{ fontSize: '0.7rem', color: '#22c55e' }}>
                    You saved ${discount.toFixed(2)}
                  </div>
                )}
              </div>

              <button
                onClick={() => go(2, 'fwd')}
                className="w-full cursor-pointer border-none flex items-center justify-center gap-2 transition-all duration-300"
                style={{ background: 'var(--accent)', color: '#fff', padding: '16px', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', marginTop: '20px' }}
                onMouseEnter={e => e.currentTarget.style.background = '#2d6f8f'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                Continue to Shipping <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* ═══════ STEP 2: SHIPPING ═══════ */}
          {step === 2 && (
            <div style={slideStyle}>
              <h3 className="flex items-center gap-2 mb-4" style={{ fontSize: '1rem', fontWeight: 700 }}>
                <Truck size={18} style={{ color: 'var(--accent)' }} /> Shipping Details
              </h3>

              <div className="flex flex-col gap-4">
                {/* Name + Email row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Full Name *</label>
                    <input type="text" value={shipping.name} onChange={e => setShipping(p => ({ ...p, name: e.target.value }))} placeholder="John Doe"
                      className="w-full outline-none transition-colors duration-200"
                      style={{ background: 'var(--bg)', border: `1px solid ${shipErrors.name ? '#ef4444' : 'var(--border)'}`, borderRadius: '10px', padding: '12px 14px', color: 'var(--text)', fontSize: '0.9rem' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }} />
                    {shipErrors.name && <span style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>{shipErrors.name}</span>}
                  </div>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Email *</label>
                    <input type="email" value={shipping.email} onChange={e => setShipping(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com"
                      className="w-full outline-none transition-colors duration-200"
                      style={{ background: 'var(--bg)', border: `1px solid ${shipErrors.email ? '#ef4444' : 'var(--border)'}`, borderRadius: '10px', padding: '12px 14px', color: 'var(--text)', fontSize: '0.9rem' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }} />
                    {shipErrors.email && <span style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>{shipErrors.email}</span>}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block mb-1.5" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Street Address</label>
                  <input type="text" value={shipping.address} onChange={e => setShipping(p => ({ ...p, address: e.target.value }))} placeholder="123 Research Ave"
                    className="w-full outline-none transition-colors duration-200"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text)', fontSize: '0.9rem' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'} />
                </div>

                {/* City + ZIP */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block mb-1.5" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>City</label>
                    <input type="text" value={shipping.city} onChange={e => setShipping(p => ({ ...p, city: e.target.value }))} placeholder="New York"
                      className="w-full outline-none transition-colors duration-200"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text)', fontSize: '0.9rem' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'} />
                  </div>
                  <div className="col-span-1">
                    <label className="block mb-1.5" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>ZIP</label>
                    <input type="text" value={shipping.zip} onChange={e => setShipping(p => ({ ...p, zip: e.target.value }))} placeholder="10001"
                      className="w-full outline-none transition-colors duration-200"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text)', fontSize: '0.9rem' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'} />
                  </div>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Country</label>
                    <select value={shipping.country} onChange={e => setShipping(p => ({ ...p, country: e.target.value }))}
                      className="w-full outline-none cursor-pointer"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text)', fontSize: '0.9rem' }}>
                      <option>United States</option><option>Canada</option><option>United Kingdom</option>
                      <option>Australia</option><option>Germany</option><option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => go(1, 'back')}
                  className="flex-1 cursor-pointer flex items-center justify-center gap-2 transition-all duration-300"
                  style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', padding: '14px', borderRadius: '14px', fontWeight: 700 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={() => { if (validateShipping()) { go(3, 'fwd'); startTimer(); } }}
                  className="flex-[2] cursor-pointer border-none flex items-center justify-center gap-2 transition-all duration-300"
                  style={{ background: 'var(--accent)', color: '#fff', padding: '14px', borderRadius: '14px', fontWeight: 700, fontSize: '1rem' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2d6f8f'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
                >
                  Continue to Payment <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ═══════ STEP 3: CRYPTO PAYMENT ═══════ */}
          {step === 3 && (
            <div style={slideStyle}>
              {/* Crypto selector */}
              <h3 className="flex items-center gap-2 mb-4" style={{ fontSize: '1rem', fontWeight: 700 }}>
                <Wallet size={18} style={{ color: 'var(--accent)' }} /> Select Cryptocurrency
              </h3>

              <div className="grid grid-cols-3 gap-2 mb-5">
                {cryptoKeys.map(crypto => {
                  const m = cryptoMeta[crypto];
                  const isActive = selectedCrypto === crypto;
                  return (
                    <button key={crypto} onClick={() => selectCrypto(crypto)}
                      className="cursor-pointer border-none flex flex-col items-center gap-1.5 transition-all duration-200"
                      style={{
                        background: isActive ? m.color + '15' : 'var(--bg)',
                        border: isActive ? `2px solid ${m.color}` : '1px solid var(--border)',
                        borderRadius: '12px', padding: '12px 8px',
                      }}>
                      <div className="flex items-center justify-center rounded-full font-bold"
                        style={{ width: '36px', height: '36px', background: m.color, color: '#fff', fontSize: '1rem' }}>
                        {m.icon}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)' }}>{CRYPTO_NAMES[crypto]}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>~{m.speed}</span>
                    </button>
                  );
                })}
              </div>

              {/* Payment details card */}
              <div className="mb-5" style={{ background: 'var(--bg)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)' }}>
                {/* Amount to send */}
                <div className="text-center mb-4">
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Send Exactly
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'monospace', color: meta.color }}>
                      {cryptoAmt} {CRYPTO_SYMBOLS[selectedCrypto]}
                    </span>
                    <button onClick={() => copy(cryptoAmt, () => { setCopiedAmt(true); setTimeout(() => setCopiedAmt(false), 2000); })}
                      className="bg-transparent border-none cursor-pointer"
                      style={{ color: copiedAmt ? '#22c55e' : 'var(--text-muted)', transition: 'color 0.2s' }}>
                      {copiedAmt ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    = ${totalPrice.toFixed(2)} USD {promo.applied && <span style={{ color: '#22c55e' }}>({promo.code} applied)</span>}
                  </div>
                </div>

                {/* QR + Address side by side */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                  <div className="p-3 bg-white rounded-xl flex-shrink-0">
                    <QRCodeSVG value={`${CRYPTO_SYMBOLS[selectedCrypto]}:${address}?amount=${cryptoAmt}`} size={140} />
                  </div>
                  <div className="flex-1 w-full">
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      {CRYPTO_NAMES[selectedCrypto]} Address
                    </div>
                    <div className="flex items-center gap-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px' }}>
                      <input type="text" value={address} readOnly
                        className="flex-1 bg-transparent border-none outline-none"
                        style={{ color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.7rem' }} />
                      <button onClick={() => copy(address, () => { setCopiedAddr(true); setTimeout(() => setCopiedAddr(false), 2000); })}
                        className="flex items-center gap-1 cursor-pointer border-none flex-shrink-0"
                        style={{ background: copiedAddr ? '#22c55e' : meta.color, color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>
                        {copiedAddr ? <Check size={12} /> : <Copy size={12} />} {copiedAddr ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Info pills */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[
                        { icon: <Shield size={10} />, label: `${meta.confirm} conf. required` },
                        { icon: <Zap size={10} />, label: meta.speed },
                        { icon: <Bitcoin size={10} />, label: 'Network: Mainnet' },
                      ].map(pill => (
                        <span key={pill.label} className="flex items-center gap-1"
                          style={{ fontSize: '0.6rem', background: 'var(--bg-card)', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                          {pill.icon} {pill.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2 p-3" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px' }}>
                  <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Send <strong style={{ color: '#f59e0b' }}>exactly</strong> the amount shown. Sending more or less may cause delays. Payments are verified on-chain, typically within {meta.speed}.
                  </span>
                </div>
              </div>

              {/* Optional: TX Hash input */}
              <div className="mb-4">
                <label className="flex items-center gap-1.5 mb-1.5" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  <Search size={12} /> Transaction Hash (optional)
                </label>
                <input type="text" value={txHash} onChange={e => setTxHash(e.target.value)}
                  placeholder="Paste your TXID after sending payment..."
                  className="w-full outline-none transition-colors duration-200"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text)', fontSize: '0.8rem', fontFamily: 'monospace' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'} />
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Adding your TX hash speeds up payment verification. You can also add it later in Track Order.
                </div>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 mb-5">
                <Clock size={14} style={{ color: timer <= 300 ? '#ef4444' : 'var(--accent)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quote expires in</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: timer <= 300 ? '#ef4444' : 'var(--accent)', fontSize: '0.9rem' }}>
                  {fmtTime(timer)}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button onClick={() => go(2, 'back')}
                  className="flex-1 cursor-pointer flex items-center justify-center gap-2 transition-all duration-300"
                  style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', padding: '14px', borderRadius: '14px', fontWeight: 700 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={confirmPayment} disabled={isSubmitting}
                  className="flex-[2] cursor-pointer border-none flex items-center justify-center gap-2 transition-all duration-300"
                  style={{ background: 'var(--accent)', color: '#fff', padding: '14px', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', opacity: isSubmitting ? 0.7 : 1 }}
                  onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = '#2d6f8f'; }}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
                >
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
                    : <><Check size={18} /> I Have Sent Payment</>}
                </button>
              </div>

              {/* Security badge */}
              <div className="flex items-center justify-center gap-2 mt-4" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                <Shield size={10} /> End-to-end encrypted. Your payment is verified on the blockchain.
              </div>
            </div>
          )}

          {/* ═══════ STEP 4: CONFIRMATION ═══════ */}
          {step === 4 && (
            <div style={slideStyle}>
              <div className="text-center py-4">
                {/* Success animation circle */}
                <div className="mx-auto mb-5 flex items-center justify-center"
                  style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e' }}>
                  <Check size={32} style={{ color: '#22c55e' }} />
                </div>

                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>Order Confirmed</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto 6px' }}>
                  We have received your order. Payment is being verified on the {CRYPTO_NAMES[selectedCrypto]} blockchain.
                </p>

                {/* Order card */}
                <div className="text-left mb-5" style={{ background: 'var(--bg)', borderRadius: '14px', padding: '18px' }}>
                  <div className="flex justify-between items-center mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Order #</div>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}>{orderNumber}</div>
                    </div>
                    <div className="flex items-center gap-1.5" style={{ background: 'rgba(56,138,177,0.1)', borderRadius: '8px', padding: '4px 10px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)' }}>Processing</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between" style={{ fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Amount Paid</span>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{cryptoAmt} {CRYPTO_SYMBOLS[selectedCrypto]}</span>
                    </div>
                    <div className="flex justify-between" style={{ fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>USD Value</span>
                      <span style={{ fontWeight: 700 }}>${totalPrice.toFixed(2)}</span>
                    </div>
                    {txHash.trim() && (
                      <div className="flex justify-between" style={{ fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>TX Hash</span>
                        <a href={`https://blockchair.com/search?q=${txHash}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 no-underline"
                          style={{ color: 'var(--accent)', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                          {txHash.substring(0, 16)}... <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 mt-1" style={{ borderTop: '1px solid var(--border)', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Ship To</span>
                      <span style={{ fontWeight: 600 }}>{shipping.name}, {shipping.city || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="text-left mb-5" style={{ background: 'rgba(56,138,177,0.04)', borderRadius: '12px', padding: '16px' }}>
                  <h4 className="mb-3" style={{ fontSize: '0.85rem', fontWeight: 700 }}>What happens next?</h4>
                  <div className="flex flex-col gap-3">
                    {[
                      { icon: <Clock size={14} />, title: 'Payment Verification', desc: `Blockchain confirmation on ${CRYPTO_NAMES[selectedCrypto]} (${cryptoMeta[selectedCrypto].speed})`, active: true },
                      { icon: <Package size={14} />, title: 'Order Preparation', desc: 'Same-day processing once payment confirmed', active: false },
                      { icon: <Truck size={14} />, title: 'Shipping', desc: '2-3 business days with discreet packaging', active: false },
                      { icon: <Shield size={14} />, title: 'Delivered', desc: 'Track your order status anytime', active: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex items-center justify-center rounded-full flex-shrink-0"
                          style={{ width: '28px', height: '28px', background: item.active ? 'var(--accent)' : 'var(--bg)', color: item.active ? '#fff' : 'var(--text-muted)' }}>
                          {item.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: item.active ? 'var(--text)' : 'var(--text-muted)' }}>{item.title}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discord */}
                <div className="flex items-center gap-3 p-3 mb-5" style={{ background: 'rgba(88,101,242,0.06)', border: '1px solid rgba(88,101,242,0.15)', borderRadius: '10px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" fill="#5865F2"/>
                  </svg>
                  <div className="flex-1 text-left">
                    <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>Join Discord for Updates</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Get notified when your payment is confirmed</div>
                  </div>
                  <a href="https://discord.gg/4hENXJWUax" target="_blank" rel="noopener noreferrer"
                    className="no-underline transition-all duration-200"
                    style={{ background: '#5865F2', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#4752C4'}
                    onMouseLeave={e => e.currentTarget.style.background = '#5865F2'}>
                    Join
                  </a>
                </div>

                <button onClick={finish}
                  className="cursor-pointer border-none transition-all duration-300"
                  style={{ background: 'var(--accent)', color: '#fff', padding: '14px 40px', borderRadius: '14px', fontWeight: 700, fontSize: '1rem' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2d6f8f'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
