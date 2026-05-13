import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '@/hooks/useAppContext';
import { useAuth } from '@/hooks/useAuth';
import { X, Copy, Check, AlertTriangle, Mail, Clock, ArrowRight } from 'lucide-react';
import type { Crypto } from '@/types';
import { CRYPTO_NAMES, CRYPTO_SYMBOLS, CRYPTO_RATES } from '@/types';
import { notifyNewOrder } from '@/discord/webhook';
import { markVisitorOrderPlaced } from '@/firebase/visitor';

const cryptoIcons: Record<Crypto, string> = {
  btc: '#f7931a', eth: '#627eea', usdt: '#26a17b', ltc: '#345d9d', xmr: '#ff6600', sol: '#9945ff',
};

export default function CheckoutModal() {
  const { cart, products, cryptoAddresses, isCheckoutOpen, closeCheckout, selectedCrypto, selectCrypto, showToast, saveOrder, promo, getDiscountedTotal, getDiscountAmount, markPromoUsed } = useApp();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(3600);
  const [copied, setCopied] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [shipping, setShipping] = useState({ name: '', email: '', address: '', city: '', zip: '', country: 'United States' });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const subtotal = cart.reduce((s, i) => s + (products[i.id]?.price || 0) * i.qty, 0);
  const totalPrice = getDiscountedTotal(subtotal);
  const discountAmount = getDiscountAmount(subtotal);
  const cryptoAmount = (totalPrice * (CRYPTO_RATES[selectedCrypto] || 0)).toFixed(8);
  const address = cryptoAddresses[selectedCrypto] || '';

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current!);
    setTimer(3600);
    timerRef.current = setInterval(() => setTimer(p => p <= 1 ? (clearInterval(timerRef.current!), 0) : p - 1), 1000);
  }, []);

  useEffect(() => { if (isCheckoutOpen) { setStep(1); setOrderNumber('TH-' + Date.now().toString(36).toUpperCase()); } return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [isCheckoutOpen]);

  const goToStep2 = () => { if (!shipping.name || !shipping.email) { alert('Please fill in name and email'); return; } setStep(2); startTimer(); };
  const goBackToStep1 = () => { setStep(1); if (timerRef.current) clearInterval(timerRef.current); };

  const confirmPayment = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const orderItems = cart.map(item => ({ id: item.id, name: products[item.id]?.name || item.id, qty: item.qty, price: products[item.id]?.price || 0 }));
    const order = {
      id: orderNumber,
      date: new Date().toISOString(),
      items: orderItems,
      total: totalPrice,
      subtotal,
      promo: promo.applied ? { code: promo.code, discount: promo.discount, amountSaved: discountAmount } : null,
      crypto: selectedCrypto.toUpperCase(),
      cryptoAmount,
      txHash: 'pending-verification',
      status: 'processing' as const,
      shipping,
      userId: user?.uid || null,
    };
    // Save to Firebase (with localStorage fallback built into context)
    await saveOrder(order);
    // Mark promo as used after successful order
    if (promo.applied) {
      markPromoUsed();
    }
    // Send Discord notification
    notifyNewOrder({
      id: orderNumber,
      total: totalPrice,
      crypto: selectedCrypto.toUpperCase(),
      items: orderItems.map(i => ({ name: i.name, qty: i.qty })),
      shipping,
      promo: promo.applied ? `${promo.code} (-${(promo.discount * 100).toFixed(0)}%)` : undefined,
    });
    // Track visitor order in session
    markVisitorOrderPlaced(orderNumber);
    setStep(3);
  };

  const finishCheckout = () => { closeCheckout(); showToast('Order placed! We will verify your payment and ship soon.', '\u2708\uFE0F'); };
  const copyAddress = () => { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const formatTime = (s: number) => s <= 0 ? 'EXPIRED' : `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const cryptoKeys = Object.keys(cryptoAddresses) as Crypto[];
  if (!isCheckoutOpen) return null;

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) closeCheckout(); }}>
      <div className="modal">
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Checkout</h2>
          <button onClick={closeCheckout} className="bg-transparent border-none cursor-pointer" style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
        </div>
        <div className="p-6">
          {/* Step dots */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className="flex items-center justify-center rounded-full font-bold text-sm" style={{ width: '32px', height: '32px', border: '2px solid', borderColor: step >= s ? (step > s ? 'var(--success)' : 'var(--accent)') : 'var(--border)', background: step > s ? 'var(--success)' : (step === s ? 'var(--accent)' : 'var(--bg)'), color: step >= s ? '#fff' : 'var(--text-muted)' }}>{step > s ? '\u2713' : s}</div>
                {s < 3 && <div className="flex-1 h-0.5 rounded-sm" style={{ background: step > s ? 'var(--success)' : 'var(--border)' }} />}
              </div>
            ))}
          </div>

          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="checkout-step active">
              <h3 className="mb-4" style={{ fontSize: '1.1rem' }}>Shipping Information</h3>
              {['name', 'email', 'address'].map(f => (
                <div className="mb-4" key={f}>
                  <label className="block mb-1.5" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{f === 'name' ? 'Full Name' : f === 'email' ? 'Email' : 'Address'}{f !== 'address' ? ' *' : ''}</label>
                  <input type={f === 'email' ? 'email' : 'text'} value={(shipping as any)[f]} onChange={e => setShipping(p => ({ ...p, [f]: e.target.value }))} placeholder={f === 'name' ? 'John Doe' : f === 'email' ? 'john@example.com' : '123 Research Ave'} className="w-full outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text)', fontSize: '0.9rem' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div><label className="block mb-1.5" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>City</label><input type="text" value={shipping.city} onChange={e => setShipping(p => ({ ...p, city: e.target.value }))} placeholder="New York" className="w-full outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text)', fontSize: '0.9rem' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} /></div>
                <div><label className="block mb-1.5" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>ZIP</label><input type="text" value={shipping.zip} onChange={e => setShipping(p => ({ ...p, zip: e.target.value }))} placeholder="10001" className="w-full outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text)', fontSize: '0.9rem' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} /></div>
              </div>
              <div className="mb-4"><label className="block mb-1.5" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Country</label><select value={shipping.country} onChange={e => setShipping(p => ({ ...p, country: e.target.value }))} className="w-full outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text)', fontSize: '0.9rem' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}><option>United States</option><option>Canada</option><option>United Kingdom</option><option>Australia</option><option>Germany</option><option>Other</option></select></div>
              <button onClick={goToStep2} className="w-full cursor-pointer border-none" style={{ background: 'var(--accent)', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem' }} onMouseEnter={e => e.currentTarget.style.background = '#2d6f8f'} onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>Continue to Payment</button>
            </div>
          )}

          {/* Step 2: Crypto Payment */}
          {step === 2 && (
            <div className="checkout-step active">
              <h3 className="mb-4" style={{ fontSize: '1.1rem' }}>Select Cryptocurrency</h3>
              <div className="mb-4 p-4" style={{ background: 'var(--bg)', borderRadius: '12px' }}>
                <div className="flex justify-between mb-1" style={{ fontSize: '0.9rem' }}><span>Order #</span><span style={{ fontFamily: 'monospace' }}>{orderNumber}</span></div>
                <div className="flex justify-between mb-1" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                {promo.applied && (
                  <div className="flex justify-between mb-1" style={{ fontSize: '0.85rem', color: 'var(--success)' }}>
                    <span>Discount ({promo.code} - {(promo.discount * 100).toFixed(0)}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between" style={{ fontSize: '1.1rem', fontWeight: 700 }}><span>Total</span><span style={{ color: promo.applied ? 'var(--success)' : 'var(--accent)' }}>${totalPrice.toFixed(2)}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {cryptoKeys.map(crypto => (
                  <div key={crypto} className={`crypto-option ${selectedCrypto === crypto ? 'selected' : ''}`} onClick={() => selectCrypto(crypto)}>
                    <div className="flex items-center justify-center rounded-full font-bold" style={{ width: '40px', height: '40px', background: cryptoIcons[crypto], color: '#fff', fontSize: '1.1rem', flexShrink: 0 }}>{crypto === 'btc' ? '\u20BF' : crypto === 'eth' ? '\u039E' : crypto === 'usdt' ? '\u20AE' : crypto === 'ltc' ? '\u0141' : crypto === 'xmr' ? '\u0271' : '\u25CE'}</div>
                    <div><h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{CRYPTO_NAMES[crypto]}</h4><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{crypto === 'usdt' ? 'USDT (ERC-20)' : CRYPTO_SYMBOLS[crypto]}</p></div>
                  </div>
                ))}
              </div>
              <div className="text-center p-6 mb-4" style={{ background: 'var(--bg)', borderRadius: '16px' }}>
                <div className="mx-auto mb-4 p-4 bg-white rounded-xl inline-block"><QRCodeSVG value={address} size={160} /></div>
                <p className="mb-3" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Send exactly <strong style={{ color: 'var(--accent)' }}>{cryptoAmount} {selectedCrypto.toUpperCase()}</strong> to:</p>
                <div className="flex items-center gap-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px' }}>
                  <input type="text" value={address} readOnly className="flex-1 bg-transparent border-none outline-none" style={{ color: 'var(--text)', fontFamily: 'monospace', fontSize: '0.75rem' }} />
                  <button onClick={copyAddress} className="flex items-center gap-1 cursor-pointer border-none" style={{ background: copied ? 'var(--success)' : 'var(--accent)', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied!' : 'Copy'}</button>
                </div>
              </div>
              {/* Manual verification notice */}
              <div className="flex items-start gap-3 p-4 mb-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px' }}>
                <AlertTriangle size={18} style={{ color: 'var(--crypto)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.8rem', lineHeight: 1.6 }}><strong style={{ color: 'var(--crypto)' }}>Manual Payment Verification</strong><br />Send the exact amount to the address above. Your order will be processed once payment is confirmed on the blockchain. This typically takes 10-60 minutes. You will receive an email confirmation once we verify your payment.</div>
              </div>
              {/* Timer */}
              <div className="flex items-center justify-center gap-2 mb-5"><Clock size={16} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quote expires in</span><span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)' }}>{formatTime(timer)}</span></div>
              {/* Buttons */}
              <button onClick={confirmPayment} className="w-full cursor-pointer border-none mb-3" style={{ background: 'var(--accent)', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem' }} onMouseEnter={e => e.currentTarget.style.background = '#2d6f8f'} onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}><ArrowRight size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />I Have Sent the Payment</button>
              <button onClick={goBackToStep1} className="w-full cursor-pointer" style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', padding: '14px', borderRadius: '12px', fontWeight: 600, fontSize: '1rem' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}>Back to Shipping</button>
            </div>
          )}

          {/* Step 3: Payment Submitted - Awaiting Verification */}
          {step === 3 && (
            <div className="checkout-step active">
              <div className="text-center py-6">
                <div className="mx-auto mb-5 flex items-center justify-center" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(56,138,177,0.15)', border: '2px solid var(--accent)' }}>
                  <Mail size={36} style={{ color: 'var(--accent)' }} />
                </div>
                <h2 className="mb-2" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Payment Submitted</h2>
                <p className="mb-4" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>We have received your order. Your payment is being verified on the blockchain.</p>

                {/* Status box */}
                <div className="mb-5 p-4" style={{ background: 'var(--bg)', borderRadius: '14px', textAlign: 'left' }}>
                  <div className="mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Status</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Awaiting Verification</span>
                    </div>
                  </div>
                  <div className="flex justify-between mb-2" style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--text-muted)' }}>Order #</span><span style={{ fontWeight: 600 }}>{orderNumber}</span></div>
                  <div className="flex justify-between mb-2" style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--text-muted)' }}>Amount Sent</span><span style={{ fontWeight: 600 }}>{cryptoAmount} {selectedCrypto.toUpperCase()}</span></div>
                  {promo.applied && (
                    <div className="flex justify-between mb-2" style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Discount ({promo.code})</span>
                      <span style={{ fontWeight: 600, color: 'var(--success)' }}>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between mb-2" style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--text-muted)' }}>Total (USD)</span><span style={{ fontWeight: 700, color: promo.applied ? 'var(--success)' : 'var(--accent)' }}>${totalPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between" style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--text-muted)' }}>Shipping To</span><span>{shipping.name}, {shipping.city || 'N/A'}</span></div>
                </div>

                {/* What happens next */}
                <div className="mb-5 p-4" style={{ background: 'rgba(56,138,177,0.06)', borderRadius: '12px', textAlign: 'left' }}>
                  <h4 className="mb-3" style={{ fontSize: '0.9rem', fontWeight: 700 }}>What happens next?</h4>
                  <ol style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '16px', margin: 0 }}>
                    <li>We monitor the blockchain for your payment (usually 10-60 min)</li>
                    <li>Once confirmed, we prepare your order for same-day shipping</li>
                    <li>You will receive an email with tracking information</li>
                    <li>Your package arrives in 2-3 business days with discreet packaging</li>
                  </ol>
                </div>

                {/* Important note */}
                <div className="mb-4 p-3" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#ef4444' }}>Important:</strong> Do not close this page until you have sent the payment. If you need assistance, contact support@ngresearch.com with your order number.
                </div>

                {/* Discord CTA */}
                <div className="flex items-center gap-3 p-4 mb-4" style={{ background: 'rgba(88,101,242,0.08)', border: '1px solid rgba(88,101,242,0.2)', borderRadius: '12px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" fill="#5865F2"/>
                  </svg>
                  <div className="flex-1" style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Join Our Discord</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Get order updates & support</div>
                  </div>
                  <a
                    href="https://discord.gg/4hENXJWUax"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 no-underline transition-all duration-300"
                    style={{ background: '#5865F2', color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#4752C4'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#5865F2'; }}
                  >
                    Join
                  </a>
                </div>

                <button onClick={finishCheckout} className="cursor-pointer border-none" style={{ background: 'var(--accent)', color: '#fff', padding: '14px 40px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem' }} onMouseEnter={e => e.currentTarget.style.background = '#2d6f8f'} onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>Continue Shopping</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
