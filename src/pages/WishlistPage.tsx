import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ui/ProductCard';
import { EmptyState, Spinner } from '@/components/ui/Skeletons';
import type { Product } from '@/types';

export function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistIds.length === 0) { setProducts([]); setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', wishlistIds);
      setProducts(data || []);
      setLoading(false);
    })();
  }, [wishlistIds]);

  return (
    <div className="container-custom py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-neutral-900">Danh sách yêu thích</h1>
      <p className="mt-1 text-sm text-neutral-500">{wishlistIds.length} sản phẩm đã lưu</p>

      <div className="mt-6">
        {loading ? (
          <Spinner size={32} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Heart size={28} />}
            title="Danh sách yêu thích trống"
            description="Hãy lưu những sản phẩm bạn thích để theo dõi và mua sắm dễ dàng hơn"
            action={<Link to="/products" className="btn-primary">Khám phá sản phẩm</Link>}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
