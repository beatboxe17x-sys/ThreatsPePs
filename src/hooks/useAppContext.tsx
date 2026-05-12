import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { Product, CartItem, Crypto, ToastState, ConsentLog } from '@/types';
import { DEFAULT_PRODUCTS, DEFAULT_CRYPTO_ADDRESSES } from '@/types';
import { usePromoCode, type PromoState } from '@/hooks/usePromoCode';
import {
  subscribeToProducts, subscribeToCryptoAddresses, subscribeToOrders, subscribeToConsentLogs,
  saveAllProductsToFirestore, saveCryptoAddressesToFirestore, saveOrderToFirestore,
  saveConsentLogToFirestore, updateConsentLogStatus, deleteConsentLogFromFirestore,
  updateOrderStatus as updateOrderStatusFirestore,
  loadProductsFromFirestore, loadCryptoAddressesFromFirestore,
  type Order,
} from '@/firebase/services';

interface AppContextType {
  cart: CartItem[];
  products: Record<string, Product>;
  cryptoAddresses: Record<Crypto, string>;
  orders: Order[];
  consentLogs: ConsentLog[];
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isAdminOpen: boolean;
  isAdminLoggedIn: boolean;
  toast: ToastState;
  selectedCrypto: Crypto;

  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openAdmin: () => void;
  closeAdmin: () => void;
  adminLogin: (email: string, pass: string) => boolean;
  adminLogout: () => void;
  showToast: (message: string, icon?: string) => void;
  selectCrypto: (crypto: Crypto) => void;
  saveProducts: (products: Record<string, Product>) => void;
  saveCryptoAddresses: (addresses: Record<Crypto, string>) => void;
  saveOrder: (order: Order) => Promise<void>;
  saveConsentLog: (log: ConsentLog) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  updateConsentStatus: (id: string, status: 'active' | 'banned') => Promise<void>;
  deleteConsentLog: (id: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshConsentLogs: () => Promise<void>;
  promo: PromoState;
  applyPromoCode: (code: string) => boolean;
  removePromo: () => void;
  markPromoUsed: () => void;
  getDiscountedTotal: (subtotal: number) => number;
  getDiscountAmount: (subtotal: number) => number;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const promoHook = usePromoCode();

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ng_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [products, setProducts] = useState<Record<string, Product>>(DEFAULT_PRODUCTS);
  const [cryptoAddresses, setCryptoAddresses] = useState<Record<Crypto, string>>(DEFAULT_CRYPTO_ADDRESSES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [consentLogs, setConsentLogs] = useState<ConsentLog[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('ng_admin') === 'true';
  });
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto>('btc');
  const [toast, setToast] = useState<ToastState>({ message: '', icon: '\u2705', visible: false });

  const ordersUnsub = useRef<(() => void) | null>(null);
  const consentsUnsub = useRef<(() => void) | null>(null);

  // Cart persistence
  useEffect(() => {
    localStorage.setItem('ng_cart', JSON.stringify(cart));
  }, [cart]);

  // Firestore subscriptions
  useEffect(() => {
    const unsubProducts = subscribeToProducts(pts => {
      if (Object.keys(pts).length > 0) setProducts(pts);
    });
    const unsubCrypto = subscribeToCryptoAddresses(addrs => {
      if (addrs && Object.keys(addrs).length > 0) setCryptoAddresses(addrs);
    });

    loadProductsFromFirestore().then(pts => {
      if (!pts || Object.keys(pts).length === 0) {
        saveAllProductsToFirestore(DEFAULT_PRODUCTS);
      }
    }).catch(() => {});

    loadCryptoAddressesFromFirestore().then(addrs => {
      if (!addrs || Object.keys(addrs).length === 0) {
        saveCryptoAddressesToFirestore(DEFAULT_CRYPTO_ADDRESSES);
      }
    }).catch(() => {});

    return () => {
      unsubProducts();
      unsubCrypto();
    };
  }, []);

  // Subscribe to orders & consents when admin opens
  useEffect(() => {
    if (isAdminOpen && isAdminLoggedIn) {
      ordersUnsub.current = subscribeToOrders(setOrders);
      consentsUnsub.current = subscribeToConsentLogs(setConsentLogs);
    }
    return () => {
      ordersUnsub.current?.();
      consentsUnsub.current?.();
    };
  }, [isAdminOpen, isAdminLoggedIn]);

  const addToCart = useCallback((id: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id, qty: 1 }];
    });
    showToast(`${products[id]?.name || 'Product'} added to cart!`);
  }, [products]);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty <= 0 ? null : { ...item, qty: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
    document.body.style.overflow = '';
  }, []);

  const openCheckout = useCallback(() => {
    closeCart();
    setIsCheckoutOpen(true);
    document.body.style.overflow = 'hidden';
  }, [closeCart]);

  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
    document.body.style.overflow = '';
  }, []);

  const openAdmin = useCallback(() => {
    setIsAdminOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeAdmin = useCallback(() => {
    setIsAdminOpen(false);
    document.body.style.overflow = '';
  }, []);

  // Simple password login - no Firebase Auth needed
  const adminLogin = useCallback((email: string, pass: string): boolean => {
    // Accept ANY email with the correct password
    if (pass === 'ngadmin2024') {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('ng_admin', 'true');
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdminLoggedIn(false);
    setIsAdminOpen(false);
    sessionStorage.removeItem('ng_admin');
  }, []);

  const showToast = useCallback((message: string, icon = '\u2705') => {
    setToast({ message, icon, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  const selectCrypto = useCallback((crypto: Crypto) => {
    setSelectedCrypto(crypto);
  }, []);

  const saveProducts = useCallback(async (newProducts: Record<string, Product>) => {
    setProducts(newProducts);
    localStorage.setItem('ng_products', JSON.stringify(newProducts));
    try { await saveAllProductsToFirestore(newProducts); } catch (_) {}
  }, []);

  const saveCryptoAddresses = useCallback(async (addresses: Record<Crypto, string>) => {
    setCryptoAddresses(addresses);
    localStorage.setItem('ng_crypto_addresses', JSON.stringify(addresses));
    try { await saveCryptoAddressesToFirestore(addresses); } catch (_) {}
  }, []);

  const saveOrder = useCallback(async (order: Order) => {
    // Generate a unique device ID for this browser (for privacy — only shows this device's orders)
    let deviceId = localStorage.getItem('ng_device_id');
    if (!deviceId) {
      deviceId = 'dev-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem('ng_device_id', deviceId);
    }
    const orderWithDevice = { ...order, deviceId };

    setOrders(prev => [orderWithDevice, ...prev]);
    const myOrders = JSON.parse(localStorage.getItem('ng_my_orders') || '[]');
    myOrders.unshift(order.id);
    localStorage.setItem('ng_my_orders', JSON.stringify(myOrders));
    // Only store this device's orders locally
    const myDeviceOrders = JSON.parse(localStorage.getItem('ng_order_history') || '[]');
    myDeviceOrders.unshift(orderWithDevice);
    localStorage.setItem('ng_order_history', JSON.stringify(myDeviceOrders.slice(0, 100)));
    try { await saveOrderToFirestore(orderWithDevice); } catch (_) {}
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    try { await updateOrderStatusFirestore(id, status); } catch (err) { console.error('Status update failed:', err); }
  }, []);

  const saveConsentLog = useCallback(async (log: ConsentLog) => {
    setConsentLogs(prev => [log, ...prev]);
    try { await saveConsentLogToFirestore(log); } catch (_) {}
  }, []);

  const updateConsentStatus = useCallback(async (id: string, status: 'active' | 'banned') => {
    setConsentLogs(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    try { await updateConsentLogStatus(id, status); } catch (_) {}
  }, []);

  const deleteConsentLog = useCallback(async (id: string) => {
    setConsentLogs(prev => prev.filter(l => l.id !== id));
    try { await deleteConsentLogFromFirestore(id); } catch (_) {}
  }, []);

  const refreshOrders = useCallback(async () => {
    const { loadOrdersFromFirestore } = await import('@/firebase/services');
    try { const os = await loadOrdersFromFirestore(); setOrders(os); } catch (_) {}
  }, []);

  const refreshConsentLogs = useCallback(async () => {
    const { loadConsentLogsFromFirestore } = await import('@/firebase/services');
    try { const ls = await loadConsentLogsFromFirestore(); setConsentLogs(ls); } catch (_) {}
  }, []);

  return (
    <AppContext.Provider
      value={{
        cart, products, cryptoAddresses, orders, consentLogs,
        isCartOpen, isCheckoutOpen, isAdminOpen, isAdminLoggedIn,
        toast, selectedCrypto,
        addToCart, removeFromCart, updateQty, openCart, closeCart,
        openCheckout, closeCheckout, openAdmin, closeAdmin,
        adminLogin, adminLogout, showToast, selectCrypto,
        saveProducts, saveCryptoAddresses, saveOrder, saveConsentLog,
        updateOrderStatus, updateConsentStatus, deleteConsentLog, refreshOrders, refreshConsentLogs,
        promo: promoHook.promo,
        applyPromoCode: promoHook.applyPromoCode,
        removePromo: promoHook.removePromo,
        markPromoUsed: promoHook.markPromoUsed,
        getDiscountedTotal: promoHook.getDiscountedTotal,
        getDiscountAmount: promoHook.getDiscountAmount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
