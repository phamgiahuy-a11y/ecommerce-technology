import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, Zap, Smartphone, Laptop, Tablet, Gamepad2, Headphones, LogOut, Package, LayoutDashboard } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCategories } from '@/hooks/useData';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  Smartphone, Laptop, Tablet, Gamepad2, Headphones,
};

export function Header() {
  const { cartCount } = useCart();
  const { user, profile, signOut, isAdmin } = useAuth();
  const { wishlistIds } = useWishlist();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-neutral-900 text-neutral-300 text-xs">
        <div className="container-custom flex h-9 items-center justify-between">
          <p className="hidden sm:block">Giao hàng miễn phí cho đơn từ 500.000₫</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Zap size={12} className="text-blue-400" />
              Hotline: 1900 6789
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container-custom">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg">
                T
              </div>
              <span className="text-xl font-bold tracking-tight text-neutral-900">
                TECH<span className="text-blue-600">ZONE</span>
              </span>
            </Link>

            {/* Search bar - desktop */}
            <form onSubmit={handleSearch} className="hidden flex-1 max-w-2xl md:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                  className="w-full rounded-full border border-neutral-300 bg-neutral-50 py-2.5 pl-5 pr-12 text-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
                >
                  <Search size={16} />
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/wishlist"
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                <Heart size={22} />
                {wishlistIds.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              <div ref={userMenuRef} className="relative">
                {user ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex h-10 items-center gap-1.5 rounded-lg px-2 text-neutral-700 transition-colors hover:bg-neutral-100"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        {(profile?.full_name || user.email)[0].toUpperCase()}
                      </div>
                      <ChevronDown size={14} className="hidden sm:block" />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-12 w-56 rounded-xl border border-neutral-200 bg-white py-2 shadow-xl animate-scale-in">
                        <div className="px-4 py-2 border-b border-neutral-100">
                          <p className="text-sm font-semibold text-neutral-900 truncate">{profile?.full_name || 'Người dùng'}</p>
                          <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                        </div>
                        <Link to="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                          <User size={16} /> Tài khoản của tôi
                        </Link>
                        <Link to="/account?tab=orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                          <Package size={16} /> Đơn hàng
                        </Link>
                        <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                          <Heart size={16} /> Yêu thích
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50">
                            <LayoutDashboard size={16} /> Quản trị
                          </Link>
                        )}
                        <div className="my-1 border-t border-neutral-100" />
                        <button
                          onClick={() => signOut()}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut size={16} /> Đăng xuất
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 sm:px-4"
                  >
                    <User size={18} />
                    <span className="hidden sm:inline">Đăng nhập</span>
                  </Link>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100 lg:hidden"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Category nav - desktop */}
          <nav className="hidden h-12 items-center gap-1 lg:flex">
            <Link
              to="/products"
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                location.pathname === '/products' ? 'text-blue-600' : 'text-neutral-700 hover:bg-neutral-100'
              )}
            >
              <Menu size={16} /> Tất cả sản phẩm
            </Link>
            {categories.map((cat) => {
              const Icon = ICON_MAP[cat.icon || ''] || Smartphone;
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    location.search === `?category=${cat.slug}` ? 'text-blue-600' : 'text-neutral-700 hover:bg-neutral-100'
                  )}
                >
                  <Icon size={16} /> {cat.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-neutral-200 bg-white lg:hidden animate-slide-up">
            <div className="container-custom py-4 space-y-3">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2.5 pl-4 pr-10 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button type="submit" className="absolute right-2 top-2 text-neutral-500">
                  <Search size={18} />
                </button>
              </form>
              <Link to="/products" className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-100">
                Tất cả sản phẩm
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
