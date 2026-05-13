import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ExternalLink } from 'lucide-react';

const QUICK_REPLIES = [
  'What peptides do you carry?',
  'How long is shipping?',
  'Do you ship discreetly?',
  'What payment methods?',
  'How do I track my order?',
];

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; from: 'user' | 'bot' }[]>([
    { text: 'Hey! Welcome to NG Research. How can we help you today?', from: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { text, from: 'user' }]);
    setInput('');

    // Auto-reply
    setTimeout(() => {
      const reply = getAutoReply(text);
      setMessages(prev => [...prev, { text: reply, from: 'bot' }]);
    }, 600);
  };

  return (
    <>
      {/* Chat button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="cursor-pointer border-none flex items-center justify-center"
          style={{
            position: 'fixed', bottom: '20px', right: '20px', zIndex: 9998,
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'var(--accent)', color: '#fff',
            boxShadow: '0 4px 20px rgba(56,138,177,0.4)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <MessageCircle size={22} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
          width: '320px', height: '440px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '16px', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden',
        }}>
          {/* Header */}
          <div className="flex items-center justify-between" style={{ padding: '12px 14px', background: 'var(--accent)', color: '#fff' }}>
            <div className="flex items-center gap-2">
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>NG Research Support</span>
            </div>
            <button onClick={() => setOpen(false)} className="cursor-pointer border-none bg-transparent" style={{ color: '#fff', padding: '4px' }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '8px 12px',
                borderRadius: m.from === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: m.from === 'user' ? 'var(--accent)' : 'var(--bg)',
                color: m.from === 'user' ? '#fff' : 'var(--text)',
                fontSize: '0.8rem',
                lineHeight: 1.4,
                border: m.from === 'user' ? 'none' : '1px solid var(--border)',
              }}>
                {m.text}
              </div>
            ))}
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-1" style={{ padding: '0 12px 8px' }}>
              {QUICK_REPLIES.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="cursor-pointer border-none"
                  style={{ fontSize: '0.65rem', padding: '4px 8px', borderRadius: '12px', background: 'var(--bg)', color: 'var(--accent)', border: '1px solid rgba(56,138,177,0.2)', fontWeight: 600 }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2" style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Type a message..."
              className="bg-transparent border-none outline-none flex-1"
              style={{ color: 'var(--text)', fontSize: '0.8rem', minWidth: 0 }}
            />
            <button onClick={() => sendMessage(input)} className="cursor-pointer border-none bg-transparent" style={{ color: 'var(--accent)', padding: '4px' }}>
              <Send size={16} />
            </button>
          </div>

          {/* Footer link to Discord */}
          <div style={{ padding: '6px 12px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <a href="https://discord.gg/4hENXJWUax" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1"
              style={{ fontSize: '0.65rem', color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>
              <ExternalLink size={10} /> Join our Discord for live support
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function getAutoReply(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('peptide') || lower.includes('carry') || lower.includes('product')) {
    return 'We carry a wide range of research peptides including BPC-157, TB-500, Semaglutide, Tirzepatide, and more. Check out our full catalog on the Products page!';
  }
  if (lower.includes('ship') || lower.includes('delivery') || lower.includes('long')) {
    return 'We offer fast discreet shipping. Most domestic orders arrive within 3-5 business days. International shipping typically takes 7-14 days.';
  }
  if (lower.includes('discreet') || lower.includes('packaging')) {
    return 'All orders are shipped in plain, unmarked packaging. No product labels or branding on the exterior. Your privacy is 100% guaranteed.';
  }
  if (lower.includes('payment') || lower.includes('pay') || lower.includes('crypto')) {
    return 'We accept Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), USDT, Solana (SOL), and Monero (XMR). All payments are processed securely through our crypto checkout.';
  }
  if (lower.includes('track') || lower.includes('order')) {
    return 'You can track your order anytime using the Track Order page or click the Active Order indicator in the navbar. You\'ll also get Discord notifications when your status updates!';
  }
  if (lower.includes('affiliate') || lower.includes('partner')) {
    return 'We have an affiliate program! You can apply at /affiliate. Promote NG Research and earn commission on every sale you generate.';
  }
  return 'Thanks for reaching out! For faster help, join our Discord community at discord.gg/4hENXJWUax where our team can assist you in real-time.';
}
