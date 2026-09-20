import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import toast from 'react-hot-toast';
import { Menu, LogOut, ChevronDown, Zap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const ROLE_STYLES = {
  admin: 'bg-violet-100 text-violet-700',
  staff: 'bg-blue-100 text-blue-700',
  user:  'bg-emerald-100 text-emerald-700',
};

function Avatar({ name, size = 28 }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?';
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold shrink-0"
    >
      {initials}
    </div>
  );
}

export { Avatar };

export default function Header() {
  const { user, logout } = useAuth();
  const { setMobileOpen } = useSidebar();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header
      className="glass fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
      style={{ height: 'var(--header-height)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <button
          className="btn-ghost btn-icon md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1a56db] flex items-center justify-center">
            <Zap size={14} className="text-white" fill="white" />
          </div>
          <span className="font-bold text-slate-900" style={{ fontSize: 15 }}>
            Fix<span className="text-[#1a56db]">Flow</span>
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2" ref={ref}>
        {/* Role badge */}
        <span className={`badge ${ROLE_STYLES[user.role] || ''} hidden sm:inline-flex capitalize`}>
          {user.role}
        </span>

        {/* Profile dropdown */}
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          aria-expanded={open}
        >
          <Avatar name={user.name} size={26} />
          <span className="text-2xs font-medium text-slate-700 hidden sm:block max-w-[120px] truncate">
            {user.name}
          </span>
          <ChevronDown size={13} className={`text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-4 top-[calc(var(--header-height)-4px)] w-56 card py-1 z-50 fade-in">
            <div className="px-3 py-2.5 border-b border-slate-100">
              <p className="text-2xs font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-xxs text-slate-400 truncate mt-0.5">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-2xs text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
