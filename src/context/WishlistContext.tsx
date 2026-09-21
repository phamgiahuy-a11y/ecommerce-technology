import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistContextValue {
  wishlistIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

const LOCAL_KEY = 'techzone_wishlist_local';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      const local = localStorage.getItem(LOCAL_KEY);
      if (local) {
        try { setWishlistIds(JSON.parse(local)); } catch { setWishlistIds([]); }
      } else {
        setWishlistIds([]);
      }
      return;
    }

    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id);
      setWishlistIds((data || []).map((w) => w.product_id));
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(wishlistIds));
    }
  }, [wishlistIds, user]);

  const isInWishlist = useCallback((productId: string) => wishlistIds.includes(productId), [wishlistIds]);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (wishlistIds.includes(productId)) {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      if (user) {
        await supabase.from('wishlist').delete()
          .eq('user_id', user.id).eq('product_id', productId);
      }
      showToast('Đã xóa khỏi danh sách yêu thích', 'info');
    } else {
      setWishlistIds((prev) => [...prev, productId]);
      if (user) {
        await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId });
      }
      showToast('Đã thêm vào danh sách yêu thích', 'success');
    }
  }, [wishlistIds, user, showToast]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, isInWishlist, toggleWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
