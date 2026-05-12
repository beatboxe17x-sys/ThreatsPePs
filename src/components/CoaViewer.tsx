import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, FileCheck } from 'lucide-react';

interface CoaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  productName: string;
}

export default function CoaViewer({ isOpen, onClose, imageSrc, productName }: CoaViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartDist = useRef(0);
  const touchStartZoom = useRef(1);

  // Open/close animation
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => setVisible(true));
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setVisible(false);
      const t = setTimeout(() => {
        document.body.style.overflow = '';
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.25, 4));
      if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.5));
      if (e.key === '0') { setZoom(1); setPan({ x: 0, y: 0 }); }
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(z + 0.5, 4)), []);
  const handleZoomOut = useCallback(() => {
    setZoom(z => {
      const nz = Math.max(z - 0.5, 0.5);
      if (nz <= 1) setPan({ x: 0, y: 0 });
      return nz;
    });
  }, []);
  const handleReset = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  // Mouse drag for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  const handleMouseUp = () => setIsDragging(false);

  // Touch pinch zoom
  const getTouchDist = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touchStartDist.current = getTouchDist(e.touches);
      touchStartZoom.current = zoom;
    } else if (e.touches.length === 1 && zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dist = getTouchDist(e.touches);
      const scale = dist / touchStartDist.current;
      setZoom(Math.min(Math.max(touchStartZoom.current * scale, 0.5), 4));
    } else if (e.touches.length === 1 && isDragging && zoom > 1) {
      setPan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (zoom <= 1) setPan({ x: 0, y: 0 });
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom(z => {
      const nz = Math.min(Math.max(z + delta, 0.5), 4);
      if (nz <= 1) setPan({ x: 0, y: 0 });
      return nz;
    });
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageSrc;
    a.download = `COA-${productName.replace(/\s+/g, '-')}.png`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`coa-overlay ${visible ? 'active' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="coa-close cursor-pointer border-none"
        aria-label="Close COA viewer"
      >
        <X size={24} />
      </button>

      {/* Header bar */}
      <div className="coa-header">
        <div className="flex items-center gap-2">
          <FileCheck size={18} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>COA — {productName}</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {Math.round(zoom * 100)}% — Drag to pan, scroll to zoom
        </span>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="coa-container"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={imageSrc}
          alt={`Certificate of Analysis for ${productName}`}
          className="coa-image"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          draggable={false}
        />
      </div>

      {/* Zoom controls */}
      <div className="coa-controls">
        <button onClick={handleZoomIn} className="coa-btn cursor-pointer" aria-label="Zoom in">
          <ZoomIn size={20} />
        </button>
        <button onClick={handleZoomOut} className="coa-btn cursor-pointer" aria-label="Zoom out">
          <ZoomOut size={20} />
        </button>
        <button onClick={handleReset} className="coa-btn cursor-pointer" aria-label="Reset zoom">
          <RotateCcw size={18} />
        </button>
        <button onClick={handleDownload} className="coa-btn cursor-pointer" aria-label="Download COA">
          <Download size={18} />
        </button>
      </div>
    </div>
  );
}
