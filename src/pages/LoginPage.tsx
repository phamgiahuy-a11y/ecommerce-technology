import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function LoginPage() {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Vui lòng nhập email và mật khẩu', 'error');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      showToast(error.includes('Invalid login') ? 'Email hoặc mật khẩu không đúng' : error, 'error');
      return;
    }
    showToast('Đăng nhập thành công', 'success');
    navigate(from);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-neutral-50 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">T</div>
              <span className="text-2xl font-bold tracking-tight text-neutral-900">TECH<span className="text-blue-600">ZONE</span></span>
            </Link>
            <h1 className="mt-6 text-2xl font-bold text-neutral-900">Đăng nhập</h1>
            <p className="mt-1 text-sm text-neutral-500">Chào mừng bạn quay lại!</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700">Email</label>
              <div className="relative mt-1">
                <Mail size={18} className="absolute left-3 top-3 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="email@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700">Mật khẩu</label>
              <div className="relative mt-1">
                <Lock size={18} className="absolute left-3 top-3 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-neutral-600">
                <input type="checkbox" className="rounded border-neutral-300 text-blue-600" /> Ghi nhớ đăng nhập
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">Quên mật khẩu?</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
              {loading ? 'Đang đăng nhập...' : <>Đăng nhập <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
            <p className="font-semibold">Tài khoản quản trị demo:</p>
            <p>Email: admin@techzone.vn | Mật khẩu: admin123456</p>
          </div>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
