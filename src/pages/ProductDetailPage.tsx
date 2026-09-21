import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingCart, Zap, Minus, Plus, Check, ChevronRight,
  Truck, ShieldCheck, RotateCcw, Star, ArrowLeft
} from 'lucide-react';
import { useProduct, useProductReviews, useRelatedProducts, useCategories } from '@/hooks/useData';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { StarRating } from '@/components/ui/StarRating';
import { ProductCard } from '@/components/ui/ProductCard';
import { Spinner, EmptyState } from '@/components/ui/Skeletons';
import { formatVND, discountPercent, cn, formatDate } from '@/lib/utils';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading } = useProduct(slug || '');
  const { reviews, loading: reviewsLoading } = useProductReviews(product?.id || '');
  const { related, loading: relatedLoading } = useRelatedProducts(product);
  const { categories } = useCategories();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedRam, setSelectedRam] = useState<string | undefined>(undefined);
  const [selectedStorage, setSelectedStorage] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  if (loading) return <div className="container-custom py-20"><Spinner size={32} /></div>;
  if (!product) {
    return (
      <div className="container-custom py-20">
        <EmptyState
          icon={<Star size={28} />}
          title="Không tìm thấy sản phẩm"
          description="Sản phẩm bạn đang tìm có thể đã bị xóa hoặc không tồn tại."
          action={<Link to="/products" className="btn-primary">Quay lại danh sách</Link>}
        />
      </div>
    );
  }

  const salePrice = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discount = hasDiscount ? discountPercent(product.price, product.sale_price!) : 0;
  const outOfStock = product.stock <= 0;
  const inWishlist = isInWishlist(product.id);
  const categoryName = categories.find((c) => c.id === product.category_id)?.name;

  const colors = product.variants.colors || [];
  const ramOptions = product.variants.ram || [];
  const storageOptions = product.variants.storage || [];
  const sizeOptions = product.variants.sizes || [];

  const currentColor = selectedColor || colors[0]?.name;
  const currentRam = selectedRam || ramOptions[0];
  const currentStorage = selectedStorage || storageOptions[0];
  const currentSize = selectedSize || sizeOptions[0];

  const handleAddToCart = () => {
    if (outOfStock) { showToast('Sản phẩm hiện hết hàng', 'error'); return; }
    addToCart(product, quantity, {
      selectedColor: currentColor, selectedRam: currentRam,
      selectedStorage: currentStorage, selectedSize: currentSize,
    });
    showToast('Đã thêm vào giỏ hàng', 'success');
  };

  const handleBuyNow = () => {
    if (outOfStock) { showToast('Sản phẩm hiện hết hàng', 'error'); return; }
    addToCart(product, quantity, {
      selectedColor: currentColor, selectedRam: currentRam,
      selectedStorage: currentStorage, selectedSize: currentSize,
    });
    navigate('/checkout');
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating.toFixed(1);

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-xs text-neutral-500 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
            <ChevronRight size={14} />
            <Link to="/products" className="hover:text-blue-600">Sản phẩm</Link>
            {categoryName && (
              <>
                <ChevronRight size={14} />
                <Link to={`/products?category=${categories.find((c) => c.id === product.category_id)?.slug}`} className="hover:text-blue-600">{categoryName}</Link>
              </>
            )}
            <ChevronRight size={14} />
            <span className="text-neutral-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
              <img src={product.images[selectedImage]} alt={product.name} className="h-full w-full object-cover" />
              {discount > 0 && (
                <span className="absolute top-4 left-4 badge bg-red-500 text-white text-sm px-3 py-1">-{discount}%</span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                      i === selectedImage ? 'border-blue-600' : 'border-neutral-200 hover:border-neutral-300'
                    )}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-blue-600">{product.brand}</span>
            <h1 className="mt-1 text-2xl font-bold text-neutral-900 lg:text-3xl">{product.name}</h1>

            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={product.rating} size={18} />
              <span className="text-sm text-neutral-600">{avgRating}</span>
              <span className="text-sm text-neutral-400">|</span>
              <button onClick={() => setActiveTab('reviews')} className="text-sm text-neutral-600 hover:text-blue-600">
                {product.review_count} đánh giá
              </button>
              <span className="text-sm text-neutral-400">|</span>
              <span className="text-sm text-neutral-600">Đã bán {product.sold_count.toLocaleString('vi-VN')}</span>
            </div>

            {/* Price */}
            <div className="mt-5 rounded-xl bg-neutral-50 p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-neutral-900">{formatVND(salePrice)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-neutral-400 line-through">{formatVND(product.price)}</span>
                    <span className="badge bg-red-100 text-red-600">Tiết kiệm {formatVND(product.price - product.sale_price!)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Stock status */}
            <div className="mt-4">
              {outOfStock ? (
                <span className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Hết hàng
                </span>
              ) : product.stock <= 10 ? (
                <span className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-600">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Còn {product.stock} sản phẩm
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600">
                  <Check size={15} /> Còn hàng
                </span>
              )}
            </div>

            {/* Variants */}
            <div className="mt-5 space-y-4">
              {colors.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-neutral-900">Màu sắc: <span className="font-normal text-neutral-600">{currentColor}</span></label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm transition-all',
                          currentColor === color.name ? 'border-blue-600 bg-blue-50' : 'border-neutral-200 hover:border-neutral-300'
                        )}
                      >
                        <span className="h-5 w-5 rounded-full border border-neutral-300" style={{ backgroundColor: color.hex }} />
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {ramOptions.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-neutral-900">RAM:</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ramOptions.map((ram) => (
                      <button
                        key={ram}
                        onClick={() => setSelectedRam(ram)}
                        className={cn(
                          'rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all',
                          currentRam === ram ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                        )}
                      >
                        {ram}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {storageOptions.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-neutral-900">Lưu trữ:</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {storageOptions.map((storage) => (
                      <button
                        key={storage}
                        onClick={() => setSelectedStorage(storage)}
                        className={cn(
                          'rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all',
                          currentStorage === storage ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                        )}
                      >
                        {storage}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sizeOptions.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-neutral-900">Kích thước:</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          'rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all',
                          currentSize === size ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="mt-5">
              <label className="text-sm font-semibold text-neutral-900">Số lượng:</label>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-neutral-300">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center text-neutral-600 hover:bg-neutral-50 rounded-l-lg"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="flex h-10 w-10 items-center justify-center text-neutral-600 hover:bg-neutral-50 rounded-r-lg"
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-sm text-neutral-500">{formatVND(salePrice * quantity)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-blue-600 bg-white px-5 py-3 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <ShoppingCart size={18} /> Thêm vào giỏ
              </button>
              <button
                onClick={handleBuyNow}
                disabled={outOfStock}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Zap size={18} /> Mua ngay
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all',
                  inWishlist ? 'border-red-500 bg-red-50 text-red-500' : 'border-neutral-300 text-neutral-600 hover:border-red-400 hover:text-red-500'
                )}
              >
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-neutral-200 pt-5">
              {[
                { icon: Truck, text: 'Giao hàng nhanh' },
                { icon: ShieldCheck, text: 'Bảo hành chính hãng' },
                { icon: RotateCcw, text: 'Đổi trả 30 ngày' },
              ].map((item) => (
                <div key={item.text} className="flex flex-col items-center gap-1.5 text-center">
                  <item.icon size={20} className="text-blue-600" />
                  <span className="text-xs text-neutral-600">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="flex gap-1 border-b border-neutral-200">
            {[
              { key: 'description', label: 'Mô tả sản phẩm' },
              { key: 'specs', label: 'Thông số kỹ thuật' },
              { key: 'reviews', label: `Đánh giá (${reviews.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={cn(
                  'relative px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.key ? 'text-blue-600' : 'text-neutral-500 hover:text-neutral-700'
                )}
              >
                {tab.label}
                {activeTab === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600" />}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed text-neutral-700">{product.description}</p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="overflow-hidden rounded-xl border border-neutral-200">
                <table className="w-full">
                  <tbody>
                    {product.specifications.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-neutral-50' : 'bg-white'}>
                        <td className="w-1/3 px-4 py-3 text-sm font-medium text-neutral-900">{spec.label}</td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {/* Rating summary */}
                <div className="mb-6 flex items-center gap-8 rounded-xl bg-neutral-50 p-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-neutral-900">{avgRating}</p>
                    <StarRating rating={Number(avgRating)} size={16} className="mt-2 justify-center" />
                    <p className="mt-1 text-xs text-neutral-500">{reviews.length} đánh giá</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r) => r.rating === star).length;
                      const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="flex w-12 items-center gap-0.5 text-xs text-neutral-500">
                            {star} <Star size={11} className="fill-amber-400 text-amber-400" />
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
                            <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="w-8 text-xs text-neutral-500 tabular-nums">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review list */}
                {reviewsLoading ? (
                  <Spinner />
                ) : reviews.length === 0 ? (
                  <p className="py-8 text-center text-sm text-neutral-500">Chưa có đánh giá nào cho sản phẩm này.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="rounded-xl border border-neutral-200 p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                            {review.user_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">{review.user_name}</p>
                            <div className="flex items-center gap-2">
                              <StarRating rating={review.rating} size={12} />
                              <span className="text-xs text-neutral-400">{formatDate(review.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        {review.comment && <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-neutral-900 mb-5">Sản phẩm liên quan</h2>
            {relatedLoading ? (
              <Spinner />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:gap-3 transition-all">
            <ArrowLeft size={16} /> Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
}
