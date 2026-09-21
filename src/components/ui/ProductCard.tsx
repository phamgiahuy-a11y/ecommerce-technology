import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '@/types';
import { formatVND, discountPercent, cn } from '@/lib/utils';
import { StarRating } from './StarRating';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const salePrice = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discount = hasDiscount ? discountPercent(product.price, product.sale_price!) : 0;
  const inWishlist = isInWishlist(product.id);
  const outOfStock = product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) {
      showToast('Sản phẩm hiện hết hàng', 'error');
      return;
    }
    addToCart(product, 1, {
      selectedColor: product.variants.colors?.[0]?.name,
      selectedStorage: product.variants.storage?.[0],
    });
    showToast('Đã thêm vào giỏ hàng', 'success');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group card overflow-hidden hover:shadow-xl hover:border-neutral-300 flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-50">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className={cn(
            'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
            outOfStock && 'opacity-60'
          )}
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="badge bg-red-500 text-white shadow-sm">-{discount}%</span>
          )}
          {product.is_new_arrival && (
            <span className="badge bg-blue-600 text-white shadow-sm">MỚI</span>
          )}
          {product.is_best_seller && (
            <span className="badge bg-amber-500 text-white shadow-sm">BÁN CHẠY</span>
          )}
        </div>
        <button
          onClick={handleWishlist}
          className={cn(
            'absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full transition-all',
            inWishlist
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white/90 text-neutral-600 hover:bg-white hover:text-red-500 shadow-sm'
          )}
          aria-label="Thêm vào yêu thích"
        >
          <Heart size={17} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-lg bg-neutral-900/80 px-4 py-2 text-sm font-semibold text-white">
              Hết hàng
            </span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 flex translate-y-full gap-1 p-2 transition-transform duration-300 group-hover:translate-y-0">
          <button
            onClick={handleQuickAdd}
            disabled={outOfStock}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-neutral-400"
          >
            <ShoppingCart size={14} /> Thêm vào giỏ
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-neutral-700 shadow">
            <Eye size={15} />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <span className="text-xs font-medium text-blue-600">{product.brand}</span>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-neutral-900 leading-snug group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-1.5">
          <StarRating rating={product.rating} size={13} />
          <span className="text-xs text-neutral-500">({product.review_count})</span>
        </div>
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-neutral-900">{formatVND(salePrice)}</span>
            {hasDiscount && (
              <span className="text-xs text-neutral-400 line-through">{formatVND(product.price)}</span>
            )}
          </div>
          {product.sold_count > 0 && (
            <p className="mt-1 text-xs text-neutral-500">Đã bán {product.sold_count.toLocaleString('vi-VN')}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
