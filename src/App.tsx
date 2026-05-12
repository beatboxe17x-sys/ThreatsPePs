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

  // Listen for order status changes and show toast notifications
  useEffect(() => {
    const myOrderIds: string[] = JSON.parse(localStorage.getItem('ng_my_orders') || '[]');
    if (myOrderIds.length === 0) return;
    if (!db) return;

    const unsubscribes = myOrderIds.slice(0, 10).map(orderId => {
      if (!db) return () => {};
      return onSnapshot(doc(db, 'orders', orderId), snap => {
        if (!snap.exists()) return;
        const data = snap.data();
        const newStatus = data.status as string;
        const oldStatus = prevStatuses.current[orderId];

        if (oldStatus && oldStatus !== newStatus) {
          const statusLabels: Record<string, string> = {
            processing: 'Awaiting Verification',
            confirmed: 'Confirmed - Preparing Order',
            shipped: 'Shipped - On the Way',
            delivered: 'Delivered',
            cancelled: 'Cancelled',
          };
          const label = statusLabels[newStatus] || newStatus;
          showToast(`Order ${orderId} updated: ${label}`, '\uD83D\uDCE6');
        }
        prevStatuses.current[orderId] = newStatus;
      });
    });

    return () => unsubscribes.forEach(fn => fn());
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
