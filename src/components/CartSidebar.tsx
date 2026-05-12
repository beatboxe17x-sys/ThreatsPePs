import { useState } from 'react';
import { useApp } from '@/hooks/useAppContext';
import { X, Minus, Plus, Tag, Check, AlertCircle } from 'lucide-react';

export default function CartSidebar() {
  const { cart, products, isCartOpen, closeCart, openCheckout, removeFromCart, updateQty, promo, applyPromoCode, removePromo, getDiscountedTotal, getDiscountAmount } = useApp();
  const [promoInput, setPromoInput] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (products[item.id]?.price || 0) * item.qty, 0);
  const totalPrice = getDiscountedTotal(subtotal);
  const discountAmount = getDiscountAmount(subtotal);

  return (
    <>
      <div className={`cart-overlay ${isCartOpen ? 'active' : ''}`} onClick={closeCart} />
      <div className={`cart-sidebar ${isCartOpen ? 'active' : ''}`}>
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Your Cart</h2>
          <button onClick={closeCart} className="bg-transparent border-none cursor-pointer transition-colors duration-300" style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: '16px 24px' }}>
          {cart.length === 0 ? (
            <div className="text-center flex flex-col items-center gap-4" style={{ padding: '60px 20px', color: 'var(--text-muted)' }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => {
              const product = products[item.id];
              if (!product) return null;
              return (
                <div key={item.id} className="flex gap-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <img src={product.img} alt={product.name} className="object-contain" style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'var(--bg)' }} />
                  <div className="flex-1">
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>{product.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.mg}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="flex items-center justify-center cursor-pointer transition-all duration-200"
                        style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="flex items-center justify-center cursor-pointer transition-all duration-200"
                        style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      >
                        <Plus size={14} />
                      </button>
                      <span className="ml-auto font-bold" style={{ color: 'var(--accent)' }}>${(product.price * item.qty).toFixed(2)}</span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-2 bg-transparent border-none cursor-pointer transition-colors duration-300"
                        style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6" style={{ borderTop: '1px solid var(--border)' }}>
            {/* Promo Code Section */}
            <div className="mb-4" style={{ background: 'var(--bg)', borderRadius: '10px', padding: '12px', border: '1px solid var(--border)' }}>
              {!promo.applied ? (
                <>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    <Tag size={10} style={{ display: 'inline', marginRight: '4px' }} /> Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Enter PEP26"
                      className="flex-1 outline-none"
                      style={{
                        background: 'var(--bg-card)',
                        border: promo.error ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'var(--text)',
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const ok = applyPromoCode(promoInput);
                          if (ok) setPromoSuccess(true);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const ok = applyPromoCode(promoInput);
                        if (ok) setPromoSuccess(true);
                      }}
                      className="cursor-pointer border-none transition-all duration-200"
                      style={{ background: 'var(--accent)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      Apply
                    </button>
                  </div>
                  {promo.error && (
                    <p className="flex items-center gap-1 mt-1" style={{ fontSize: '0.7rem', color: '#ef4444' }}>
                      <AlertCircle size={10} /> {promo.error}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check size={14} style={{ color: 'var(--success)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)' }}>PEP26 Applied</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(56,138,177,0.1)', padding: '2px 8px', borderRadius: '4px' }}>25% OFF</span>
                  </div>
                  <button
                    onClick={() => { removePromo(); setPromoInput(''); setPromoSuccess(false); }}
                    className="bg-transparent border-none cursor-pointer"
                    style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textDecoration: 'underline' }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between mb-2" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {promo.applied && (
              <div className="flex justify-between mb-2" style={{ fontSize: '0.9rem', color: 'var(--success)' }}>
                <span>Discount (PEP26 - 25%)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between mb-2" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Shipping</span>
              <span style={{ color: 'var(--success)' }}>Free</span>
            </div>
            <div className="flex justify-between mb-5" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              <span>Total</span>
              <span style={{ color: promo.applied ? 'var(--success)' : 'var(--accent)' }}>${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={openCheckout}
              className="w-full cursor-pointer border-none transition-all duration-300"
              style={{ background: 'var(--accent)', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#2d6f8f';
                e.currentTarget.style.boxShadow = '0 0 30px var(--accent-glow)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--accent)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Checkout with Crypto
              <span style={{ marginLeft: '8px' }}>→</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
