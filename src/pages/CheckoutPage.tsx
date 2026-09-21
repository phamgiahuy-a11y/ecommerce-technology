import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, CreditCard, Wallet, QrCode, MapPin, Check, ChevronRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { formatVND, cn, SHIPPING_METHODS, PAYMENT_METHODS, VIETNAM_CITIES, generateOrderNumber } from '@/lib/utils';
import type { OrderItem } from '@/types';

import type { LucideIcon } from 'lucide-react';

const PAYMENT_ICONS: Record<string, LucideIcon> = {
  Truck, CreditCard, Wallet, QrCode,
};

export function CheckoutPage() {
  const { items, cartSubtotal, couponCode, couponDiscount, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [shippingMethod, setShippingMethod] = useState(SHIPPING_METHODS[0].id);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    address: '',
    city: 'TP. Hồ Chí Minh',
    district: '',
    note: '',
  });

  const shippingFee = SHIPPING_METHODS.find((s) => s.id === shippingMethod)?.fee ?? 30000;
  const freeShipThreshold = cartSubtotal >= 500000;
  const finalShippingFee = freeShipThreshold ? 0 : shippingFee;
  const total = cartSubtotal - couponDiscount + finalShippingFee;

  const updateForm = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handlePlaceOrder = async () => {
    if (!form.full_name.trim() || !form.phone.trim() || !form.address.trim() || !form.email.trim()) {
      showToast('Vui lòng điền đầy đủ thông tin giao hàng', 'error');
      return;
    }

    setPlacing(true);

    const orderItems: OrderItem[] = items.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      product_image: item.product.images[0],
      price: item.product.sale_price ?? item.product.price,
      quantity: item.quantity,
      selected_color: item.selectedColor,
      selected_ram: item.selectedRam,
      selected_storage: item.selectedStorage,
      selected_size: item.selectedSize,
    }));

    const orderNumber = generateOrderNumber();
    const shippingMethodName = SHIPPING_METHODS.find((s) => s.id === shippingMethod)?.name || '';
    const paymentMethodName = PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.name || '';

    const { data, error } = await supabase.from('orders').insert({
      user_id: user?.id,
      order_number: orderNumber,
      status: 'pending',
      customer_name: form.full_name,
      customer_email: form.email,
      customer_phone: form.phone,
      shipping_address: form.address,
      shipping_city: form.city,
      shipping_district: form.district,
      shipping_method: shippingMethodName,
      payment_method: paymentMethodName,
      subtotal: cartSubtotal,
      shipping_fee: finalShippingFee,
      discount: couponDiscount,
      total,
      coupon_code: couponCode,
      items: orderItems,
    }).select().single();

    if (error) {
      showToast('Đặt hàng thất bại. Vui lòng thử lại.', 'error');
      setPlacing(false);
      return;
    }

    clearCart();
    showToast('Đặt hàng thành công!', 'success');
    navigate(`/account?tab=orders&order=${data.order_number}`);
    setPlacing(false);
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center">
          <ShoppingBag size={40} className="text-neutral-300" />
          <h3 className="mt-4 text-lg font-semibold text-neutral-900">Giỏ hàng trống</h3>
          <p className="mt-1 text-sm text-neutral-500">Thêm sản phẩm vào giỏ trước khi thanh toán</p>
          <Link to="/products" className="btn-primary mt-5">Mua sắm ngay</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 animate-fade-in">
      <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link to="/cart" className="hover:text-blue-600">Giỏ hàng</Link>
        <ChevronRight size={14} />
        <span className="text-neutral-900 font-medium">Thanh toán</span>
      </nav>

      <h1 className="text-2xl font-bold text-neutral-900">Thanh toán</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer info */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">1</div>
              <h2 className="text-lg font-bold text-neutral-900">Thông tin khách hàng</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-neutral-700">Họ và tên *</label>
                <input type="text" value={form.full_name} onChange={(e) => updateForm('full_name', e.target.value)} className="input-field mt-1" placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Số điện thoại *</label>
                <input type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} className="input-field mt-1" placeholder="0901 234 567" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-neutral-700">Email *</label>
                <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} className="input-field mt-1" placeholder="email@example.com" />
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">2</div>
              <h2 className="text-lg font-bold text-neutral-900">Địa chỉ giao hàng</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-neutral-700">Địa chỉ chi tiết *</label>
                <input type="text" value={form.address} onChange={(e) => updateForm('address', e.target.value)} className="input-field mt-1" placeholder="Số nhà, tên đường" />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Tỉnh / Thành phố *</label>
                <select value={form.city} onChange={(e) => updateForm('city', e.target.value)} className="input-field mt-1">
                  {VIETNAM_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Quận / Huyện</label>
                <input type="text" value={form.district} onChange={(e) => updateForm('district', e.target.value)} className="input-field mt-1" placeholder="Quận 1" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-neutral-700">Ghi chú (tùy chọn)</label>
                <textarea value={form.note} onChange={(e) => updateForm('note', e.target.value)} className="input-field mt-1" rows={2} placeholder="Ghi chú cho đơn hàng..." />
              </div>
            </div>
          </div>

          {/* Shipping method */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">3</div>
              <h2 className="text-lg font-bold text-neutral-900">Phương thức vận chuyển</h2>
            </div>
            <div className="space-y-2">
              {SHIPPING_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-all',
                    shippingMethod === method.id ? 'border-blue-600 bg-blue-50' : 'border-neutral-200 hover:border-neutral-300'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" checked={shippingMethod === method.id} onChange={() => setShippingMethod(method.id)} className="text-blue-600" />
                    <Truck size={18} className="text-neutral-600" />
                    <span className="text-sm font-medium text-neutral-900">{method.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">
                    {freeShipThreshold && method.id === 'standard' ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : formatVND(method.fee)}
                  </span>
                </label>
              ))}
              {freeShipThreshold && (
                <p className="text-xs text-green-600">Đơn hàng trên 500.000₫ được miễn phí giao hàng tiêu chuẩn</p>
              )}
            </div>
          </div>

          {/* Payment method */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">4</div>
              <h2 className="text-lg font-bold text-neutral-900">Phương thức thanh toán</h2>
            </div>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => {
                const Icon = PAYMENT_ICONS[method.icon] || CreditCard;
                return (
                  <label
                    key={method.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all',
                      paymentMethod === method.id ? 'border-blue-600 bg-blue-50' : 'border-neutral-200 hover:border-neutral-300'
                    )}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="text-blue-600" />
                    <Icon size={18} />
                    <span className="text-sm font-medium text-neutral-900">{method.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Order summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-5">
            <h2 className="text-lg font-bold text-neutral-900">Đơn hàng của bạn</h2>

            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
              {items.map((item) => {
                const price = item.product.sale_price ?? item.product.price;
                return (
                  <div key={`${item.product.id}-${item.selectedColor || ''}-${item.selectedStorage || ''}`} className="flex gap-3">
                    <div className="relative shrink-0">
                      <div className="h-16 w-16 overflow-hidden rounded-lg bg-neutral-50">
                        <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                      </div>
                      <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-900 line-clamp-2">{item.product.name}</p>
                      {item.selectedColor && <p className="text-xs text-neutral-500">{item.selectedColor}</p>}
                      {item.selectedStorage && <p className="text-xs text-neutral-500">{item.selectedStorage}</p>}
                      <p className="text-xs font-medium text-neutral-700 mt-0.5">{formatVND(price * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Tạm tính</span>
                <span className="font-medium">{formatVND(cartSubtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600">Giảm giá ({couponCode})</span>
                  <span className="font-medium text-green-600">-{formatVND(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-600">Phí vận chuyển</span>
                <span className="font-medium">{finalShippingFee === 0 ? <span className="text-green-600">Miễn phí</span> : formatVND(finalShippingFee)}</span>
              </div>
            </div>

            <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4">
              <span className="text-base font-bold text-neutral-900">Tổng cộng</span>
              <span className="text-xl font-bold text-blue-600">{formatVND(total)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="btn-primary mt-5 w-full py-3 disabled:opacity-60"
            >
              {placing ? 'Đang đặt hàng...' : 'Đặt hàng'}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
              <MapPin size={12} /> Giao hàng đến {form.city || 'Việt Nam'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
