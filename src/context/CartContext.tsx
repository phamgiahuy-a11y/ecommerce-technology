import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem, Product } from '@/types';

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, options?: {
    selectedColor?: string; selectedRam?: string; selectedStorage?: string; selectedSize?: string;
  }) => void;
  removeFromCart: (productId: string, selectedColor?: string, selectedStorage?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string, selectedStorage?: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  couponCode: string | null;
  couponDiscount: number;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_KEY = 'techzone_cart';
const COUPON_KEY = 'techzone_coupon';

interface StoredCoupon {
  code: string;
  discount: number;
}

function getItemKey(productId: string, selectedColor?: string, selectedStorage?: string): string {
  return `${productId}-${selectedColor || ''}-${selectedStorage || ''}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) setItems(JSON.parse(stored));
      const coupon = localStorage.getItem(COUPON_KEY);
      if (coupon) {
        const parsed: StoredCoupon = JSON.parse(coupon);
        setCouponCode(parsed.code);
        setCouponDiscount(parsed.discount);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (couponCode && couponDiscount > 0) {
      localStorage.setItem(COUPON_KEY, JSON.stringify({ code: couponCode, discount: couponDiscount }));
    } else {
      localStorage.removeItem(COUPON_KEY);
    }
  }, [couponCode, couponDiscount]);

  const addToCart = useCallback((product: Product, quantity = 1, options?: {
    selectedColor?: string; selectedRam?: string; selectedStorage?: string; selectedSize?: string;
  }) => {
    setItems((prev) => {
      const key = getItemKey(product.id, options?.selectedColor, options?.selectedStorage);
      const existing = prev.find((item) =>
        getItemKey(item.product.id, item.selectedColor, item.selectedStorage) === key
      );
      if (existing) {
        return prev.map((item) =>
          getItemKey(item.product.id, item.selectedColor, item.selectedStorage) === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        product,
        quantity,
        selectedColor: options?.selectedColor,
        selectedRam: options?.selectedRam,
        selectedStorage: options?.selectedStorage,
        selectedSize: options?.selectedSize,
      }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, selectedColor?: string, selectedStorage?: string) => {
    const key = getItemKey(productId, selectedColor, selectedStorage);
    setItems((prev) => prev.filter((item) =>
      getItemKey(item.product.id, item.selectedColor, item.selectedStorage) !== key
    ));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, selectedColor?: string, selectedStorage?: string) => {
    if (quantity < 1) return;
    const key = getItemKey(productId, selectedColor, selectedStorage);
    setItems((prev) => prev.map((item) =>
      getItemKey(item.product.id, item.selectedColor, item.selectedStorage) === key
        ? { ...item, quantity }
        : item
    ));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCouponCode(null);
    setCouponDiscount(0);
  }, []);

  const applyCoupon = useCallback((code: string, discount: number) => {
    setCouponCode(code);
    setCouponDiscount(discount);
  }, []);

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
    setCouponDiscount(0);
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = items.reduce((sum, item) => {
    const price = item.product.sale_price ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, cartSubtotal, couponCode, couponDiscount, applyCoupon, removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
