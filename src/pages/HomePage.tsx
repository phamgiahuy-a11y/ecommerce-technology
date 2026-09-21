import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones, Quote } from 'lucide-react';
import { useProducts, useCategories } from '@/hooks/useData';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeletons';
import { StarRating } from '@/components/ui/StarRating';
import { formatVND, discountPercent } from '@/lib/utils';

export function HomePage() {
  const { categories } = useCategories();
  const { products: flashSaleProducts, loading: flashLoading } = useProducts({ flashSale: true, limit: 8 });
  const { products: bestSellers, loading: bestLoading } = useProducts({ bestSeller: true, limit: 8 });
  const { products: newArrivals, loading: newLoading } = useProducts({ newArrival: true, sort: 'newest', limit: 4 });

  return (
    <div className="animate-fade-in">
      <HeroBanner />
      <CategorySection categories={categories} />
      <FlashSaleSection products={flashSaleProducts} loading={flashLoading} />
      <BestSellerSection products={bestSellers} loading={bestLoading} />
      <PromoBanners />
      <NewArrivalsSection products={newArrivals} loading={newLoading} />
      <ReviewsSection />
    </div>
  );
}

function HeroBanner() {
  const slides = [
    {
      title: 'iPhone 15 Pro Max',
      subtitle: 'Viền Titan. Sức mạnh A17 Pro.',
      desc: 'Trải nghiệm đỉnh cao với chip 3nm, camera 48MP và màn hình Super Retina XDR.',
      price: '29.990.000₫',
      oldPrice: '32.990.000₫',
      image: 'https://images.pexels.com/photos/30639091/pexels-photo-30639091.jpeg?auto=compress&cs=tinysrgb&h=800&w=600',
      link: '/product/iphone-15-pro-max-256gb',
      bg: 'from-neutral-900 via-neutral-800 to-neutral-900',
    },
    {
      title: 'MacBook Pro M3 Pro',
      subtitle: 'Sức mạnh không giới hạn.',
      desc: 'Chip M3 Pro, màn hình Liquid Retina XDR, pin 18 giờ. Cho dân sáng tạo.',
      price: '48.990.000₫',
      oldPrice: '52.990.000₫',
      image: 'https://images.pexels.com/photos/943596/pexels-photo-943596.jpeg?auto=compress&cs=tinysrgb&h=800&w=600',
      link: '/product/macbook-pro-14-m3-pro-512gb',
      bg: 'from-blue-900 via-neutral-900 to-neutral-900',
    },
    {
      title: 'PlayStation 5 Slim',
      subtitle: 'Gaming thế hệ mới.',
      desc: 'Đồ họa 4K, SSD siêu nhanh, DualSense. Trải nghiệm game đỉnh cao.',
      price: '11.990.000₫',
      oldPrice: '12.990.000₫',
      image: 'https://images.pexels.com/photos/4523006/pexels-photo-4523006.jpeg?auto=compress&cs=tinysrgb&h=800&w=600',
      link: '/product/playstation-5-slim',
      bg: 'from-indigo-900 via-neutral-900 to-neutral-900',
    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <section className="relative">
      <div className={`bg-gradient-to-br ${slide.bg} transition-all duration-700`}>
        <div className="container-custom py-12 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="text-white animate-slide-up">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Zap size={14} className="text-blue-400" /> Ưu đãi tháng này
              </span>
              <h1 className="mt-4 text-4xl font-bold leading-tight lg:text-5xl">{slide.title}</h1>
              <p className="mt-2 text-lg font-medium text-blue-300">{slide.subtitle}</p>
              <p className="mt-3 max-w-md text-sm text-neutral-300 leading-relaxed">{slide.desc}</p>
              <div className="mt-6 flex items-center gap-4">
                <div>
                  <p className="text-2xl font-bold text-white">{slide.price}</p>
                  <p className="text-sm text-neutral-400 line-through">{slide.oldPrice}</p>
                </div>
                <Link
                  to={slide.link}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-95"
                >
                  Mua ngay <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative h-72 w-64 lg:h-96 lg:w-80">
                <div className="absolute inset-0 rounded-3xl bg-white/5 backdrop-blur" />
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="relative h-full w-full rounded-3xl object-cover shadow-2xl"
                  key={current}
                  style={{ animation: 'scale-in 0.7s ease-out' }}
                />
              </div>
            </div>
          </div>

          {/* Slide indicators */}
          <div className="mt-8 flex justify-center gap-2 lg:justify-start">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'w-8 bg-blue-500' : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategorySection({ categories }: { categories: { id: string; name: string; slug: string; icon: string | null; image: string | null }[] }) {
  return (
    <section className="container-custom py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Danh mục nổi bật</h2>
          <p className="mt-1 text-sm text-neutral-500">Khám phá các dòng sản phẩm công nghệ</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.slug}`}
            className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:shadow-lg hover:border-blue-300"
          >
            <div className="aspect-[4/3] overflow-hidden bg-neutral-50">
              {cat.image && (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}
            </div>
            <div className="p-3 text-center">
              <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">{cat.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FlashSaleSection({ products, loading }: { products: import('@/types').Product[]; loading: boolean }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date();
    target.setHours(23, 59, 59, 999);
    const timer = setInterval(() => {
      const diff = target.getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-gradient-to-br from-red-50 to-orange-50 py-12">
      <div className="container-custom">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500 text-white">
              <Zap size={22} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Flash Sale</h2>
              <p className="text-sm text-neutral-500">Giá sốc chỉ trong hôm nay</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-600">Kết thúc trong</span>
            <div className="flex gap-1">
              {[
                { label: 'Giờ', value: timeLeft.hours },
                { label: 'Phút', value: timeLeft.minutes },
                { label: 'Giây', value: timeLeft.seconds },
              ].map((t, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-sm font-bold text-white tabular-nums">
                    {String(t.value).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <FlashSaleCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FlashSaleCard({ product }: { product: import('@/types').Product }) {
  const salePrice = product.sale_price ?? product.price;
  const discount = product.sale_price ? discountPercent(product.price, product.sale_price) : 0;
  const stockPercent = product.stock > 0 ? Math.min(100, Math.round((product.sold_count / (product.sold_count + product.stock)) * 100)) : 100;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group card overflow-hidden hover:shadow-xl hover:border-red-300 flex flex-col bg-white"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-50">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 badge bg-red-500 text-white shadow-sm">-{discount}%</span>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900 leading-snug">{product.name}</h3>
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-red-600">{formatVND(salePrice)}</span>
            <span className="text-xs text-neutral-400 line-through">{formatVND(product.price)}</span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-neutral-500 mb-1">
              <span>Đã bán {product.sold_count.toLocaleString('vi-VN')}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
              <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${stockPercent}%` }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function BestSellerSection({ products, loading }: { products: import('@/types').Product[]; loading: boolean }) {
  return (
    <section className="container-custom py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Sản phẩm bán chạy</h2>
          <p className="mt-1 text-sm text-neutral-500">Những sản phẩm được yêu thích nhất</p>
        </div>
        <Link to="/products" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:gap-2 transition-all">
          Xem tất cả <ChevronRight size={16} />
        </Link>
      </div>
      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

function PromoBanners() {
  return (
    <section className="container-custom py-12">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-8">
          <div className="relative z-10">
            <p className="text-sm font-semibold text-blue-200">LAPTOP VĂN PHÒNG</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Giảm đến 30%</h3>
            <p className="mt-1 text-sm text-blue-100">MacBook, Dell, HP, Lenovo và nhiều hơn nữa</p>
            <Link
              to="/products?category=laptops"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition-all hover:gap-3"
            >
              Khám phá <ArrowRight size={16} />
            </Link>
          </div>
          <img
            src="https://images.pexels.com/photos/8533587/pexels-photo-8533587.jpeg?auto=compress&cs=tinysrgb&h=400&w=600"
            alt="Laptop sale"
            className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-20"
          />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 p-8">
          <div className="relative z-10">
            <p className="text-sm font-semibold text-neutral-400">GEAR GAMING</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Mua sắm gear xịn</h3>
            <p className="mt-1 text-sm text-neutral-300">PS5, Xbox, Razer, chuột, bàn phím cơ</p>
            <Link
              to="/products?category=gaming"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500 hover:gap-3"
            >
              Khám phá <ArrowRight size={16} />
            </Link>
          </div>
          <img
            src="https://images.pexels.com/photos/19012045/pexels-photo-19012045.jpeg?auto=compress&cs=tinysrgb&h=400&w=600"
            alt="Gaming gear"
            className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-20"
          />
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-neutral-200 bg-white p-6 lg:grid-cols-4">
        {[
          { icon: Truck, title: 'Giao hàng nhanh', desc: 'Toàn quốc 1-3 ngày' },
          { icon: ShieldCheck, title: 'Bảo hành chính hãng', desc: '12-24 tháng' },
          { icon: RotateCcw, title: 'Đổi trả 30 ngày', desc: '1 đổi 1 trong 30 ngày' },
          { icon: Headphones, title: 'Hỗ trợ 24/7', desc: '1900 6789' },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <item.icon size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
              <p className="text-xs text-neutral-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NewArrivalsSection({ products, loading }: { products: import('@/types').Product[]; loading: boolean }) {
  return (
    <section className="bg-neutral-50 py-12">
      <div className="container-custom">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Hàng mới về</h2>
            <p className="mt-1 text-sm text-neutral-500">Sản phẩm mới nhất vừa cập bến</p>
          </div>
          <Link to="/products?sort=newest" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:gap-2 transition-all">
            Xem tất cả <ChevronRight size={16} />
          </Link>
        </div>
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const CUSTOMER_REVIEWS = [
  { name: 'Nguyễn Văn An', city: 'Hà Nội', rating: 5, comment: 'Mua iPhone 15 Pro Max ở TECHZONE, giao hàng siêu nhanh, đóng gói cẩn thận. Sản phẩm chính hãng, giá tốt hơn nhiều nơi khác. Sẽ ủng hộ tiếp!', product: 'iPhone 15 Pro Max' },
  { name: 'Trần Thị Bình', city: 'TP. HCM', rating: 5, comment: 'Dịch vụ tuyệt vời! Nhân viên tư vấn nhiệt tình, MacBook Pro M3 nhận được y như hình. Chấm 5 sao cho chất lượng và dịch vụ.', product: 'MacBook Pro M3' },
  { name: 'Lê Hoàng Cường', city: 'Đà Nẵng', rating: 5, comment: 'Mua PS5 Slim giá rẻ hơn ngoài hàng chục triệu. Giao hàng trong 2 ngày. Trải nghiệm game đỉnh cao. Cảm ơn TECHZONE!', product: 'PlayStation 5 Slim' },
  { name: 'Phạm Thị Dung', city: 'Bình Dương', rating: 4, comment: 'AirPods Pro 2 chính hãng, âm thanh rất hay, chống ồn tốt. Giá hơi cao nhưng xứng đáng. Giao hàng nhanh.', product: 'AirPods Pro 2' },
];

function ReviewsSection() {
  return (
    <section className="container-custom py-12">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-neutral-900">Khách hàng nói gì về TECHZONE</h2>
        <p className="mt-1 text-sm text-neutral-500">Hàng ngàn khách hàng hài lòng với dịch vụ của chúng tôi</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CUSTOMER_REVIEWS.map((review, i) => (
          <div
            key={i}
            className="card p-5 hover:shadow-lg transition-shadow animate-slide-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <Quote size={28} className="text-blue-200" />
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed line-clamp-4">{review.comment}</p>
            <div className="mt-4 flex items-center gap-3 border-t border-neutral-100 pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {review.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-900">{review.name}</p>
                <p className="text-xs text-neutral-500">{review.city}</p>
              </div>
              <StarRating rating={review.rating} size={13} />
            </div>
            <p className="mt-2 text-xs text-blue-600 font-medium">Đã mua: {review.product}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
