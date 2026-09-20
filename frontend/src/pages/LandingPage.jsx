import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Zap, ArrowRight, CheckCircle, Menu, X,
  BarChart3, Shield, Clock, Bell, Users, Star,
  ChevronRight, Ticket, MessageSquare, TrendingUp,
  Lock, Layers, ExternalLink
} from 'lucide-react';

/* ── Helpers ── */
const gold = '#C8A96B';
const fade   = { hidden: { opacity:0, y:24 }, show: { opacity:1, y:0, transition: { duration:0.6, ease:[0.22,1,0.36,1] } } };
const stagger = (delay=0) => ({ hidden:{}, show:{ transition:{ staggerChildren:0.1, delayChildren:delay } } });

function useCounter(target, inView, duration=2000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return value;
}

/* ── Floating blob ── */
function Blob({ className, delay=0 }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

/* ── Nav ── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive:true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const links = [
    { label:'Features', href:'#features' },
    { label:'Product',  href:'#product' },
    { label:'Pricing',  href:'#stats' },
    { label:'About',    href:'#testimonials' },
  ];

  return (
    <motion.header
      initial={{ y:-80, opacity:0 }}
      animate={{ y:0, opacity:1 }}
      transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, #1a56db, #3b82f6)` }}>
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-slate-900" style={{ fontSize:16 }}>
            Fix<span style={{ color: gold }}>Flow</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <a key={l.label} href={l.href}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100/80 transition-all font-medium">
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">
            Sign in
          </Link>
          <Link to="/register"
            className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90 shadow-md"
            style={{ background: `linear-gradient(135deg, #1a56db, #3b82f6)` }}>
            Get started <ArrowRight size={13} />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration:0.25, ease:[0.22,1,0.36,1] }}
        className="overflow-hidden md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200/60"
      >
        <div className="px-5 py-4 space-y-1">
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
              {l.label}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link to="/login" onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
              Sign in
            </Link>
            <Link to="/register" onClick={() => setOpen(false)}
              className="block text-center text-sm font-semibold text-white px-4 py-2.5 rounded-lg"
              style={{ background: `linear-gradient(135deg, #1a56db, #3b82f6)` }}>
              Get started free
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
}

/* ── Hero ── */
function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -60]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0d1b2e 50%, #0a1628 100%)' }}>

      {/* Background blobs */}
      <Blob className="w-[600px] h-[600px] left-[-200px] top-[-100px]"
        style={{ background: 'radial-gradient(circle, rgba(26,86,219,0.15), transparent 70%)' }} />
      <Blob className="w-[500px] h-[500px] right-[-150px] top-[10%]" delay={3}
        style={{ background: `radial-gradient(circle, rgba(200,169,107,0.08), transparent 70%)` }} />
      <Blob className="w-[400px] h-[400px] left-[10%] bottom-[10%]" delay={5}
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize:'60px 60px' }} />

      <motion.div style={{ y: y1, opacity }} className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 text-center pt-24 pb-16">
        {/* Pill badge */}
        <motion.div variants={fade} initial="hidden" animate="show"
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border text-sm font-medium"
          style={{ background:'rgba(26,86,219,0.1)', borderColor:'rgba(26,86,219,0.3)', color:'#93c5fd' }}>
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Now available — Enterprise Issue Management
          <ChevronRight size={14} />
        </motion.div>

        {/* Headline */}
        <motion.div variants={stagger(0.1)} initial="hidden" animate="show">
          <motion.h1 variants={fade}
            className="font-bold leading-[1.08] tracking-tight mb-6"
            style={{ fontSize: 'clamp(40px, 6vw, 80px)', color:'#f8fafc' }}>
            Resolve every issue.{' '}
            <span className="block"
              style={{ background:`linear-gradient(135deg, ${gold}, #e8c97a, ${gold})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Before it escalates.
            </span>
          </motion.h1>

          <motion.p variants={fade}
            className="mx-auto mb-10 text-slate-400 leading-relaxed"
            style={{ fontSize:'clamp(16px, 2vw, 20px)', maxWidth:580 }}>
            FixFlow transforms how colleges, offices, and communities report, assign, track, and close maintenance issues — with real-time accountability.
          </motion.p>

          <motion.div variants={fade} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register"
              className="group flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02] shadow-xl"
              style={{ background:`linear-gradient(135deg, #1a56db, #3b82f6)`, fontSize:15, boxShadow:'0 8px 32px rgba(26,86,219,0.4)' }}>
              Start for free
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="#product"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold transition-all hover:bg-white/10"
              style={{ fontSize:15, color:'#cbd5e1', border:'1px solid rgba(255,255,255,0.12)' }}>
              See it in action
            </a>
          </motion.div>
        </motion.div>

        {/* Social proof */}
        <motion.div variants={fade} initial="hidden" animate="show" transition={{ delay:0.7 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12 text-slate-500 text-sm">
          {['No credit card', 'Free forever plan', '5-min setup'].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle size={13} style={{ color:gold }} /> {t}
            </span>
          ))}
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity:0, y:60, scale:0.96 }}
          animate={{ opacity:1, y:0, scale:1 }}
          transition={{ duration:1, delay:0.5, ease:[0.22,1,0.36,1] }}
          className="relative mt-16 mx-auto max-w-5xl"
        >
          {/* Glow */}
          <div className="absolute inset-0 rounded-2xl blur-3xl opacity-30"
            style={{ background:'radial-gradient(ellipse, #1a56db 0%, transparent 70%)', transform:'translateY(20px)' }} />

          {/* Browser frame */}
          <div className="relative rounded-2xl overflow-hidden border"
            style={{ borderColor:'rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.03)', backdropFilter:'blur(20px)' }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ borderColor:'rgba(255,255,255,0.08)', background:'rgba(0,0,0,0.3)' }}>
              <div className="flex gap-1.5">
                {['#ff5f57','#febc2e','#28c840'].map(c => (
                  <div key={c} className="w-3 h-3 rounded-full" style={{ background:c }} />
                ))}
              </div>
              <div className="flex-1 mx-3">
                <div className="h-6 rounded-md px-3 flex items-center text-xs text-slate-500 mx-auto max-w-xs"
                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  app.fixflow.io/admin
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-4 sm:p-6" style={{ background:'#0f172a' }}>
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label:'Total Issues', val:'1,284', color:'#1a56db', icon:Ticket },
                  { label:'In Progress',  val:'47',    color:'#7c3aed', icon:Clock },
                  { label:'Resolved',     val:'1,112', color:'#059669', icon:CheckCircle },
                  { label:'SLA Breached', val:'3',     color:gold,      icon:Bell },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3"
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-xs">{s.label}</span>
                      <s.icon size={13} style={{ color:s.color }} />
                    </div>
                    <p className="text-white font-bold text-lg leading-none">{s.val}</p>
                  </div>
                ))}
              </div>
              {/* Table mock */}
              <div className="rounded-xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="px-4 py-2.5 flex items-center gap-3"
                  style={{ background:'rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                  {['ID','Title','Priority','Status','Assigned'].map(h => (
                    <span key={h} className="text-slate-500 text-xs font-semibold uppercase tracking-wide flex-1 first:w-16 first:flex-none">{h}</span>
                  ))}
                </div>
                {[
                  { id:'FF-1042', title:'AC not working — Floor 3', p:'Critical', s:'In Progress', color:'#ef4444', sc:'#7c3aed' },
                  { id:'FF-1041', title:'Broken light — Lab 2',    p:'High',     s:'Assigned',    color:'#f97316', sc:'#1a56db' },
                  { id:'FF-1040', title:'Water leakage — Roof',   p:'High',     s:'Reported',    color:'#f97316', sc:'#f59e0b' },
                  { id:'FF-1039', title:'WiFi outage — Block B',  p:'Medium',   s:'Resolved',    color:'#f59e0b', sc:'#059669' },
                ].map(row => (
                  <div key={row.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-blue-400 font-mono text-xs w-16 shrink-0">{row.id}</span>
                    <span className="text-slate-300 text-xs flex-1 truncate">{row.title}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-1"
                      style={{ color:row.color, background:`${row.color}18` }}>{row.p}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-1"
                      style={{ color:row.sc, background:`${row.sc}18` }}>{row.s}</span>
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex-1" style={{ maxWidth:20 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ── Logos ── */
function Logos() {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-80px' });
  const logos = ['Adyapan EdTech','TechCorp','BuildingCo','CampusOps','FacilityPro','SmartOffice'];

  return (
    <section ref={ref} className="py-14 bg-slate-50 border-y border-slate-200/60">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.p
          initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}}
          transition={{ duration:0.6 }}
          className="text-center text-sm font-medium text-slate-400 mb-8 tracking-wide uppercase">
          Trusted by teams at
        </motion.p>
        <motion.div
          initial={{ opacity:0, y:16 }} animate={inView ? { opacity:1, y:0 } : {}}
          transition={{ duration:0.6, staggerChildren:0.05 }}
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {logos.map((l, i) => (
            <motion.div key={l}
              initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}}
              transition={{ delay: i * 0.08, duration:0.5 }}
              className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors"
              style={{ fontSize:15, letterSpacing:'-0.01em' }}>
              <Zap size={14} style={{ color:gold }} />
              {l}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── Features ── */
const FEATURES = [
  { icon:Ticket,      title:'Smart Ticketing',      desc:'Auto-generated ticket IDs, priority triage, and category routing — from report to resolution.', color:'#1a56db' },
  { icon:BarChart3,   title:'Real-time Analytics',  desc:'Live dashboards tracking SLA compliance, resolution time, and issue density by location.', color:'#7c3aed' },
  { icon:Bell,        title:'Instant Notifications',desc:'Staff get notified the moment an issue lands in their queue. No more missed reports.', color:gold },
  { icon:Shield,      title:'Role-based Access',    desc:'Granular permissions for users, staff, and admins. Everyone sees exactly what they need.', color:'#059669' },
  { icon:Clock,       title:'SLA Enforcement',      desc:'Automated escalation timers ensure critical issues are never left unresolved past deadlines.', color:'#ef4444' },
  { icon:MessageSquare,title:'Threaded Comments',   desc:'Internal staff notes and user-facing updates — clear communication at every stage.', color:'#0891b2' },
];

function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-60px' });

  return (
    <section id="features" ref={ref} className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          variants={stagger()} initial="hidden" animate={inView ? 'show' : 'hidden'}
          className="text-center mb-16">
          <motion.p variants={fade} className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color:gold }}>
            Platform features
          </motion.p>
          <motion.h2 variants={fade} className="font-bold text-slate-900 leading-tight mb-4"
            style={{ fontSize:'clamp(28px, 4vw, 44px)' }}>
            Everything you need to run<br className="hidden sm:block" /> a world-class facility
          </motion.h2>
          <motion.p variants={fade} className="text-slate-500 mx-auto" style={{ maxWidth:520, fontSize:16 }}>
            From first report to final close — FixFlow gives every stakeholder the clarity and tools they need.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger(0.1)} initial="hidden" animate={inView ? 'show' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <motion.div key={f.title} variants={fade}
              whileHover={{ y:-4, boxShadow:'0 20px 40px rgba(0,0,0,0.08)' }}
              className="group p-6 rounded-2xl border border-slate-200/80 bg-white transition-all cursor-default"
              style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background:`${f.color}15`, border:`1px solid ${f.color}25` }}>
                <f.icon size={18} style={{ color:f.color }} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2" style={{ fontSize:15 }}>{f.title}</h3>
              <p className="text-slate-500 leading-relaxed" style={{ fontSize:13.5 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── Product Showcase ── */
function ProductShowcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:'-60px' });
  const { scrollYProgress } = useScroll({ target:ref, offset:['start end','end start'] });
  const y = useTransform(scrollYProgress, [0,1], [30,-30]);

  return (
    <section id="product" ref={ref}
      className="py-24 overflow-hidden"
      style={{ background:'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div variants={stagger()} initial="hidden" animate={inView ? 'show' : 'hidden'}
          className="text-center mb-16">
          <motion.p variants={fade} className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color:gold }}>
            Product tour
          </motion.p>
          <motion.h2 variants={fade} className="font-bold text-slate-900 leading-tight"
            style={{ fontSize:'clamp(28px, 4vw, 44px)' }}>
            Built for every role in your organization
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left text */}
          <motion.div variants={stagger(0.1)} initial="hidden" animate={inView ? 'show' : 'hidden'}
            className="space-y-6">
            {[
              { icon:Users,      title:'User portal',         desc:'Anyone in your facility can report an issue in under 60 seconds — with photo, priority, and location.', color:'#1a56db' },
              { icon:Layers,     title:'Staff workspace',     desc:'Accept tickets, update status, add resolution proofs, and communicate — all in one focused view.', color:'#7c3aed' },
              { icon:BarChart3,  title:'Admin command center', desc:'Full visibility across categories, locations, SLA compliance, and team performance with live charts.', color:gold },
            ].map(item => (
              <motion.div key={item.title} variants={fade}
                className="flex gap-4 p-4 rounded-xl border border-slate-200/60 bg-white hover:shadow-md transition-all"
                style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background:`${item.color}12`, border:`1px solid ${item.color}20` }}>
                  <item.icon size={16} style={{ color:item.color }} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1" style={{ fontSize:14 }}>{item.title}</h4>
                  <p className="text-slate-500" style={{ fontSize:13 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
            <motion.div variants={fade}>
              <Link to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90"
                style={{ background:`linear-gradient(135deg, #1a56db, #3b82f6)`, boxShadow:'0 4px 16px rgba(26,86,219,0.3)' }}>
                Start free trial <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — floating panel mockup */}
          <motion.div style={{ y }} className="relative">
            <motion.div
              initial={{ opacity:0, x:40 }} animate={inView ? { opacity:1, x:0 } : {}}
              transition={{ duration:0.8, ease:[0.22,1,0.36,1] }}
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{ background:'#0f172a', border:'1px solid rgba(255,255,255,0.1)' }}>
              {/* Ticket detail mockup */}
              <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                {['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} className="w-2.5 h-2.5 rounded-full" style={{background:c}} />)}
                <span className="ml-2 text-slate-500 text-xs">Ticket FF-1042</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:'#ef444420', color:'#ef4444' }}>Critical</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:'#7c3aed20', color:'#a78bfa' }}>In Progress</span>
                </div>
                <h4 className="text-white font-semibold text-sm mb-1">AC not working — Floor 3, Room 301</h4>
                <p className="text-slate-400 text-xs mb-5">The central air conditioning unit on floor 3 has been non-functional since Monday morning. Temperature reaching 38°C.</p>
                {/* Progress */}
                <div className="flex items-center gap-1 mb-5">
                  {['Reported','Assigned','In Progress','Resolved','Closed'].map((s,i) => (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xxs font-bold ${i<2 ? 'bg-blue-500 text-white' : i===2 ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/30'}`}
                        style={{ fontSize:8 }}>{i<2?'✓':i+1}</div>
                      {i<4 && <div className={`flex-1 h-px mx-0.5 ${i<2?'bg-blue-500':'bg-white/10'}`} />}
                    </div>
                  ))}
                </div>
                {/* Comments */}
                <div className="space-y-2">
                  {[
                    { name:'Riya S.', msg:'Escalated to HVAC team.', time:'2h ago', role:'staff' },
                    { name:'Ankit M.', msg:'On-site inspection done. Part ordered.', time:'1h ago', role:'staff' },
                  ].map(c => (
                    <div key={c.name} className="flex gap-2.5 p-2.5 rounded-lg" style={{ background:'rgba(255,255,255,0.04)' }}>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0"
                        style={{ fontSize:9, fontWeight:700 }}>{c.name[0]}</div>
                      <div>
                        <p className="text-white text-xs font-medium">{c.name} <span className="text-slate-500 font-normal">{c.time}</span></p>
                        <p className="text-slate-400 text-xs">{c.msg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            {/* Floating badge */}
            <motion.div
              animate={{ y:[0,-8,0] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
              className="absolute -top-4 -right-4 px-3 py-2 rounded-xl text-xs font-semibold shadow-xl"
              style={{ background:gold, color:'#0a0f1e', boxShadow:`0 8px 24px ${gold}60` }}>
              🚀 Resolved in 2.4h
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── Stats ── */
const STATS = [
  { target:10000, suffix:'+', label:'Issues resolved',     color:'#1a56db' },
  { target:98,    suffix:'%', label:'SLA compliance rate', color:gold },
  { target:2.4,   suffix:'h', label:'Avg. resolution time', color:'#059669', isFloat:true },
  { target:500,   suffix:'+', label:'Teams worldwide',     color:'#7c3aed' },
];

function StatItem({ target, suffix, label, color, isFloat }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 2000;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1-p, 3);
      setVal(isFloat ? parseFloat((ease * target).toFixed(1)) : Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, isFloat]);

  return (
    <motion.div ref={ref}
      initial={{ opacity:0, y:24 }} animate={inView ? { opacity:1, y:0 } : {}}
      transition={{ duration:0.6 }}
      className="text-center p-6">
      <p className="font-bold leading-none mb-2"
        style={{ fontSize:'clamp(36px, 5vw, 60px)', color }}>
        {val}{suffix}
      </p>
      <p className="text-slate-500 font-medium" style={{ fontSize:14 }}>{label}</p>
    </motion.div>
  );
}

function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true });

  return (
    <section id="stats" ref={ref} className="py-20 bg-white border-y border-slate-200/60">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.p initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}}
          className="text-center text-sm font-semibold uppercase tracking-widest mb-12" style={{ color:gold }}>
          Trusted results
        </motion.p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 divide-x divide-slate-100">
          {STATS.map(s => <StatItem key={s.label} {...s} />)}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
const TESTIMONIALS = [
  { name:'Priya Mehta',   role:'Facilities Director, Adyapan EdTech', text:'FixFlow cut our average resolution time by 60%. Staff accountability has never been higher.', rating:5 },
  { name:'Rahul Sharma',  role:'Campus Manager, Delhi University',    text:'The SLA enforcement feature alone justified the switch. We haven\'t missed a single deadline in 3 months.', rating:5 },
  { name:'Sarah Johnson', role:'Operations Lead, TechCorp HQ',        text:'Setup took less than 10 minutes. The admin dashboard is genuinely the best I\'ve used.', rating:5 },
  { name:'James Liu',     role:'Facility Head, BuildingCo',           text:'Our tenants love the transparency. They can track their issues in real time. Game changer.', rating:5 },
];

function Testimonials() {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once:true });

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a+1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="testimonials" ref={ref} className="py-24" style={{ background:'#f8fafc' }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <motion.div variants={stagger()} initial="hidden" animate={inView ? 'show' : 'hidden'}
          className="text-center mb-14">
          <motion.p variants={fade} className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color:gold }}>Testimonials</motion.p>
          <motion.h2 variants={fade} className="font-bold text-slate-900" style={{ fontSize:'clamp(26px, 4vw, 40px)' }}>
            Loved by facility teams worldwide
          </motion.h2>
        </motion.div>

        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: `-${active * 100}%` }}
              transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="w-full shrink-0 px-2">
                  <div className="rounded-2xl p-8 text-center mx-auto max-w-2xl"
                    style={{ background:'white', border:'1px solid #e2e8f0', boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
                    <div className="flex justify-center gap-1 mb-5">
                      {Array.from({length:t.rating}).map((_,j) => (
                        <Star key={j} size={16} style={{ fill:gold, color:gold }} />
                      ))}
                    </div>
                    <p className="text-slate-700 leading-relaxed mb-6 italic" style={{ fontSize:16 }}>"{t.text}"</p>
                    <div>
                      <p className="font-semibold text-slate-900" style={{ fontSize:14 }}>{t.name}</p>
                      <p className="text-slate-400 text-sm mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_,i) => (
              <button key={i} onClick={() => setActive(i)}
                className="transition-all duration-300 rounded-full"
                style={{ width: i===active ? 24 : 8, height:8, background: i===active ? gold : '#cbd5e1' }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── CTA Banner ── */
function CTABanner() {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true });

  return (
    <section ref={ref} className="py-20 px-5 sm:px-8">
      <motion.div
        initial={{ opacity:0, y:32 }} animate={inView ? { opacity:1, y:0 } : {}}
        transition={{ duration:0.7, ease:[0.22,1,0.36,1] }}
        className="max-w-4xl mx-auto rounded-3xl overflow-hidden relative"
        style={{ background:'linear-gradient(135deg, #0a0f1e 0%, #0d1b40 100%)', padding:'clamp(40px, 6vw, 72px)' }}>

        <Blob className="w-[400px] h-[400px] -top-32 -right-32 opacity-40"
          style={{ background:'radial-gradient(circle, rgba(26,86,219,0.3), transparent 70%)' }} />
        <Blob className="w-[300px] h-[300px] -bottom-20 -left-20 opacity-30" delay={2}
          style={{ background:`radial-gradient(circle, rgba(200,169,107,0.2), transparent 70%)` }} />

        <div className="relative text-center">
          <motion.p initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}} transition={{ delay:0.2 }}
            className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color:gold }}>
            Get started today
          </motion.p>
          <motion.h2 initial={{ opacity:0, y:16 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ delay:0.3, duration:0.6 }}
            className="font-bold text-white mb-4 leading-tight" style={{ fontSize:'clamp(28px, 4vw, 48px)' }}>
            Stop letting issues fall through the cracks
          </motion.h2>
          <motion.p initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}} transition={{ delay:0.4 }}
            className="text-slate-400 mb-10 mx-auto" style={{ fontSize:16, maxWidth:480 }}>
            Join hundreds of facility teams who use FixFlow to maintain accountability, reduce resolution times, and delight their stakeholders.
          </motion.p>
          <motion.div initial={{ opacity:0, y:12 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ delay:0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ background:`linear-gradient(135deg, #1a56db, #3b82f6)`, fontSize:15, boxShadow:'0 8px 32px rgba(26,86,219,0.5)' }}>
              Start for free <ArrowRight size={15} />
            </Link>
            <Link to="/login"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold transition-all hover:bg-white/10"
              style={{ fontSize:15, color:'#cbd5e1', border:'1px solid rgba(255,255,255,0.15)' }}>
              Sign in
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  const cols = [
    { title:'Product',  links:['Features','Product tour','Pricing','Changelog'] },
    { title:'Company',  links:['About','Blog','Careers','Press'] },
    { title:'Resources',links:['Documentation','API Reference','Support','Status'] },
    { title:'Legal',    links:['Privacy Policy','Terms of Service','Security','Cookies'] },
  ];

  return (
    <footer className="border-t border-slate-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background:`linear-gradient(135deg, #1a56db, #3b82f6)` }}>
                <Zap size={13} className="text-white" fill="white" />
              </div>
              <span className="font-bold text-slate-900" style={{ fontSize:15 }}>
                Fix<span style={{ color:gold }}>Flow</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              Enterprise issue reporting and resolution for modern facilities.
            </p>
            <div className="flex gap-3">
              {[ExternalLink, ExternalLink, ExternalLink].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {cols.map(col => (
            <div key={col.title}>
              <p className="font-semibold text-slate-900 mb-4" style={{ fontSize:13 }}>{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-slate-400 hover:text-slate-700 transition-colors" style={{ fontSize:13 }}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">© 2026 FixFlow. All rights reserved.</p>
          <p className="text-slate-400 text-sm">Built with ❤️ for facility teams everywhere</p>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ── */
export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <Nav />
      <Hero />
      <Logos />
      <Features />
      <ProductShowcase />
      <Stats />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  );
}
