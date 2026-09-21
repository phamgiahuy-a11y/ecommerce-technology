import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Tablet, Gamepad2, Headphones, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-200 bg-neutral-50">
      {/* Features strip */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="container-custom grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {[
            { icon: '🚚', title: 'Giao hàng miễn phí', desc: 'Đơn từ 500.000₫' },
            { icon: '↩️', title: 'Đổi trả 30 ngày', desc: 'Hoàn tiền 100%' },
            { icon: '✅', title: 'Chính hãng 100%', desc: 'Bảo hành chính hãng' },
            { icon: '💳', title: 'Thanh toán đa dạng', desc: 'COD, thẻ, ví điện tử' },
          ].map((feat) => (
            <div key={feat.title} className="flex items-center gap-3">
              <span className="text-2xl">{feat.icon}</span>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{feat.title}</p>
                <p className="text-xs text-neutral-500">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg">
                T
              </div>
              <span className="text-xl font-bold tracking-tight text-neutral-900">
                Technology<span className="text-blue-600">Store</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
              TECHNOLOGY<span className="text-blue-600">STORE</span> - Cửa hàng công nghệ hàng đầu Việt Nam. Cung cấp smartphone, laptop, tablet, gaming gear và phụ kiện chính hãng với giá tốt nhất.
            </p>
            <div className="mt-5 flex gap-2">
              {[Facebook, Instagram, Youtube, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-neutral-200 text-neutral-600 transition-all hover:border-blue-500 hover:text-blue-600"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">Danh mục</h4>
            <ul className="mt-4 space-y-2.5">
              {[
                { name: 'Smartphone', icon: Smartphone, slug: 'smartphones' },
                { name: 'Laptop', icon: Laptop, slug: 'laptops' },
                { name: 'Tablet', icon: Tablet, slug: 'tablets' },
                { name: 'Gaming', icon: Gamepad2, slug: 'gaming' },
                { name: 'Phụ kiện', icon: Headphones, slug: 'accessories' },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/products?category=${cat.slug}`}
                    className="flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-blue-600"
                  >
                    <cat.icon size={15} /> {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">Hỗ trợ</h4>
            <ul className="mt-4 space-y-2.5">
              {[
                'Chính sách bảo hành',
                'Chính sách đổi trả',
                'Phương thức thanh toán',
                'Phí vận chuyển',
                'Câu hỏi thường gặp',
                'Điều khoản sử dụng',
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-neutral-600 transition-colors hover:text-blue-600">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">Liên hệ</h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-sm text-neutral-600">
                <MapPin size={17} className="mt-0.5 shrink-0 text-blue-600" />
                123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-600">
                <Phone size={17} className="shrink-0 text-blue-600" />
                1900 6789
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-600">
                <Mail size={17} className="shrink-0 text-blue-600" />
                support@zone.vn
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-200 bg-neutral-100">
        <div className="container-custom flex flex-col items-center justify-between gap-2 py-4 sm:flex-row">
          <p className="text-xs text-neutral-500">
            © 2026 TECHZONE. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500">Thanh toán:</span>
            {['VISA', 'MasterCard', 'MoMo', 'VNPay', 'COD'].map((p) => (
              <span key={p} className="rounded bg-white px-2 py-1 text-xs font-semibold text-neutral-600 border border-neutral-200">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
