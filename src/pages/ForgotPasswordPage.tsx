import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

export function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { showToast('Vui lòng nhập email', 'error'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) { showToast('Không thể gửi email đặt lại mật khẩu', 'error'); return; }
    setSent(true);
    showToast('Email đặt lại mật khẩu đã được gửi', 'success');
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
            <h1 className="mt-6 text-2xl font-bold text-neutral-900">Quên mật khẩu</h1>
            <p className="mt-1 text-sm text-neutral-500">Nhập email để nhận liên kết đặt lại mật khẩu</p>
          </div>

          {sent ? (
            <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Mail size={24} />
              </div>
              <p className="mt-3 text-sm font-medium text-green-800">Email đã được gửi!</p>
              <p className="mt-1 text-xs text-green-700">Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu.</p>
              <Link to="/login" className="btn-primary mt-4">Quay lại đăng nhập</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700">Email</label>
                <div className="relative mt-1">
                  <Mail size={18} className="absolute left-3 top-3 text-neutral-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="email@example.com" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
                {loading ? 'Đang gửi...' : <>Gửi liên kết <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600 hover:underline">
            <ArrowLeft size={15} /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
