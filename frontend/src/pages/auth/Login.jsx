import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 bg-[#0f172a] p-10 relative overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1a56db] flex items-center justify-center">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <span className="text-white font-bold text-lg">FixFlow</span>
        </div>

        {/* Middle content */}
        <div className="relative space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-blue-300 text-xxs font-medium">Enterprise Issue Management</span>
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight">
              Resolve issues<br />faster than ever.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              A structured ticketing platform for colleges, offices, and communities to report, track, and close maintenance issues.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Avg Resolution', value: '2.4h' },
              { label: 'SLA Compliance', value: '98%' },
              { label: 'Issues Resolved', value: '10k+' },
              { label: 'Uptime', value: '99.9%' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5">
                <p className="text-white font-bold text-lg leading-none">{s.value}</p>
                <p className="text-slate-400 text-xxs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-600 text-xxs">© 2026 FixFlow. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-[#1a56db] flex items-center justify-center">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-slate-900 text-base">FixFlow</span>
          </div>

          <div className="mb-7">
            <h2 className="text-xl font-bold text-slate-900">Sign in</h2>
            <p className="text-slate-500 text-2xs mt-1">Enter your credentials to access your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="input-group">
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email" type="email" autoComplete="email" autoFocus
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@company.com"
                value={form.email}
                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })); }}
              />
              {errors.email && <p className="hint text-red-500">{errors.email}</p>}
            </div>

            <div className="input-group">
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input pr-9 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: '' })); }}
                />
                <button
                  type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="hint text-red-500">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-1.5">Sign in <ArrowRight size={14} /></span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-2xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#1a56db] font-semibold hover:underline">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
