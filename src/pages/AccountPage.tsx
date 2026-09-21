import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { User, Package, Heart, MapPin, LogOut, Settings, Plus, Trash2, Check, X, ChevronRight, Receipt } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import { supabase } from '@/lib/supabase';
import { formatVND, formatDate, cn, ORDER_STATUS_LABELS, VIETNAM_CITIES } from '@/lib/utils';
import { ProductCard } from '@/components/ui/ProductCard';
import { EmptyState, Spinner } from '@/components/ui/Skeletons';
import type { Order, Address, Product, Profile } from '@/types';

type Tab = 'profile' | 'orders' | 'wishlist' | 'addresses';

export function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as Tab) || 'profile';
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { wishlistIds } = useWishlist();
  const { showToast } = useToast();

  const setTab = (t: Tab) => setSearchParams({ tab: t });

  const menuItems = [
    { key: 'profile' as Tab, label: 'Hồ sơ cá nhân', icon: User },
    { key: 'orders' as Tab, label: 'Lịch sử đơn hàng', icon: Package },
    { key: 'wishlist' as Tab, label: 'Danh sách yêu thích', icon: Heart },
    { key: 'addresses' as Tab, label: 'Sổ địa chỉ', icon: MapPin },
  ];

  return (
    <div className="container-custom py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-neutral-900">Tài khoản của tôi</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="card p-5">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">{profile?.full_name || 'Người dùng'}</p>
                <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
              </div>
            </div>
            <nav className="mt-3 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    tab === item.key ? 'bg-blue-50 text-blue-600' : 'text-neutral-600 hover:bg-neutral-50'
                  )}
                >
                  <item.icon size={18} /> {item.label}
                  {item.key === 'wishlist' && wishlistIds.length > 0 && (
                    <span className="ml-auto text-xs font-semibold text-neutral-400">{wishlistIds.length}</span>
                  )}
                </button>
              ))}
              <button
                onClick={() => signOut()}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut size={18} /> Đăng xuất
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          {tab === 'profile' && <ProfileTab profile={profile} refreshProfile={refreshProfile} />}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'wishlist' && <WishlistTab />}
          {tab === 'addresses' && <AddressesTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ profile, refreshProfile }: { profile: Profile | null; refreshProfile: () => Promise<void> }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name, phone: profile.phone });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, phone: form.phone })
      .eq('id', profile?.id);
    setSaving(false);
    if (error) { showToast('Cập nhật thất bại', 'error'); return; }
    await refreshProfile();
    showToast('Cập nhật hồ sơ thành công', 'success');
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Settings size={20} className="text-blue-600" />
        <h2 className="text-lg font-bold text-neutral-900">Thông tin cá nhân</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-neutral-700">Họ và tên</label>
          <input type="text" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} className="input-field mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700">Số điện thoại</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="input-field mt-1" placeholder="0901 234 567" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-neutral-700">Email</label>
          <input type="email" value={profile?.email || ''} disabled className="input-field mt-1 bg-neutral-50 text-neutral-500" />
        </div>
      </div>
      <button onClick={handleSave} disabled={saving} className="btn-primary mt-5 disabled:opacity-60">
        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </div>
  );
}

function OrdersTab() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  if (loading) return <Spinner />;

  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package size={28} />}
        title="Chưa có đơn hàng nào"
        description="Bạn chưa đặt đơn hàng nào. Hãy bắt đầu mua sắm ngay!"
        action={<Link to="/products" className="btn-primary">Mua sắm ngay</Link>}
      />
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-neutral-900 mb-4">Lịch sử đơn hàng</h2>
      {orders.map((order) => {
        const status = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.pending;
        return (
          <div key={order.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <p className="text-sm font-bold text-neutral-900">{order.order_number}</p>
                <p className="text-xs text-neutral-500">{formatDate(order.created_at)}</p>
              </div>
              <span className={cn('badge', status.color)}>{status.label}</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex -space-x-2">
                {order.items.slice(0, 3).map((item, i) => (
                  <div key={i} className="h-12 w-12 overflow-hidden rounded-lg border-2 border-white bg-neutral-50">
                    <img src={item.product_image} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-white bg-neutral-100 text-xs font-medium text-neutral-500">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-600">{order.items.length} sản phẩm</p>
                <p className="text-base font-bold text-neutral-900">{formatVND(order.total)}</p>
              </div>
              <button onClick={() => setSelectedOrder(order)} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:gap-2 transition-all">
                Chi tiết <ChevronRight size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderDetail({ order, onBack }: { order: Order; onBack: () => void }) {
  const status = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.pending;
  return (
    <div className="card p-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:gap-2.5 transition-all mb-4">
        <ChevronRight size={15} className="rotate-180" /> Quay lại
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">{order.order_number}</h2>
          <p className="text-sm text-neutral-500">{formatDate(order.created_at)}</p>
        </div>
        <span className={cn('badge px-3 py-1', status.color)}>{status.label}</span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-neutral-50 p-4">
          <h3 className="text-sm font-bold text-neutral-900 mb-2">Thông tin giao hàng</h3>
          <p className="text-sm text-neutral-600">{order.customer_name}</p>
          <p className="text-sm text-neutral-600">{order.customer_phone}</p>
          <p className="text-sm text-neutral-600">{order.shipping_address}</p>
          <p className="text-sm text-neutral-600">{order.shipping_district && `${order.shipping_district}, `}{order.shipping_city}</p>
        </div>
        <div className="rounded-lg bg-neutral-50 p-4">
          <h3 className="text-sm font-bold text-neutral-900 mb-2">Thanh toán & vận chuyển</h3>
          <p className="text-sm text-neutral-600"><span className="text-neutral-400">Vận chuyển:</span> {order.shipping_method}</p>
          <p className="text-sm text-neutral-600"><span className="text-neutral-400">Thanh toán:</span> {order.payment_method}</p>
        </div>
      </div>

      <h3 className="mt-5 text-sm font-bold text-neutral-900">Sản phẩm</h3>
      <div className="mt-2 space-y-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex gap-3 rounded-lg border border-neutral-200 p-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-50">
              <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-900">{item.product_name}</p>
              <div className="flex gap-2 text-xs text-neutral-500">
                {item.selected_color && <span>Màu: {item.selected_color}</span>}
                {item.selected_storage && <span>Lưu trữ: {item.selected_storage}</span>}
                <span>SL: {item.quantity}</span>
              </div>
            </div>
            <p className="text-sm font-bold text-neutral-900">{formatVND(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4 text-sm">
        <div className="flex justify-between"><span className="text-neutral-600">Tạm tính</span><span>{formatVND(order.subtotal)}</span></div>
        {order.discount > 0 && <div className="flex justify-between"><span className="text-green-600">Giảm giá</span><span className="text-green-600">-{formatVND(order.discount)}</span></div>}
        <div className="flex justify-between"><span className="text-neutral-600">Phí vận chuyển</span><span>{order.shipping_fee === 0 ? 'Miễn phí' : formatVND(order.shipping_fee)}</span></div>
        <div className="flex justify-between border-t border-neutral-200 pt-2"><span className="font-bold text-neutral-900">Tổng cộng</span><span className="text-lg font-bold text-blue-600">{formatVND(order.total)}</span></div>
      </div>
    </div>
  );
}

function WishlistTab() {
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

  if (loading) return <Spinner />;

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Heart size={28} />}
        title="Danh sách yêu thích trống"
        description="Lưu những sản phẩm bạn yêu thích để theo dõi dễ dàng hơn"
        action={<Link to="/products" className="btn-primary">Khám phá sản phẩm</Link>}
      />
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-neutral-900 mb-4">Sản phẩm yêu thích ({products.length})</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

function AddressesTab() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', address: '', city: 'TP. Hồ Chí Minh', district: '', is_default: false });

  const fetchAddresses = useCallback(async () => {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user?.id)
      .order('is_default', { ascending: false });
    setAddresses(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const handleAdd = async () => {
    if (!form.full_name.trim() || !form.phone.trim() || !form.address.trim()) {
      showToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }
    const { error } = await supabase.from('addresses').insert({
      user_id: user?.id,
      ...form,
    });
    if (error) { showToast('Thêm địa chỉ thất bại', 'error'); return; }
    showToast('Thêm địa chỉ thành công', 'success');
    setForm({ full_name: '', phone: '', address: '', city: 'TP. Hồ Chí Minh', district: '', is_default: false });
    setShowForm(false);
    fetchAddresses();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id);
    showToast('Đã xóa địa chỉ', 'info');
    fetchAddresses();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-neutral-900">Sổ địa chỉ</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={16} /> Thêm địa chỉ
        </button>
      </div>

      {showForm && (
        <div className="card p-5 mb-4 animate-slide-up">
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="text" placeholder="Họ và tên" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} className="input-field" />
            <input type="tel" placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="input-field" />
            <input type="text" placeholder="Địa chỉ chi tiết" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className="input-field sm:col-span-2" />
            <select value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} className="input-field">
              {VIETNAM_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" placeholder="Quận / Huyện" value={form.district} onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))} className="input-field" />
            <label className="flex items-center gap-2 text-sm text-neutral-600 sm:col-span-2">
              <input type="checkbox" checked={form.is_default} onChange={(e) => setForm((p) => ({ ...p, is_default: e.target.checked }))} className="rounded border-neutral-300 text-blue-600" />
              Đặt làm địa chỉ mặc định
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleAdd} className="btn-primary">Lưu</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
          </div>
        </div>
      )}

      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin size={28} />}
          title="Chưa có địa chỉ nào"
          description="Thêm địa chỉ giao hàng để thanh toán nhanh hơn"
        />
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-neutral-900">{addr.full_name}</p>
                    {addr.is_default && <span className="badge bg-blue-100 text-blue-700">Mặc định</span>}
                  </div>
                  <p className="text-sm text-neutral-600 mt-0.5">{addr.phone}</p>
                  <p className="text-sm text-neutral-600">{addr.address}</p>
                  <p className="text-sm text-neutral-600">{addr.district && `${addr.district}, `}{addr.city}</p>
                </div>
                <button onClick={() => handleDelete(addr.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
