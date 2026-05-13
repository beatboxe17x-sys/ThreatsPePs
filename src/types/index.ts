export interface Product {
  name: string;
  price: number;
  img: string;
  mg: string;
  shopify: string;
  description: string;
  highlights: string[];
  coa?: string;
}

export interface CartItem {
  id: string;
  qty: number;
}

export type Crypto = 'btc' | 'eth' | 'usdt' | 'ltc' | 'xmr' | 'sol';

export interface ToastState {
  message: string;
  icon: string;
  visible: boolean;
}

export interface ConsentLog {
  id: string;
  ip: string;
  timestamp: string;
  userAgent: string;
  age21: boolean;
  researchOnly: boolean;
  agreeTos: boolean;
  screenResolution: string;
  timezone: string;
  // Rich fingerprinting
  language: string;
  languages: string;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: string;
  online: boolean;
  vendor: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  maxTouchPoints: number;
  colorDepth: number;
  pixelRatio: number;
  referrer: string;
  plugins: string[];
  // Status
  status: 'active' | 'banned';
}

export const CRYPTO_NAMES: Record<Crypto, string> = {
  btc: 'Bitcoin',
  eth: 'Ethereum',
  usdt: 'Tether',
  ltc: 'Litecoin',
  xmr: 'Monero',
  sol: 'Solana',
};

export const CRYPTO_SYMBOLS: Record<Crypto, string> = {
  btc: 'BTC',
  eth: 'ETH',
  usdt: 'USDT',
  ltc: 'LTC',
  xmr: 'XMR',
  sol: 'SOL',
};

export const CRYPTO_RATES: Record<Crypto, number> = {
  btc: 0.000015,
  eth: 0.00028,
  usdt: 1,
  ltc: 0.0012,
  xmr: 0.0034,
  sol: 0.0056,
};

export const DEFAULT_PRODUCTS: Record<string, Product> = {
  retatrutide: {
    name: 'Retatrutide',
    price: 79.99,
    img: '/images/retatrutide.png?v=4',
    mg: '20 MG',
    shopify: 'https://nextgen-research-2.myshopify.com/products/glp-3-rt-20-mg?variant=48566637789411',
    description: 'Advanced triple agonist peptide combining GLP-1, GIP, and glucagon receptor activation for comprehensive metabolic research.',
    highlights: ['Triple agonist mechanism', '20 MG research-grade', '99%+ purity verified', 'HPLC tested'],
    coa: '/images/coa-retatrutide.png?v=4',
  },
  sermorelin: {
    name: 'Sermorelin',
    price: 59.99,
    img: '/images/sermorelin.png?v=4',
    mg: '10 MG',
    shopify: 'https://nextgen-research-2.myshopify.com/products/sermorelin-10mg?variant=48567023698147',
    description: 'Growth hormone releasing hormone analog for endocrine system research and growth hormone secretion studies.',
    highlights: ['GHRH analog', '10 MG research-grade', '99%+ purity verified', 'Third-party tested'],
    coa: '/images/coa-sermorelin.png?v=4',
  },
  ghkcu: {
    name: 'GHK-Cu',
    price: 44.99,
    img: '/images/ghk-cu.png?v=4',
    mg: '100 MG',
    shopify: 'https://nextgen-research-2.myshopify.com/products/ghk-cu-50-mg?variant=48567022846179',
    description: 'Copper tripeptide complex for tissue regeneration, wound healing, and skin barrier function research.',
    highlights: ['Copper peptide complex', '50 MG research-grade', '99%+ purity verified', 'COA included'],
  },
  bpc157: {
    name: 'BPC-157',
    price: 54.99,
    img: '/images/bpc-157.png?v=4',
    mg: '10 MG',
    shopify: 'https://nextgen-research-2.myshopify.com/products/bpc-157-10mg?variant=48567021404387',
    description: 'Body Protection Compound-157, a synthetic pentadecapeptide for healing, recovery, and regenerative medicine research.',
    highlights: ['Pentadecapeptide', '10 MG research-grade', '99%+ purity verified', 'Independent lab tested'],
    coa: '/images/coa-bpc157.png?v=4',
  },
  bacwater: {
    name: 'Bacteriostatic Water',
    price: 14.99,
    img: '/images/bacwater.png?v=4',
    mg: '10 mL',
    shopify: 'https://nextgen-research-2.myshopify.com/products/bacteriostatic-water-10ml?variant=48567020519651',
    description: 'Sterile bacteriostatic water for safe reconstitution of peptide compounds in laboratory research.',
    highlights: ['Sterile 0.9% benzyl alcohol', '10 mL multi-dose vial', 'For reconstitution', 'Research grade'],
  },
  glp3rt: {
    name: 'GLP-3 RT',
    price: 89.99,
    img: '/images/glp-3rt.png?v=4',
    mg: '20 MG',
    shopify: 'https://nextgen-research-2.myshopify.com/products/glp-3-rt-20-mg?variant=48566637789411',
    description: 'Next-generation GLP-3 receptor-targeted peptide for advanced metabolic, appetite regulation, and weight management research.',
    highlights: ['GLP-3 receptor targeted', '20 MG research-grade', '99%+ purity verified', 'HPLC & mass spec tested'],
  },
  semax: {
    name: 'Semax',
    price: 64.99,
    img: '/images/semax.png?v=4',
    mg: '10 MG',
    shopify: 'https://nextgen-research-2.myshopify.com/products',
    description: 'Synthetic heptapeptide for cognitive enhancement, neuroprotection, and BDNF expression research.',
    highlights: ['Heptapeptide nootropic', '10 MG research-grade', '99%+ purity verified', 'Neuroprotective studies'],
    coa: '/images/coa-semax.png?v=4',
  },
  selank: {
    name: 'Selank',
    price: 64.99,
    img: '/images/selank.png?v=4',
    mg: '10 MG',
    shopify: 'https://nextgen-research-2.myshopify.com/products',
    description: 'Synthetic tuftsin analog for anxiolytic, nootropic, and immunomodulatory research applications.',
    highlights: ['Tuftsin analog', '10 MG research-grade', '99%+ purity verified', 'Anxiolytic research'],
    coa: '/images/coa-selank.png?v=4',
  },
  tirzepatide: {
    name: 'Tirzepatide',
    price: 84.99,
    img: '/images/tirzepatide.png?v=4',
    mg: '10 MG',
    shopify: 'https://nextgen-research-2.myshopify.com/products',
    description: 'Dual GIP/GLP-1 receptor agonist for advanced metabolic, glycemic control, and weight management research.',
    highlights: ['Dual GIP/GLP-1 agonist', '10 MG research-grade', '99%+ purity verified', 'COA included'],
    coa: '/images/coa-tirz.png?v=4',
  },
};

export const DEFAULT_CRYPTO_ADDRESSES: Record<Crypto, string> = {
  btc: 'bc1qwy2v5j55hdpe2dvd2deda8el9qm3l7ka86fyrv',
  eth: '0x719A2FC947Ed03f80C4747503Ab9d0d32149EA26',
  usdt: '0x719A2FC947Ed03f80C4747503Ab9d0d32149EA26',
  ltc: 'LSjCbBh1pfamHsoGKdvqVwEWZLPGBKq4XU',
  xmr: '0x719A2FC947Ed03f80C4747503Ab9d0d32149EA26',
  sol: '5VsYhRisDrJd8SD7LJaWnFKyJhD4yeG8XUexhaHXDGv3',
};
// v4
