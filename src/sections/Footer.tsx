import { Link } from 'react-router-dom';
import { MessageCircle, Twitter, Instagram, Mail, Shield, FileText, Beaker } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)' }}>
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex items-center no-underline mb-4">
              <img src="/logo-full.png" alt="NG Research" style={{ height: '70px', objectFit: 'contain' }} />
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Premium research-grade peptides. Third-party tested, HPLC verified.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://discord.gg/4hENXJWUax" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#5865F2', color: '#fff' }}>
                <MessageCircle size={16} />
              </a>
              <a href="#" className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                <Twitter size={16} />
              </a>
              <a href="#" className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                <Instagram size={16} />
              </a>
              <a href="mailto:atlasecomsales@gmail.com" className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px' }}>Shop</h4>
            <ul className="flex flex-col gap-2 list-none" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <li><a href="/" className="no-underline transition-colors duration-300" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>All Products</a></li>
              <li><Link to="/track-order" className="no-underline transition-colors duration-300" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>Track Order</Link></li>
              <li><Link to="/why-us" className="no-underline transition-colors duration-300" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>Why Us</Link></li>
              <li><Link to="/faq" className="no-underline transition-colors duration-300" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>FAQ</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px' }}>Support</h4>
            <ul className="flex flex-col gap-2 list-none" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <li className="flex items-center gap-2"><Shield size={14} /> HPLC Verified</li>
              <li className="flex items-center gap-2"><FileText size={14} /> COA Included</li>
              <li className="flex items-center gap-2"><Beaker size={14} /> Research Only</li>
              <li><a href="mailto:atlasecomsales@gmail.com" className="no-underline transition-colors duration-300" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>Contact Us</a></li>
            </ul>
          </div>

          {/* Discord Community */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px' }}>Community</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '16px' }}>
              Join our Discord for order updates, exclusive deals, and research discussions.
            </p>
            <a
              href="https://discord.gg/4hENXJWUax"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 no-underline transition-all duration-300"
              style={{ background: '#5865F2', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}
              onMouseEnter={e => { e.currentTarget.style.background = '#4752C4'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#5865F2'; }}
            >
              <MessageCircle size={16} /> Join Discord
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '20px var(--container-pad)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            &copy; 2026 NG Research Inc. All rights reserved. For research purposes only. Not for human consumption.
          </p>
          <div className="flex items-center gap-4" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Link to="/faq" className="no-underline transition-colors duration-300" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>FAQ</Link>
            <span>|</span>
            <a href="#" className="no-underline transition-colors duration-300" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>Privacy</a>
            <span>|</span>
            <a href="#" className="no-underline transition-colors duration-300" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>Terms</a>
            <span>|</span>
            <Link to="/why-us" className="no-underline transition-colors duration-300" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>Why Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
