import { useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from '@/hooks/useAppContext';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
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
import AuthPage from '@/pages/AuthPage';
import ProfilePage from '@/pages/ProfilePage';
import VerifyPage from '@/pages/VerifyPage';
import AffiliatePage from '@/pages/AffiliatePage';
import LiveChat from '@/components/LiveChat';

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
  // Dynamically subscribes to order docs by ID — works for new orders too
  const activeSubs = useRef<Record<string, () => void>>({});

  useEffect(() => {
    if (!db) return;
    const database = db;

    const statusLabels: Record<string, string> = {
      processing: 'Awaiting Verification',
      confirmed: 'Confirmed - Preparing Order',
      shipped: 'Shipped - On the Way',
      delivered: 'Delivered',
      cancelled: 'Order Cancelled',
    };

    function subscribeToOrder(orderId: string) {
      if (activeSubs.current[orderId]) return; // already subscribed

      const unsub = onSnapshot(
        doc(database, 'orders', orderId),
        snap => {
          if (!snap.exists()) return;
          const data = snap.data();
          const newStatus = data.status as string;
          const oldStatus = prevStatuses.current[orderId];

          if (!oldStatus) {
            prevStatuses.current[orderId] = newStatus;
            console.log(`[Toast] Tracked ${orderId}: ${newStatus}`);
            return;
          }

          if (oldStatus !== newStatus) {
            const label = statusLabels[newStatus] || newStatus;
            console.log(`[Toast] ${orderId}: ${oldStatus} → ${newStatus}`);
            showToast(`Order ${orderId} updated: ${label}`, '\uD83D\uDCE6');
          }
          prevStatuses.current[orderId] = newStatus;
        },
        err => console.error(`[Toast] ${orderId} error:`, err.message)
      );

      activeSubs.current[orderId] = unsub;
    }

    function checkForNewOrders() {
      const newIds: string[] = JSON.parse(localStorage.getItem('ng_order_ids') || '[]');
      const oldIds: string[] = JSON.parse(localStorage.getItem('ng_my_orders') || '[]');
      const allIds = [...new Set([...newIds, ...oldIds])];

      allIds.slice(0, 20).forEach(id => subscribeToOrder(id));
    }

    // Check immediately and every 3 seconds for new orders
    checkForNewOrders();
    const interval = setInterval(checkForNewOrders, 3000);

    return () => {
      clearInterval(interval);
      Object.values(activeSubs.current).forEach(fn => fn());
      activeSubs.current = {};
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
        <Route path="/login" element={<AuthPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/affiliate" element={<AffiliatePage />} />
      </Routes>
      <CartSidebar />
      <CheckoutModal />
      <AdminPanel />
      <SocialProof />
      <Toast />
      <LiveChat />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
