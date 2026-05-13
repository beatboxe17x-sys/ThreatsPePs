import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, MessageCircle } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import SearchBar from './SearchBar';
import ActiveOrder from './ActiveOrder';

export default function Navbar() {
  const { cart, openCart, openAdmin } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const isHome = location.pathname === '/';

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      openAdmin();
    }
  }, [openAdmin]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (!isHome) {
      navigate('/');
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const pageLinks = [
    { label: 'Why Us', href: '/why-us' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Track Order', href: '/track-order' },
  ];

  const scrollLinks = [
    { label: 'Products', href: '#products' },
    { label: 'Features', href: '#features' },
    { label: 'Discord', href: 'https://discord.gg/4hENXJWUax', external: true },
  ];

  if (location.pathname === '/intro' || location.pathname === '/age-verify') return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[1000]" style={{ background: 'rgba(10,22,40,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between h-[100px]" style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
          {/* Logo */}
          <Link to="/" className="flex items-center no-underline">
            <img src="/logo-full.png" alt="NG Research" style={{ height: '80px', objectFit: 'contain' }} />
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-6 list-none">
            {pageLinks.map(link => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="no-underline transition-colors duration-300"
                  style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {scrollLinks.map(link => (
              <li key={link.href}>
                {'external' in link && link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline transition-colors duration-300 flex items-center gap-1"
                    style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#5865F2')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <MessageCircle size={14} /> {link.label}
                  </a>
                ) : (
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="bg-transparent border-none cursor-pointer transition-colors duration-300"
                    style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {link.label}
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-3">
            <ActiveOrder compact />
            <SearchBar />
            <button
              onClick={openCart}
              className="relative bg-transparent border-none cursor-pointer p-2 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <ShoppingBag size={22} />
              {totalQty > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-white font-bold" style={{ background: 'var(--accent)', fontSize: '0.65rem', width: '18px', height: '18px' }}>
                  {totalQty}
                </span>
              )}
            </button>
            <button
              onClick={() => scrollTo('#products')}
              className="cursor-pointer border-none transition-all duration-300"
              style={{ background: 'var(--accent)', color: '#fff', padding: '10px 22px', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2d6f8f'; e.currentTarget.style.boxShadow = '0 0 20px var(--accent-glow)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              Shop Now
            </button>
          </div>

          {/* Mobile */}
          <div className="flex lg:hidden items-center gap-3">
            <ActiveOrder compact />
            <SearchBar />
            <button onClick={openCart} className="relative bg-transparent border-none cursor-pointer p-2" style={{ color: 'var(--text-muted)' }}>
              <ShoppingBag size={22} />
              {totalQty > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-white font-bold" style={{ background: 'var(--accent)', fontSize: '0.65rem', width: '18px', height: '18px' }}>
                  {totalQty}
                </span>
              )}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="bg-transparent border-none cursor-pointer p-2" style={{ color: 'var(--text-muted)' }}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className="lg:hidden overflow-hidden transition-all duration-300"
          style={{ maxHeight: mobileOpen ? '400px' : '0', background: 'var(--bg-card)', borderTop: mobileOpen ? '1px solid var(--border)' : 'none' }}
        >
          <div className="flex flex-col p-4 gap-3">
            {pageLinks.map(link => (
              <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)} className="no-underline" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, padding: '6px 0' }}>
                {link.label}
              </Link>
            ))}
            {scrollLinks.map(link => (
              'external' in link && link.external ? (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="no-underline flex items-center gap-2" style={{ color: '#5865F2', fontSize: '0.9rem', fontWeight: 600, padding: '6px 0' }} onClick={() => setMobileOpen(false)}>
                  <MessageCircle size={16} /> {link.label}
                </a>
              ) : (
                <button key={link.href} onClick={() => scrollTo(link.href)} className="bg-transparent border-none cursor-pointer text-left" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, padding: '6px 0' }}>
                  {link.label}
                </button>
              )
            ))}
          </div>
        </div>
      </nav>

    </>
  );
}
