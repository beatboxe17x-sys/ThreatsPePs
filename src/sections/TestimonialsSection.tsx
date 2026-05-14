import { useState, useEffect, useRef } from 'react';
import { Star, Send, Check } from 'lucide-react';

interface Review {
  id: string;
  stars: number;
  quote: string;
  initials: string;
  name: string;
  title: string;
}

const DEFAULT_REVIEWS: Review[] = [
  { id: '1', stars: 5, quote: 'The purity and consistency of these peptides is unmatched. Every batch has been spot-on for our research protocols. The COA documentation is thorough and reliable.', initials: 'DR', name: 'Dr. Richard M.', title: 'Lead Researcher, BioLab Sciences' },
  { id: '2', stars: 5, quote: 'Fast shipping and excellent packaging. The compounds arrived in perfect condition with full documentation. Customer support was incredibly knowledgeable.', initials: 'SK', name: 'Sarah K.', title: 'Lab Director, Molecular Dynamics' },
  { id: '3', stars: 5, quote: 'We have tried multiple suppliers over the years. NG Research is the only one that consistently delivers pharmaceutical-grade quality with transparent lab results.', initials: 'JT', name: 'James T.', title: 'Principal Investigator, CellGen Research' },
  { id: '4', stars: 5, quote: 'The GLP-3 RT quality exceeded our expectations. HPLC purity was confirmed at 99.2%. Will definitely be ordering again for our ongoing metabolic studies.', initials: 'AL', name: 'Dr. Amanda L.', title: 'Endocrine Research Institute' },
  { id: '5', stars: 5, quote: 'Outstanding customer service and lightning-fast shipping. The bacteriostatic water paired perfectly with our peptide reconstitution protocols.', initials: 'MK', name: 'Michael K.', title: 'Research Coordinator, Peptide Labs' },
  { id: '6', stars: 5, quote: 'GHK-Cu batch was exceptional. Our wound healing research showed consistent, reproducible results. The included COA gave our IRB full confidence.', initials: 'RP', name: 'Dr. Rachel P.', title: 'Dermatology Research Center' },
];

export default function TestimonialsSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', title: '', quote: '', stars: 5 });

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('active');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    gridRef.current?.querySelectorAll('.reveal').forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${i * 100}ms`;
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const handleSubmit = () => {
    if (!form.name.trim() || !form.quote.trim()) return;
    const initials = form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const payload = {
      content: `**New Review Submission**\n**Name:** ${form.name}\n**Title:** ${form.title || 'N/A'}\n**Stars:** ${'★'.repeat(form.stars)}\n**Review:** ${form.quote}`,
    };
    const WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1362854895940022284/mtJd2kKT8bQH02JeN1io5mTFmK21lF_4wdN0skDzDMi2aRTuLnNlFDfuE-7Fpx_g5LJq';
    fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
    setSubmitted(true);
    setTimeout(() => { setShowForm(false); setSubmitted(false); setForm({ name: '', title: '', quote: '', stars: 5 }); }, 2000);
  };

  return (
    <section id="testimonials" style={{ background: 'var(--bg-light)', padding: '80px var(--container-pad)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: '8px' }}>
              What People Say
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Trusted by researchers worldwide</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="cursor-pointer border-none flex items-center gap-2 transition-all duration-200"
            style={{ background: 'var(--accent)', color: '#fff', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem' }}>
            <Send size={14} /> Write a Review
          </button>
        </div>

        {/* Review submission form */}
        {showForm && (
          <div className="mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            {submitted ? (
              <div className="flex items-center justify-center gap-2 py-4" style={{ color: '#22c55e', fontWeight: 700 }}>
                <Check size={18} /> Thank you! Your review has been submitted for approval.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block mb-1" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full outline-none" placeholder="Your name"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: 'var(--text)', fontSize: '0.85rem' }} />
                  </div>
                  <div>
                    <label className="block mb-1" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Title / Lab</label>
                    <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      className="w-full outline-none" placeholder="e.g. Lab Director, BioLab"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: 'var(--text)', fontSize: '0.85rem' }} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-1" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setForm(p => ({ ...p, stars: n }))}
                        className="bg-transparent border-none cursor-pointer"
                        style={{ color: n <= form.stars ? '#f59e0b' : 'var(--border)', fontSize: '1.4rem', transition: 'color 0.2s' }}>
                        <Star size={22} fill={n <= form.stars ? '#f59e0b' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-1" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Review *</label>
                  <textarea value={form.quote} onChange={e => setForm(p => ({ ...p, quote: e.target.value }))}
                    rows={3} placeholder="Share your experience with our products..."
                    className="w-full outline-none resize-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px', color: 'var(--text)', fontSize: '0.85rem' }} />
                </div>
                <button onClick={handleSubmit}
                  className="cursor-pointer border-none flex items-center gap-2"
                  style={{ background: 'var(--accent)', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Send size={14} /> Submit Review
                </button>
              </>
            )}
          </div>
        )}

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEFAULT_REVIEWS.map((t) => (
            <div key={t.id} className="reveal"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < t.stars ? '#f59e0b' : 'none'} style={{ color: i < t.stars ? '#f59e0b' : 'var(--border)' }} />
                ))}
              </div>
              <p className="mb-4" style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center text-white font-bold"
                  style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', fontSize: '0.8rem' }}>
                  {t.initials}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
