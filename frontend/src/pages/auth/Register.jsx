import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
const gold = '#C8A96B';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to FixFlow, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })); },
  });

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40"
        style={{ backgroundImage:'radial-gradient(circle at 70% 30%, rgba(26,86,219,0.06), transparent 50%), radial-gradient(circle at 20% 80%, rgba(200,169,107,0.04), transparent 50%)' }} />

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
        className="relative w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-7">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background:`linear-gradient(135deg, #1a56db, #3b82f6)` }}>
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-slate-900" style={{ fontSize:16 }}>
            Fix<span style={{ color:gold }}>Flow</span>
          </span>
        </div>

        <div className="rounded-2xl p-8"
          style={{ background:'white', boxShadow:'0 8px 40px rgba(0,0,0,0.08)', border:'1px solid rgba(226,232,240,0.8)' }}>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Create an account</h2>
          <p className="text-slate-500 text-2xs mt-1">Get started — it's free</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          <div className="input-group">
            <label className="label" htmlFor="name">Full name</label>
            <input id="name" type="text" autoFocus autoComplete="name"
              className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Jane Doe"
              {...field('name')} />
            {errors.name && <p className="hint text-red-500">{errors.name}</p>}
          </div>

          <div className="input-group">
            <label className="label" htmlFor="reg-email">Email address</label>
            <input id="reg-email" type="email" autoComplete="email"
              className={`input ${errors.email ? 'input-error' : ''}`} placeholder="you@company.com"
              {...field('email')} />
            {errors.email && <p className="hint text-red-500">{errors.email}</p>}
          </div>

          <div className="input-group">
            <label className="label" htmlFor="dept">
              Department <span className="text-slate-400 font-normal">— optional</span>
            </label>
            <input id="dept" type="text" autoComplete="organization"
              className="input" placeholder="e.g. Engineering, Operations"
              {...field('department')} />
          </div>

          <div className="input-group">
            <label className="label" htmlFor="reg-pass">Password</label>
            <input id="reg-pass" type="password" autoComplete="new-password" minLength={6}
              className={`input ${errors.password ? 'input-error' : ''}`} placeholder="Min. 6 characters"
              {...field('password')} />
            {errors.password && <p className="hint text-red-500">{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full mt-1">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Creating account…
              </span>
            ) : (
              <span className="flex items-center gap-1.5">Create account <ArrowRight size={14} /></span>
            )}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-slate-100 text-center">
          <p className="text-2xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1a56db] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-slate-400 hover:text-slate-600 transition-colors" style={{ fontSize:13 }}>
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
