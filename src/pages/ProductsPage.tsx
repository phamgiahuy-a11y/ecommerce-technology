import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, Search, PackageSearch } from 'lucide-react';
import { useProducts, useBrands, useCategories } from '@/hooks/useData';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductGridSkeleton, EmptyState, Spinner } from '@/components/ui/Skeletons';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Phổ biến nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá: Thấp đến cao' },
  { value: 'price-desc', label: 'Giá: Cao đến thấp' },
];

const PRICE_RANGES = [
  { label: 'Dưới 2 triệu', min: 0, max: 2000000 },
  { label: '2 - 5 triệu', min: 2000000, max: 5000000 },
  { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
  { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
  { label: '20 - 50 triệu', min: 20000000, max: 50000000 },
  { label: 'Trên 50 triệu', min: 50000000, max: 100000000 },
];

const RATING_OPTIONS = [
  { value: 4.5, label: 'Từ 4.5 sao' },
  { value: 4, label: 'Từ 4 sao' },
  { value: 3, label: 'Từ 3 sao' },
];

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useCategories();
  const { brands } = useBrands();

  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const brand = searchParams.get('brand') || 'all';
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined;
  const sort = (searchParams.get('sort') as 'price-asc' | 'price-desc' | 'popularity' | 'newest') || 'popularity';

  const filters = useMemo(() => ({
    category, brand, search, minPrice, maxPrice, minRating, sort,
  }), [category, brand, search, minPrice, maxPrice, minRating, sort]);

  const { products, loading } = useProducts(filters);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const setPriceRange = (min: number, max: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('minPrice', String(min));
    next.set('maxPrice', String(max));
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeFilterCount = [
    category !== 'all', brand !== 'all', minPrice !== undefined,
    minRating !== undefined, search !== '',
  ].filter(Boolean).length;

  const currentCategoryName = categories.find((c) => c.slug === category)?.name || 'Tất cả sản phẩm';

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="container-custom py-6">
          <nav className="flex items-center gap-2 text-xs text-neutral-500">
            <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">{currentCategoryName}</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">{currentCategoryName}</h1>
          {search && <p className="mt-1 text-sm text-neutral-500">Kết quả tìm kiếm cho: "<span className="font-medium text-neutral-700">{search}</span>"</p>}
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="flex gap-6">
          {/* Sidebar filters - desktop */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <FilterPanel
              categories={categories}
              brands={brands}
              category={category}
              brand={brand}
              minPrice={minPrice}
              maxPrice={maxPrice}
              minRating={minRating}
              updateParam={updateParam}
              setPriceRange={setPriceRange}
              clearFilters={clearFilters}
              activeFilterCount={activeFilterCount}
            />
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(true)}
                  className="flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 lg:hidden"
                >
                  <SlidersHorizontal size={16} /> Lọc
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">{activeFilterCount}</span>
                  )}
                </button>
                <p className="text-sm text-neutral-500">
                  {loading ? 'Đang tải...' : `${products.length} sản phẩm`}
                </p>
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Sắp xếp: {SORT_OPTIONS.find((s) => s.value === sort)?.label}
                  <ChevronDown size={15} className={cn('transition-transform', sortOpen && 'rotate-180')} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-11 z-20 w-52 rounded-xl border border-neutral-200 bg-white py-1.5 shadow-xl animate-scale-in">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { updateParam('sort', opt.value); setSortOpen(false); }}
                        className={cn(
                          'block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-neutral-50',
                          sort === opt.value ? 'font-semibold text-blue-600' : 'text-neutral-700'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <ProductGridSkeleton count={9} />
            ) : products.length === 0 ? (
              <EmptyState
                icon={<PackageSearch size={28} />}
                title="Không tìm thấy sản phẩm"
                description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm sản phẩm."
                action={
                  <button onClick={clearFilters} className="btn-primary">
                    Xóa tất cả bộ lọc
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-5 animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Bộ lọc</h3>
              <button onClick={() => setShowFilters(false)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-neutral-100">
                <X size={20} />
              </button>
            </div>
            <FilterPanel
              categories={categories}
              brands={brands}
              category={category}
              brand={brand}
              minPrice={minPrice}
              maxPrice={maxPrice}
              minRating={minRating}
              updateParam={updateParam}
              setPriceRange={setPriceRange}
              clearFilters={clearFilters}
              activeFilterCount={activeFilterCount}
            />
            <button onClick={() => setShowFilters(false)} className="btn-primary mt-4 w-full">
              Xem {products.length} sản phẩm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({
  categories, brands, category, brand, minPrice, maxPrice, minRating,
  updateParam, setPriceRange, clearFilters, activeFilterCount,
}: {
  categories: { id: string; name: string; slug: string }[];
  brands: string[];
  category: string;
  brand: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  updateParam: (key: string, value: string | null) => void;
  setPriceRange: (min: number, max: number) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}) {
  const currentPriceRange = PRICE_RANGES.find((r) => r.min === minPrice && r.max === maxPrice);

  return (
    <div className="space-y-6">
      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
          <X size={15} /> Xóa tất cả bộ lọc
        </button>
      )}

      {/* Category */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-neutral-900">Danh mục</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateParam('category', null)}
            className={cn(
              'block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
              category === 'all' ? 'bg-blue-50 font-semibold text-blue-600' : 'text-neutral-600 hover:bg-neutral-50'
            )}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug)}
              className={cn(
                'block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                category === cat.slug ? 'bg-blue-50 font-semibold text-blue-600' : 'text-neutral-600 hover:bg-neutral-50'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-neutral-900">Thương hiệu</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateParam('brand', null)}
            className={cn(
              'block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
              brand === 'all' ? 'bg-blue-50 font-semibold text-blue-600' : 'text-neutral-600 hover:bg-neutral-50'
            )}
          >
            Tất cả
          </button>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => updateParam('brand', b)}
              className={cn(
                'block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                brand === b ? 'bg-blue-50 font-semibold text-blue-600' : 'text-neutral-600 hover:bg-neutral-50'
              )}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-neutral-900">Khoảng giá</h3>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => setPriceRange(range.min, range.max)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                currentPriceRange?.label === range.label ? 'bg-blue-50 font-semibold text-blue-600' : 'text-neutral-600 hover:bg-neutral-50'
              )}
            >
              <span className={cn(
                'flex h-4 w-4 items-center justify-center rounded-full border-2',
                currentPriceRange?.label === range.label ? 'border-blue-600' : 'border-neutral-300'
              )}>
                {currentPriceRange?.label === range.label && <span className="h-2 w-2 rounded-full bg-blue-600" />}
              </span>
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-neutral-900">Đánh giá</h3>
        <div className="space-y-1">
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam('minRating', minRating === opt.value ? null : String(opt.value))}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                minRating === opt.value ? 'bg-blue-50 font-semibold text-blue-600' : 'text-neutral-600 hover:bg-neutral-50'
              )}
            >
              <span className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < Math.floor(opt.value) ? 'text-amber-400' : 'text-neutral-200'}>★</span>
                ))}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
