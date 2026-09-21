import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, X, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { formatVND, cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/Skeletons';
import type { Coupon } from '@/types';

export function CartPage() {
  const {
    items, updateQuantity, removeFromCart, clearCart,
    cartSubtotal, couponCode, couponDiscount, applyCoupon, removeCoupon,
  } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [validating, setValidating] = useState(false);

  const shippingFee = cartSubtotal >= 500000 ? 0 : 30000;
  const total = cartSubtotal - couponDiscount + shippingFee;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidating(true);
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponInput.toUpperCase())
      .eq('active', true)
      .maybeSingle();

    if (!data) {
      showToast('Mã giảm giá không hợp lệ', 'error');
      setValidating(false);
      return;
    }

    const coupon = data as Coupon;
    if (cartSubtotal < coupon.min_order) {
      showToast(`Đơn hàng tối thiểu ${formatVND(coupon.min_order)} để sử dụng mã này`, 'error');
      setValidating(false);
      return;
    }

    let discount = 0;
    if (coupon.discount_type === 'percent') {
      discount = Math.round((cartSubtotal * coupon.discount_value) / 100);
    } else {
      discount = coupon.discount_value;
    }

    applyCoupon(coupon.code, discount);
    showToast(`Áp dụng mã giảm giá thành công! Giảm ${formatVND(discount)}`, 'success');
    setCouponInput('');
    setValidating(false);
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-16">
        <EmptyState
          icon={<ShoppingBag size={28} />}
          title="Giỏ hàng trống"
          description="Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm công nghệ tuyệt vời của chúng tôi!"
          action={<Link to="/products" className="btn-primary">Mua sắm ngay</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-custom py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-neutral-900">Giỏ hàng</h1>
      <p className="mt-1 text-sm text-neutral-500">{items.length} sản phẩm trong giỏ hàng</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const price = item.product.sale_price ?? item.product.price;
            return (
              <div
                key={`${item.product.id}-${item.selectedColor || ''}-${item.selectedStorage || ''}`}
                className="card p-4 flex gap-4"
              >
                <Link to={`/product/${item.product.slug}`} className="shrink-0">
                  <div className="h-24 w-24 overflow-hidden rounded-lg bg-neutral-50">
                    <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                  </div>
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-medium text-blue-600">{item.product.brand}</span>
                      <Link to={`/product/${item.product.slug}`}>
                        <h3 className="text-sm font-semibold text-neutral-900 hover:text-blue-600 transition-colors line-clamp-2">{item.product.name}</h3>
                      </Link>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedStorage)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-500">
                    {item.selectedColor && <span>Màu: {item.selectedColor}</span>}
                    {item.selectedRam && <span>RAM: {item.selectedRam}</span>}
                    {item.selectedStorage && <span>Lưu trữ: {item.selectedStorage}</span>}
                    {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                  </div>

                  <div className="mt-auto flex items-end justify-between pt-2">
                    <div className="flex items-center rounded-lg border border-neutral-300">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedColor, item.selectedStorage)}
                        className="flex h-8 w-8 items-center justify-center text-neutral-600 hover:bg-neutral-50 rounded-l-lg"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedColor, item.selectedStorage)}
                        className="flex h-8 w-8 items-center justify-center text-neutral-600 hover:bg-neutral-50 rounded-r-lg"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-neutral-900">{formatVND(price * item.quantity)}</p>
                      {item.product.sale_price && (
                        <p className="text-xs text-neutral-400 line-through">{formatVND(item.product.price * item.quantity)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between pt-2">
            <button onClick={clearCart} className="text-sm text-neutral-500 hover:text-red-500 transition-colors">
              Xóa tất cả
            </button>
            <Link to="/products" className="text-sm font-medium text-blue-600 hover:underline">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-5">
            <h2 className="text-lg font-bold text-neutral-900">Tóm tắt đơn hàng</h2>

            {/* Coupon */}
            <div className="mt-4">
              <label className="text-sm font-medium text-neutral-700">Mã giảm giá</label>
              {couponCode ? (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-700">{couponCode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-green-600">-{formatVND(couponDiscount)}</span>
                    <button onClick={removeCoupon} className="text-green-600 hover:text-red-500">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                    className="input-field flex-1 uppercase text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={validating || !couponInput.trim()}
                    className="btn-dark px-4 disabled:opacity-50"
                  >
                    Áp dụng
                  </button>
                </div>
              )}
              <p className="mt-2 text-xs text-neutral-400">Thử: TECHZONE10, SALE20, FREESHIP</p>
            </div>

            {/* Totals */}
            <div className="mt-5 space-y-2.5 border-t border-neutral-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Tạm tính</span>
                <span className="font-medium text-neutral-900">{formatVND(cartSubtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Giảm giá</span>
                  <span className="font-medium text-green-600">-{formatVND(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Phí vận chuyển</span>
                <span className="font-medium text-neutral-900">
                  {shippingFee === 0 ? (
                    <span className="text-green-600">Miễn phí</span>
                  ) : formatVND(shippingFee)}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-neutral-400">
                  Mua thêm {formatVND(500000 - cartSubtotal)} để được miễn phí vận chuyển
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4">
              <span className="text-base font-bold text-neutral-900">Tổng cộng</span>
              <span className="text-xl font-bold text-blue-600">{formatVND(total)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary mt-5 w-full py-3"
            >
              Tiến hành thanh toán <ArrowRight size={16} />
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
              <Truck size={14} /> Giao hàng toàn quốc
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
