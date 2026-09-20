import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Zap, CheckCircle, Shield, Clock, BarChart3 } from 'lucide-react';
import LoginIllustration from '../../components/illustrations/LoginIllustration';

const gold = '#C8A96B';

const fade = {
  hidden: { opacity:0, y:20 },
  show:   { opacity:1, y:0, transition:{ duration:0.5, ease:[0.22,1,0.36,1] } },
};
const stagger = {
  hidden: {},
  show: { transition:{ staggerChildren:0.08, delayChildren:0.2 } },
};

/* Animated floating shape */
function FloatShape({ style, delay=0 }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={style}
      animate={{ y:[0,-20,0], x:[0,10,0], rotate:[0,5,0] }}
      transition={{ duration:7+delay, repeat:Infinity, ease:'easeInOut', delay }}
    />
  );
}

/* Feature pill */
function FeaturePill({ icon:Icon, text, color }) {
  return (
    <motion.div variants={fade}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
      style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background:`${color}20`, border:`1px solid ${color}30` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <span className="text-slate-300 font-medium" style={{ fontSize:13 }}>{text}</span>
    </motion.div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email:'', password:'' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [focused, setFocused]   = useState('');

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
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
      if (user.role === 'admin')      navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else                            navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col relative w-[480px] xl:w-[520px] shrink-0 overflow-hidden"
        style={{ background:'linear-gradient(145deg, #080d1a 0%, #0a1428 50%, #0d1f3c 100%)' }}>

        {/* Floating shapes */}
        <FloatShape delay={0} style={{ width:300, height:300, top:-80, left:-80, background:'radial-gradient(circle, rgba(26,86,219,0.18), transparent 70%)' }} />
        <FloatShape delay={2} style={{ width:200, height:200, bottom:100, right:-60, background:`radial-gradient(circle, rgba(200,169,107,0.12), transparent 70%)` }} />
        <FloatShape delay={4} style={{ width:150, height:150, top:'40%', left:20, background:'radial-gradient(circle, rgba(124,58,237,0.1), transparent 70%)' }} />

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize:'48px 48px' }} />

        <div className="relative flex flex-col h-full p-10 xl:p-12">
          {/* Logo */}
          <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6 }}
            className="flex items-center gap-2.5 mb-auto">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background:`linear-gradient(135deg, #1a56db, #3b82f6)` }}>
              <Zap size={15} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-white" style={{ fontSize:17 }}>
              Fix<span style={{ color:gold }}>Flow</span>
            </span>
          </motion.div>

          {/* Center content */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="my-auto space-y-8">
            {/* Badge */}
            <motion.div variants={fade}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background:'rgba(200,169,107,0.12)', border:`1px solid rgba(200,169,107,0.25)`, color:gold }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:gold }} />
              Enterprise Issue Management Platform
            </motion.div>

            <motion.div variants={fade} className="space-y-3">
              <h1 className="font-bold text-white leading-tight" style={{ fontSize:'clamp(28px, 3vw, 40px)' }}>
                Resolve every issue.<br />
                <span style={{ background:`linear-gradient(135deg, ${gold}, #e8c97a)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  Faster than ever.
                </span>
              </h1>
              <p className="text-slate-400 leading-relaxed" style={{ fontSize:14, maxWidth:340 }}>
                The intelligent ticketing platform built for modern facility teams. Every report tracked. Every issue resolved.
              </p>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2.5">
              <FeaturePill icon={BarChart3} text="Live analytics dashboard"    color="#1a56db" />
              <FeaturePill icon={Shield}    text="Role-based access control"   color={gold} />
              <FeaturePill icon={Clock}     text="SLA enforcement & escalation" color="#7c3aed" />
              <FeaturePill icon={CheckCircle} text="End-to-end issue lifecycle" color="#059669" />
            </motion.div>

            {/* SVG Illustration */}
            <motion.div variants={fade} className="relative">
              <LoginIllustration className="w-full max-w-[320px] mx-auto h-auto opacity-90" />
              {/* Glow under illustration */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 blur-2xl rounded-full"
                style={{ background:'rgba(26,86,219,0.2)' }} />
            </motion.div>

            {/* Mini ticket preview */}
            <motion.div variants={fade}
              className="rounded-2xl p-4 overflow-hidden"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs font-bold" style={{ color:'#60a5fa' }}>FF-1042</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:'#ef444420', color:'#ef4444' }}>Critical</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:'#7c3aed20', color:'#a78bfa' }}>In Progress</span>
              </div>
              <p className="text-slate-300 text-xs mb-3">AC unit failure — Floor 3, Room 301</p>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-1">
                  {['#1a56db','#7c3aed','#059669'].map(c=>(
                    <div key={c} className="w-5 h-5 rounded-full border-2 border-[#0a1428]"
                      style={{ background:`linear-gradient(135deg, ${c}, ${c}99)` }} />
                  ))}
                </div>
                <span className="text-xxs font-medium" style={{ color:gold }}>Resolved in 2.4h ✓</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1 }}
            className="text-slate-600 text-xs">
            © 2026 FixFlow · Enterprise Issue Management
          </motion.p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#f8f9fb] relative overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 opacity-40"
          style={{ backgroundImage:'radial-gradient(circle at 70% 30%, rgba(26,86,219,0.06), transparent 50%), radial-gradient(circle at 20% 80%, rgba(200,169,107,0.04), transparent 50%)' }} />

        <motion.div
          initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
          className="relative w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background:`linear-gradient(135deg, #1a56db, #3b82f6)` }}>
              <Zap size={13} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-slate-900" style={{ fontSize:16 }}>
              Fix<span style={{ color:gold }}>Flow</span>
            </span>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-8 sm:p-9"
            style={{ background:'white', boxShadow:'0 8px 40px rgba(0,0,0,0.08)', border:'1px solid rgba(226,232,240,0.8)' }}>

            <div className="mb-7">
              <h2 className="font-bold text-slate-900 mb-1.5" style={{ fontSize:22 }}>Welcome back</h2>
              <p className="text-slate-500" style={{ fontSize:13.5 }}>Sign in to your FixFlow workspace</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="label" htmlFor="email">Email address</label>
                <motion.div animate={{ scale: focused==='email' ? 1.005 : 1 }} transition={{ duration:0.15 }}>
                  <input id="email" type="email" autoComplete="email" autoFocus
                    className={`input ${errors.email ? 'input-error' : ''}`}
                    placeholder="you@company.com"
                    value={form.email}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    onChange={e => { setForm(f=>({...f,email:e.target.value})); setErrors(er=>({...er,email:''})); }}
                  />
                </motion.div>
                {errors.email && <p className="hint text-red-500">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="label" htmlFor="password">Password</label>
                <motion.div animate={{ scale: focused==='password' ? 1.005 : 1 }} transition={{ duration:0.15 }}>
                  <div className="relative">
                    <input id="password" type={showPass ? 'text' : 'password'} autoComplete="current-password"
                      className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                      placeholder="••••••••"
                      value={form.password}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused('')}
                      onChange={e => { setForm(f=>({...f,password:e.target.value})); setErrors(er=>({...er,password:''})); }}
                    />
                    <button type="button" onClick={() => setShowPass(s=>!s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </motion.div>
                {errors.password && <p className="hint text-red-500">{errors.password}</p>}
              </div>

              {/* Submit */}
              <motion.button
                type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.015 }}
                whileTap={{ scale: loading ? 1 : 0.985 }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60"
                style={{ background:`linear-gradient(135deg, #1a56db, #3b82f6)`, fontSize:14.5, boxShadow:'0 4px 16px rgba(26,86,219,0.3)', marginTop:4 }}>
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>Sign in <ArrowRight size={14}/></>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-slate-300 text-xs">or</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-6">
              {['SOC 2 Compliant','256-bit encryption','99.9% uptime'].map(t => (
                <span key={t} className="flex items-center gap-1 text-slate-400" style={{ fontSize:11.5 }}>
                  <CheckCircle size={11} style={{ color:gold }} /> {t}
                </span>
              ))}
            </div>

            <p className="text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold hover:underline" style={{ color:'#1a56db' }}>
                Create account
              </Link>
            </p>
          </div>

          {/* Back to home */}
          <div className="text-center mt-5">
            <Link to="/" className="text-slate-400 hover:text-slate-600 transition-colors" style={{ fontSize:13 }}>
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
