import { useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from '@/hooks/useAppContext';
import { startVisitorSession, trackPageView } from '@/firebase/visitor';
import { db } from '@/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import Navbar from '@/components/Navbar';
import CartSidebar from '@/components/CartSidebar';
import CheckoutModal from '@/components/CheckoutModal';
import AdminPanel from '@/components/AdminPanel';
import Toast from '@/components/Toast';
import SocialProof from '@/components/SocialProof';
import PromoBanner from '@/components/PromoBanner';
import AgeGate from '@/pages/AgeGate';
import IntroSplash from '@/pages/IntroSplash';
import HomePage from '@/pages/HomePage';
import WhyUs from '@/pages/WhyUs';
import FaqPage from '@/pages/FaqPage';
import ProductDetail from '@/pages/ProductDetail';
import OrderTracking from '@/pages/OrderTracking';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const { pathname } = useLocation();
  const { showToast } = useApp();
  const prevStatuses = useRef<Record<string, string>>({});

  // Start visitor tracking when site loads
  useEffect(() => {
    startVisitorSession();
  }, []);

  // Track page changes
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  // Listen for order status changes via Firebase and show toast notifications
  // Subscribes to individual order docs by ID — 100% reliable, no indexes needed
  useEffect(() => {
    const database = db;
    if (!database) return;

    // Get order IDs from localStorage (just IDs, tiny data)
    const orderIds: string[] = JSON.parse(localStorage.getItem('ng_order_ids') || '[]');
    if (orderIds.length === 0) return;

    console.log('[Toast] Subscribing to', orderIds.length, 'order docs:', orderIds);

    const unsubscribes = orderIds.slice(0, 20).map(orderId => {
      return onSnapshot(
        doc(database, 'orders', orderId),
        snap => {
          if (!snap.exists()) return;
          const data = snap.data();
          const newStatus = data.status as string;
          const oldStatus = prevStatuses.current[orderId];

          // First time seeing this order — just record status, no toast
          if (!oldStatus) {
            prevStatuses.current[orderId] = newStatus;
            console.log(`[Toast] Initial status for ${orderId}: ${newStatus}`);
            return;
          }

          // Status changed — show toast
          if (oldStatus !== newStatus) {
            const statusLabels: Record<string, string> = {
              processing: 'Awaiting Verification',
              confirmed: 'Confirmed - Preparing Order',
              shipped: 'Shipped - On the Way',
              delivered: 'Delivered',
              cancelled: 'Order Cancelled',
            };
            const label = statusLabels[newStatus] || newStatus;
            console.log(`[Toast] Status changed for ${orderId}: ${oldStatus} → ${newStatus}`);
            showToast(`Order ${orderId} updated: ${label}`, '\uD83D\uDCE6');
          }

          prevStatuses.current[orderId] = newStatus;
        },
        err => {
          console.error(`[Toast] Subscription error for ${orderId}:`, err.message);
        }
      );
    });

    return () => {
      console.log('[Toast] Unsubscribing from', unsubscribes.length, 'orders');
      unsubscribes.forEach(fn => fn());
    };
  }, [showToast]);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PromoBanner />
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/age-verify" element={<AgeGate />} />
        <Route path="/intro" element={<IntroSplash />} />
        <Route path="/why-us" element={<WhyUs />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/track-order" element={<OrderTracking />} />
      </Routes>
      <CartSidebar />
      <CheckoutModal />
      <AdminPanel />
      <SocialProof />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
