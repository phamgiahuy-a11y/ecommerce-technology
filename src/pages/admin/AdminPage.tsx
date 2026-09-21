import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, LogOut,
  TrendingUp, DollarSign, Clock, ChevronRight, Plus, Edit2, Trash2,
  X, Search, ArrowLeft, Menu
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { formatVND, formatDate, cn, ORDER_STATUS_LABELS } from '@/lib/utils';
import { Spinner, EmptyState } from '@/components/ui/Skeletons';
import type { Product, Order, Category } from '@/types';

type AdminTab = 'overview' | 'products' | 'orders' | 'customers';

export function AdminPage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { key: 'overview' as AdminTab, label: 'Tổng quan', icon: LayoutDashboard },
    { key: 'products' as AdminTab, label: 'Sản phẩm', icon: Package },
    { key: 'orders' as AdminTab, label: 'Đơn hàng', icon: ShoppingCart },
    { key: 'customers' as AdminTab, label: 'Khách hàng', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 bg-neutral-900 text-white transition-transform',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex h-16 items-center gap-2 border-b border-neutral-800 px-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">T</div>
            <span className="text-lg font-bold">TECH<span className="text-blue-500">ZONE</span></span>
          </Link>
        </div>

        <div className="px-3 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
              {(profile?.full_name || 'A')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs text-neutral-400">Quản trị viên</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setTab(item.key); setSidebarOpen(false); }}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                tab === item.key ? 'bg-blue-600 text-white' : 'text-neutral-300 hover:bg-neutral-800'
              )}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-neutral-800">
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors">
            <ArrowLeft size={18} /> Về cửa hàng
          </Link>
          <button onClick={() => signOut()} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-neutral-800 transition-colors">
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu size={22} />
            </button>
            <h1 className="text-lg font-bold text-neutral-900">
              {menuItems.find((m) => m.key === tab)?.label}
            </h1>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {tab === 'overview' && <OverviewTab />}
          {tab === 'products' && <ProductsTab />}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'customers' && <CustomersTab />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState({
    revenue: 0, orders: 0, products: 0, customers: 0, pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [ordersRes, productsRes, profilesRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('sold_count', { ascending: false }).limit(5),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);

      const orders = ordersRes.data || [];
      const revenue = orders.reduce((sum, o) => sum + o.total, 0);
      const pending = orders.filter((o) => o.status === 'pending').length;

      setStats({
        revenue,
        orders: orders.length,
        products: (productsRes.data || []).length,
        customers: profilesRes.count || 0,
        pendingOrders: pending,
      });
      setRecentOrders(orders.slice(0, 5));
      setTopProducts(productsRes.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner size={32} />;

  const statCards = [
    { label: 'Tổng doanh thu', value: formatVND(stats.revenue), icon: DollarSign, color: 'bg-green-500' },
    { label: 'Tổng đơn hàng', value: stats.orders.toString(), icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Sản phẩm', value: stats.products.toString(), icon: Package, color: 'bg-amber-500' },
    { label: 'Khách hàng', value: stats.customers.toString(), icon: Users, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-neutral-900">{card.value}</p>
              </div>
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl text-white', card.color)}>
                <card.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.pendingOrders > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
          <Clock size={20} className="text-amber-600" />
          <p className="text-sm font-medium text-amber-700">
            Có {stats.pendingOrders} đơn hàng đang chờ xác nhận
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-base font-bold text-neutral-900 mb-4">Đơn hàng gần đây</h2>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-neutral-500 py-4 text-center">Chưa có đơn hàng</p>
            ) : recentOrders.map((order) => {
              const status = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.pending;
              return (
                <div key={order.id} className="flex items-center justify-between border-b border-neutral-100 pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{order.order_number}</p>
                    <p className="text-xs text-neutral-500">{order.customer_name} • {formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-900">{formatVND(order.total)}</p>
                    <span className={cn('badge text-xs', status.color)}>{status.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-base font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" /> Sản phẩm bán chạy
          </h2>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3 border-b border-neutral-100 pb-3 last:border-0">
                <span className="text-sm font-bold text-neutral-400 w-5">{i + 1}</span>
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-50">
                  <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate">{product.name}</p>
                  <p className="text-xs text-neutral-500">Đã bán {product.sold_count.toLocaleString('vi-VN')}</p>
                </div>
                <p className="text-sm font-bold text-neutral-900">{formatVND(product.sale_price || product.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsTab() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
    ]);
    setProducts(prodRes.data || []);
    setCategories(catRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { showToast('Xóa sản phẩm thất bại', 'error'); return; }
    showToast('Đã xóa sản phẩm', 'success');
    fetchProducts();
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner size={32} />;

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-2.5 text-neutral-400" />
          <input type="text" placeholder="Tìm sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 py-2" />
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { fetchProducts(); setShowForm(false); setEditing(null); }}
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-semibold text-neutral-500 uppercase">
              <th className="px-4 py-3">Sản phẩm</th>
              <th className="px-4 py-3">Thương hiệu</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Tồn kho</th>
              <th className="px-4 py-3">Đã bán</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-sm text-neutral-500">Không có sản phẩm</td></tr>
            ) : filtered.map((product) => (
              <tr key={product.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-50">
                      <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-sm font-medium text-neutral-900 line-clamp-1 max-w-xs">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">{product.brand}</td>
                <td className="px-4 py-3 text-sm font-medium text-neutral-900">{formatVND(product.sale_price || product.price)}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-sm font-medium', product.stock <= 10 ? 'text-red-600' : 'text-neutral-600')}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">{product.sold_count.toLocaleString('vi-VN')}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => { setEditing(product); setShowForm(true); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-blue-50 hover:text-blue-600">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-red-50 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductForm({ product, categories, onClose, onSaved }: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    brand: product?.brand || '',
    category_id: product?.category_id || categories[0]?.id || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    sale_price: product?.sale_price?.toString() || '',
    stock: product?.stock?.toString() || '0',
    images: product?.images?.join('\n') || '',
    is_featured: product?.is_featured || false,
    is_flash_sale: product?.is_flash_sale || false,
    is_best_seller: product?.is_best_seller || false,
    is_new_arrival: product?.is_new_arrival || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.brand.trim() || !form.price.trim()) {
      showToast('Vui lòng điền tên, thương hiệu và giá', 'error');
      return;
    }

    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const images = form.images.split('\n').map((s) => s.trim()).filter(Boolean);

    const payload = {
      name: form.name,
      slug,
      brand: form.brand,
      category_id: form.category_id || null,
      description: form.description,
      price: Number(form.price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      stock: Number(form.stock) || 0,
      images: images.length > 0 ? images : ['https://images.pexels.com/photos/782687/pexels-photo-782687.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
      is_featured: form.is_featured,
      is_flash_sale: form.is_flash_sale,
      is_best_seller: form.is_best_seller,
      is_new_arrival: form.is_new_arrival,
    };

    setSaving(true);
    if (product) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id);
      setSaving(false);
      if (error) { showToast('Cập nhật thất bại', 'error'); return; }
      showToast('Cập nhật sản phẩm thành công', 'success');
    } else {
      const { error } = await supabase.from('products').insert(payload);
      setSaving(false);
      if (error) { showToast('Thêm sản phẩm thất bại', 'error'); return; }
      showToast('Thêm sản phẩm thành công', 'success');
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-neutral-900">{product ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-neutral-100">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-neutral-700">Tên sản phẩm</label>
            <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input-field mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">Thương hiệu</label>
            <input type="text" value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} className="input-field mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">Danh mục</label>
            <select value={form.category_id} onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))} className="input-field mt-1">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">Giá gốc (VND)</label>
            <input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} className="input-field mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">Giá sale (VND)</label>
            <input type="number" value={form.sale_price} onChange={(e) => setForm((p) => ({ ...p, sale_price: e.target.value }))} className="input-field mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700">Tồn kho</label>
            <input type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} className="input-field mt-1" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-neutral-700">Hình ảnh (mỗi URL trên 1 dòng)</label>
            <textarea value={form.images} onChange={(e) => setForm((p) => ({ ...p, images: e.target.value }))} className="input-field mt-1" rows={3} placeholder="https://..." />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-neutral-700">Mô tả</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="input-field mt-1" rows={3} />
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-4">
            {[
              { key: 'is_featured', label: 'Nổi bật' },
              { key: 'is_flash_sale', label: 'Flash Sale' },
              { key: 'is_best_seller', label: 'Bán chạy' },
              { key: 'is_new_arrival', label: 'Hàng mới' },
            ].map((flag) => (
              <label key={flag.key} className="flex items-center gap-2 text-sm text-neutral-600">
                <input type="checkbox" checked={form[flag.key as keyof typeof form] as boolean} onChange={(e) => setForm((p) => ({ ...p, [flag.key]: e.target.checked }))} className="rounded border-neutral-300 text-blue-600" />
                {flag.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Hủy</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchOrders = useCallback(async () => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { setLoading(true); fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) { showToast('Cập nhật trạng thái thất bại', 'error'); return; }
    showToast('Đã cập nhật trạng thái đơn hàng', 'success');
    fetchOrders();
  };

  const statusFilters = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'shipping', label: 'Đang giao' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'cancelled', label: 'Đã hủy' },
  ];

  if (loading) return <Spinner size={32} />;

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              filter === f.value ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={<ShoppingCart size={28} />} title="Không có đơn hàng" />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.pending;
            return (
              <div key={order.id} className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{order.order_number}</p>
                    <p className="text-xs text-neutral-500">{order.customer_name} • {formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-neutral-900">{formatVND(order.total)}</span>
                    <span className={cn('badge', status.color)}>{status.label}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="h-10 w-10 overflow-hidden rounded-lg border-2 border-white bg-neutral-50">
                          <img src={item.product_image} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-neutral-600">{order.items.length} sản phẩm</span>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="pending">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="shipping">Đang giao</option>
                    <option value="delivered">Đã giao</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CustomersTab() {
  const [profiles, setProfiles] = useState<{ id: string; email: string; full_name: string; phone: string; role: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setProfiles(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner size={32} />;

  return (
    <div className="animate-fade-in">
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-semibold text-neutral-500 uppercase">
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Số điện thoại</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Ngày đăng ký</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-sm text-neutral-500">Chưa có khách hàng</td></tr>
            ) : profiles.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {(p.full_name || p.email)[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-neutral-900">{p.full_name || 'Chưa đặt tên'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">{p.email}</td>
                <td className="px-4 py-3 text-sm text-neutral-600">{p.phone || '—'}</td>
                <td className="px-4 py-3">
                  <span className={cn('badge', p.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-600')}>
                    {p.role === 'admin' ? 'Quản trị' : 'Khách hàng'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-500">{formatDate(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
