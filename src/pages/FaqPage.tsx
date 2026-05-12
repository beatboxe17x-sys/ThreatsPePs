import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  { q: 'What is the minimum age to purchase?', a: 'You must be at least 21 years of age to purchase products from NG Research. Age verification is required before accessing our website.' },
  { q: 'Are your products for human consumption?', a: 'No. All products sold on NG Research are intended strictly for laboratory research purposes only. They are NOT for human consumption, veterinary use, or any application involving living organisms.' },
  { q: 'What does COA mean?', a: 'COA stands for Certificate of Analysis. It is a document from an independent third-party laboratory that verifies the purity, potency, and identity of a compound. We include a free COA with every order.' },
  { q: 'How pure are your peptides?', a: 'All of our peptides are 99%+ purity verified via HPLC (High-Performance Liquid Chromatography) testing. Every batch is independently tested before it reaches our inventory.' },
  { q: 'How fast do you ship?', a: 'Orders placed before 2PM EST are processed and shipped the same day. Most domestic orders arrive within 2-3 business days. All packages include tracking.' },
  { q: 'Is shipping discreet?', a: 'Yes. All orders are shipped in plain, unmarked packaging with no indication of the contents. Your privacy is our priority.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), USDT, Litecoin (LTC), Monero (XMR), and Solana (SOL). Crypto payments are secure and private.' },
  { q: 'Do you offer refunds?', a: 'Due to the nature of research chemicals, all sales are final. We do not offer refunds or exchanges. Please review your order carefully before completing checkout.' },
  { q: 'How should I store my peptides?', a: 'For optimal stability, store peptide vials in a cool, dry place away from direct sunlight. Reconstituted peptides should be refrigerated at 2-8°C (36-46°F) and used within the timeframe specified on the COA.' },
  { q: 'Do you ship internationally?', a: 'We currently ship to the United States and select international destinations. International customers are responsible for understanding and complying with their local import laws and regulations.' },
  { q: 'How do I view the COA for a product?', a: 'On any product detail page, click on the product vial image. This will trigger an animation and open the Certificate of Analysis viewer where you can zoom, pan, and download the full document.' },
  { q: 'Are your products FDA approved?', a: 'No. None of our products have been evaluated by the FDA. They are sold exclusively for research and development purposes. This is clearly stated in our Terms of Service which all customers must agree to before purchasing.' },
];

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px' }}>
      <section style={{ padding: '60px var(--container-pad) 80px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56,138,177,0.1)', border: '1px solid rgba(56,138,177,0.2)', borderRadius: '50px', padding: '6px 18px', marginBottom: '16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', fontFamily: 'Poppins, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <HelpCircle size={14} />
              Frequently Asked Questions
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Got Questions? We Got Answers.
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Everything you need to know about ordering, shipping, and our research compounds.
            </p>
          </div>

          {/* FAQ Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqs.map((faq, i) => {
              const isOpen = openIdx === i;
              return (
                <div
                  key={i}
                  style={{
                    background: 'var(--bg-card)',
                    border: isOpen ? '1px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    transition: 'border-color 0.25s',
                  }}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 bg-transparent border-none cursor-pointer"
                    style={{ padding: '18px 20px', color: 'var(--text)', fontSize: '0.95rem', fontWeight: 600, textAlign: 'left' }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        color: 'var(--accent)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s',
                        flexShrink: 0,
                      }}
                    />
                  </button>
                  <div
                    style={{
                      maxHeight: isOpen ? '300px' : '0',
                      overflow: 'hidden',
                      transition: 'max-height 0.3s ease',
                    }}
                  >
                    <p style={{ padding: '0 20px 18px', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Still have questions CTA */}
          <div style={{ textAlign: 'center', marginTop: '48px', padding: '32px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Still have questions?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Our research specialists are here to help.
            </p>
            <Link
              to="/"
              onClick={() => setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100)}
              style={{ background: 'var(--accent)', color: '#fff', padding: '12px 28px', borderRadius: '10px', fontWeight: 600, textDecoration: 'none', display: 'inline-block', fontSize: '0.9rem' }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px var(--container-pad)', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <img src="/images/logo.png" alt="NG Research" style={{ height: '70px', objectFit: 'contain', marginBottom: '16px' }} />
        </Link>
        <p>&copy; 2026 NG Research Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
