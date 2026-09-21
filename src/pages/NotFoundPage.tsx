import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center container-custom py-16 animate-fade-in">
      <div className="text-center">
        <p className="text-8xl font-bold text-blue-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">Không tìm thấy trang</h1>
        <p className="mt-2 text-sm text-neutral-500">Trang bạn đang tìm có thể đã bị xóa hoặc không tồn tại</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="btn-primary"><Home size={16} /> Về trang chủ</Link>
          <Link to="/products" className="btn-secondary"><Search size={16} /> Mua sắm</Link>
        </div>
      </div>
    </div>
  );
}
