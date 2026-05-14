import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Box } from 'lucide-react';
import Vial3D from '@/components/Vial3D';
import { DEFAULT_PRODUCTS } from '@/types';

const PRODUCT_IMAGES: Record<string, string> = {
  bpc157: '/images/bpc-157.png',
  ghkcu: '/images/ghkcu.png',
  sermorelin: '/images/sermorelin.png',
  semax: '/images/semax.png',
  selank: '/images/selank.png',
  tirzepatide: '/images/tirzepatide.png',
  glp3rt: '/images/glp3rt.png',
  retatrutide: '/images/retatrutide.png',
  bacwater: '/images/bacwater.png',
};

export default function VialViewer() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [currentProduct, setCurrentProduct] = useState(productId || 'semax');

  const product = DEFAULT_PRODUCTS[currentProduct];
  const imageUrl = PRODUCT_IMAGES[currentProduct] || '/images/semax.png';

  return (
    <div style={{ width: '100%', height: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="cursor-pointer border-none flex items-center gap-2 transition-all duration-200"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 20,
          background: 'rgba(15,31,53,0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          padding: '10px 18px',
          borderRadius: '10px',
          fontSize: '0.85rem',
          fontWeight: 600,
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Product selector */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
      >
        {Object.entries(DEFAULT_PRODUCTS).map(([id, p]) => (
          <button
            key={id}
            onClick={() => setCurrentProduct(id)}
            className="cursor-pointer border-none flex items-center gap-2 transition-all duration-200"
            style={{
              background: currentProduct === id ? 'var(--accent)' : 'rgba(15,31,53,0.8)',
              backdropFilter: 'blur(10px)',
              border: currentProduct === id ? '1px solid var(--accent)' : '1px solid var(--border)',
              color: currentProduct === id ? '#fff' : 'var(--text-muted)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              textAlign: 'left',
              minWidth: '140px',
            }}
          >
            <Box size={12} />
            {p.name}
          </button>
        ))}
      </div>

      {/* 3D Viewer */}
      <Vial3D
        imageUrl={imageUrl}
        title={product?.name || currentProduct.toUpperCase()}
        subtitle={`${product?.mg || ''} Research Peptide`}
      />
    </div>
  );
}
