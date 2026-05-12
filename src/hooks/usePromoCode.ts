import { useState, useCallback } from 'react';

const PROMO_CODE = 'PEP26';
const PROMO_DISCOUNT = 0.25; // 25%
const STORAGE_KEY = 'ng_promo_used';

export interface PromoState {
  code: string;
  discount: number; // 0 to 1
  applied: boolean;
  error: string;
}

export function usePromoCode() {
  const [promo, setPromo] = useState<PromoState>({
    code: '',
    discount: 0,
    applied: false,
    error: '',
  });

  const hasPromoBeenUsed = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }, []);

  const applyPromoCode = useCallback((inputCode: string): boolean => {
    const alreadyUsed = hasPromoBeenUsed();
    if (alreadyUsed) {
      setPromo(prev => ({ ...prev, error: 'Promo code already used on this device', applied: false }));
      return false;
    }

    if (inputCode.trim().toUpperCase() !== PROMO_CODE) {
      setPromo(prev => ({ ...prev, error: 'Invalid promo code', applied: false }));
      return false;
    }

    setPromo({
      code: PROMO_CODE,
      discount: PROMO_DISCOUNT,
      applied: true,
      error: '',
    });
    return true;
  }, [hasPromoBeenUsed]);

  const markPromoUsed = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const removePromo = useCallback(() => {
    setPromo({ code: '', discount: 0, applied: false, error: '' });
  }, []);

  const getDiscountedTotal = useCallback((subtotal: number): number => {
    if (!promo.applied) return subtotal;
    return subtotal * (1 - promo.discount);
  }, [promo.applied, promo.discount]);

  const getDiscountAmount = useCallback((subtotal: number): number => {
    if (!promo.applied) return 0;
    return subtotal * promo.discount;
  }, [promo.applied, promo.discount]);

  return {
    promo,
    applyPromoCode,
    markPromoUsed,
    removePromo,
    getDiscountedTotal,
    getDiscountAmount,
    hasPromoBeenUsed,
  };
}
