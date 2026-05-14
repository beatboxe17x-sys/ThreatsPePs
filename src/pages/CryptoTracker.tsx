import { useState, useEffect, useRef } from 'react';
import { Search, ExternalLink, Clock, CheckCircle2, AlertCircle, ArrowLeft, Blocks, Wallet, Zap, CircleDollarSign, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { lookupTransaction, guessChain, type TxInfo, type Chain, CHAIN_NAMES } from '@/utils/blockchain';

const RECENT_SEARCHES_KEY = 'ng_crypto_tracker_searches';
const MAX_RECENT = 10;

export default function CryptoTracker() {
  const [query, setQuery] = useState('');
  const [selectedChain, setSelectedChain] = useState<Chain | ''>('');
  const [result, setResult] = useState<TxInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState<Array<{ hash: string; chain: Chain; time: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
      setRecentSearches(saved);
    } catch { /* empty */ }
    inputRef.current?.focus();
  }, []);

  const saveSearch = (hash: string, chain: Chain) => {
    const newSearch = { hash, chain, time: new Date().toISOString() };
    const updated = [newSearch, ...recentSearches.filter(s => s.hash !== hash)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleSearch = async (overrideHash?: string) => {
    const hash = overrideHash || query.trim();
    if (!hash) return;

    setLoading(true);
    setError('');
    setResult(null);

    // Auto-detect chain if none selected
    const chain = selectedChain || guessChain(hash) || undefined;

    try {
      const tx = await lookupTransaction(hash, chain || undefined);
      if (tx) {
        setResult(tx);
        saveSearch(tx.hash, tx.chain);
        if (!overrideHash) setQuery(hash);
      } else {
        setError(`Transaction not found. Try a different hash or select the correct blockchain.`);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const formatCrypto = (sats: number, symbol: string) => {
    if (symbol === 'BTC' || symbol === 'LTC' || symbol === 'DOGE') {
      return (sats / 1e8).toFixed(8);
    }
    if (symbol === 'ETH') {
      return (sats / 1e18).toFixed(8);
    }
    return sats.toString();
  };

  const formatUsd = (usd: number) => {
    if (usd === 0) return '$0.00';
    if (usd < 0.01) return '< $0.01';
    return `$${usd.toFixed(2)}`;
  };

  const timeSince = (iso: string) => {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', paddingTop: '140px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 var(--container-pad)' }}>
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer border-none bg-transparent mb-8 transition-colors duration-300"
          style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ArrowLeft size={16} /> Back to Shop
        </button>

        <div className="mb-8">
          <h1 className="mb-2" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1 }}>
            <Zap size={28} style={{ display: 'inline', color: 'var(--accent)', marginRight: '12px', verticalAlign: 'middle' }} />
            Crypto Tracker
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '500px' }}>
            Enter your transaction hash (TXID) to track it on the blockchain. Supports Bitcoin, Ethereum, Litecoin, and Dogecoin.
          </p>
        </div>

        {/* Search */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Transaction Hash (TXID)
              </label>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste your TXID here... e.g. a1b2c3d4..."
                className="w-full outline-none transition-colors duration-300"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  color: 'var(--text)',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                Blockchain
              </label>
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value as Chain | '')}
                className="outline-none cursor-pointer"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  color: 'var(--text)',
                  fontSize: '0.9rem',
                  minWidth: '160px',
                }}
              >
                <option value="">Auto-detect</option>
                <option value="bitcoin">Bitcoin (BTC)</option>
                <option value="ethereum">Ethereum (ETH)</option>
                <option value="litecoin">Litecoin (LTC)</option>
                <option value="dogecoin">Dogecoin (DOGE)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || loading}
            className="w-full cursor-pointer border-none transition-all duration-300 flex items-center justify-center gap-2"
            style={{
              background: query.trim() ? 'var(--accent)' : 'var(--border)',
              color: '#fff',
              padding: '14px 24px',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 700,
              marginTop: '16px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Searching...</> : <><Search size={18} /> Track Transaction</>}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 mb-6" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '16px' }}>
            <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
            <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            {/* Status header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {result.status === 'confirmed' ? (
                  <div className="flex items-center gap-2" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '8px 16px' }}>
                    <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
                    <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.85rem' }}>Confirmed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', padding: '8px 16px' }}>
                    <Clock size={18} style={{ color: '#f59e0b' }} />
                    <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem' }}>Pending</span>
                  </div>
                )}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{result.chainName}</span>
              </div>
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 transition-colors duration-300"
                style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600 }}
              >
                <ExternalLink size={14} /> View on Explorer
              </a>
            </div>

            {/* TX Hash */}
            <div className="mb-6" style={{ background: 'var(--bg)', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>TRANSACTION HASH</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all', color: 'var(--text)' }}>{result.hash}</div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Confirmations', value: result.confirmations.toLocaleString(), icon: <Blocks size={16} />, highlight: result.confirmations >= 6 },
                { label: 'Amount', value: `${formatCrypto(result.amount, result.symbol)} ${result.symbol}`, icon: <Wallet size={16} /> },
                { label: 'USD Value', value: formatUsd(result.amountUsd), icon: <CircleDollarSign size={16} /> },
                { label: 'Block', value: result.blockId > 0 ? `#${result.blockId.toLocaleString()}` : 'Pending', icon: <Blocks size={16} /> },
                { label: 'Fee', value: `${formatCrypto(result.fee, result.symbol)} ${result.symbol}`, icon: <Zap size={16} /> },
                { label: 'Time', value: result.time !== 'Unknown' ? timeSince(result.time) : 'Unknown', icon: <Clock size={16} /> },
              ].map(({ label, value, icon, highlight }) => (
                <div key={label} style={{ background: 'var(--bg)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ color: 'var(--accent)', marginBottom: '4px' }}>{icon}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: highlight ? '#22c55e' : 'var(--text)' }}>{value}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Progress bar for confirmations */}
            {result.status === 'confirmed' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONFIRMATION PROGRESS</span>
                  <span style={{ fontSize: '0.75rem', color: result.confirmations >= 6 ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>
                    {result.confirmations >= 6 ? 'SECURE (6+)' : `${result.confirmations} / 6`}
                  </span>
                </div>
                <div style={{ background: 'var(--bg)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                  <div
                    style={{
                      background: result.confirmations >= 6 ? '#22c55e' : 'var(--accent)',
                      height: '100%',
                      borderRadius: '10px',
                      transition: 'width 0.5s ease',
                      width: `${Math.min((result.confirmations / 6) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  {[0, 1, 2, 3, 4, 5, 6].map(n => (
                    <span key={n} style={{ fontSize: '0.6rem', color: result.confirmations >= n ? (n === 6 ? '#22c55e' : 'var(--accent)') : 'var(--text-muted)' }}>
                      {n === 6 ? '6+' : n}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Searches</h3>
              <button
                onClick={clearRecent}
                className="bg-transparent border-none cursor-pointer transition-colors duration-300"
                style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {recentSearches.map((s, i) => (
                <button
                  key={`${s.hash}-${i}`}
                  onClick={() => { setQuery(s.hash); setSelectedChain(s.chain); handleSearch(s.hash); }}
                  className="flex items-center justify-between w-full bg-transparent cursor-pointer transition-all duration-200"
                  style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="flex items-center gap-3">
                    <Search size={14} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{s.hash.substring(0, 24)}...</span>
                    <span style={{ fontSize: '0.7rem', background: 'var(--bg)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{CHAIN_NAMES[s.chain]}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{timeSince(s.time)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
