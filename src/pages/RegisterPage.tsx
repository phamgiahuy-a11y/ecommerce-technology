import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

export function RegisterPage() {
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthLabels = ['Yếu', 'Trung bình', 'Khá tốt', 'Mạnh'];
  const strengthColors = ['bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || !form.password.trim()) {
      showToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }
    if (form.password.length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return;
    }
    if (form.password !== form.confirm) {
      showToast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }
    if (!agreed) {
      showToast('Vui lòng đồng ý với điều khoản sử dụng', 'error');
      return;
    }

    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.full_name);
    setLoading(false);

    if (error) {
      showToast(error.includes('already registered') ? 'Email đã được đăng ký' : error, 'error');
      return;
    }
    showToast('Đăng ký thành công! Chào mừng bạn đến TECHZONE', 'success');
    navigate('/');
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
            <h1 className="mt-6 text-2xl font-bold text-neutral-900">Đăng ký</h1>
            <p className="mt-1 text-sm text-neutral-500">Tạo tài khoản để mua sắm dễ dàng hơn</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700">Họ và tên</label>
              <div className="relative mt-1">
                <User size={18} className="absolute left-3 top-3 text-neutral-400" />
                <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className="input-field pl-10" placeholder="Nguyễn Văn A" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700">Email</label>
              <div className="relative mt-1">
                <Mail size={18} className="absolute left-3 top-3 text-neutral-400" />
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-field pl-10" placeholder="email@example.com" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700">Mật khẩu</label>
              <div className="relative mt-1">
                <Lock size={18} className="absolute left-3 top-3 text-neutral-400" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} className="input-field pl-10 pr-10" placeholder="Ít nhất 6 ký tự" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors', i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-neutral-200')} />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">Độ mạnh: {strengthLabels[passwordStrength - 1] || 'Yếu'}</p>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700">Xác nhận mật khẩu</label>
              <div className="relative mt-1">
                <Lock size={18} className="absolute left-3 top-3 text-neutral-400" />
                <input type={showPassword ? 'text' : 'password'} value={form.confirm} onChange={(e) => update('confirm', e.target.value)} className="input-field pl-10 pr-10" placeholder="Nhập lại mật khẩu" />
                {form.confirm && form.confirm === form.password && (
                  <Check size={18} className="absolute right-3 top-3 text-green-500" />
                )}
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-neutral-600">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 rounded border-neutral-300 text-blue-600" />
              <span>Tôi đồng ý với <a href="#" className="text-blue-600 hover:underline">điều khoản sử dụng</a> và <a href="#" className="text-blue-600 hover:underline">chính sách bảo mật</a></span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
              {loading ? 'Đang đăng ký...' : <>Đăng ký <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
