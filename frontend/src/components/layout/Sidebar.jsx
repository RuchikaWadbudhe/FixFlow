import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import {
  LayoutDashboard, PlusCircle, List, BarChart3,
  Users, ClipboardList, ChevronLeft, ChevronRight, X, Zap, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Avatar } from './Header';

const NAV = {
  user: [
    { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tickets/new', icon: PlusCircle,      label: 'New Ticket' },
    { to: '/my-tickets',  icon: List,            label: 'My Tickets' },
  ],
  staff: [
    { to: '/staff',         icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/staff/tickets', icon: ClipboardList,   label: 'All Tickets' },
  ],
  admin: [
    { to: '/admin',         icon: BarChart3,       label: 'Dashboard' },
    { to: '/admin/tickets', icon: ClipboardList,   label: 'All Tickets' },
    { to: '/admin/users',   icon: Users,           label: 'Users' },
  ],
};

function NavItem({ to, icon: Icon, label, collapsed, onClick }) {
  return (
    <NavLink
      to={to}
      end={to.split('/').length <= 2}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0 w-full' : ''}`
      }
    >
      <Icon size={15} strokeWidth={2} className="nav-item-icon shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

/* ── Desktop Sidebar ── */
function DesktopSidebar() {
  const { user, logout } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();
  const navigate = useNavigate();
  const nav = NAV[user?.role] || NAV.user;

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };

  return (
    <aside
      className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30 bg-white border-r border-slate-200 sidebar-transition overflow-hidden`}
      style={{ width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)', paddingTop: 'var(--header-height)' }}
    >
      {/* Toggle */}
      <div className={`flex ${collapsed ? 'justify-center' : 'justify-end'} px-2 pt-3 pb-2`}>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="btn-ghost btn-icon-sm"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className={`flex-1 overflow-y-auto px-2 space-y-0.5 pb-4`}>
        {nav.map(item => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer */}
      <div className={`px-2 pb-3 border-t border-slate-100 pt-3 space-y-0.5`}>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign out' : undefined}
          className={`nav-item w-full text-red-500 hover:bg-red-50 hover:text-red-700 ${collapsed ? 'justify-center px-0' : ''}`}
        >
          <LogOut size={15} strokeWidth={2} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}

/* ── Mobile Drawer ── */
function MobileDrawer() {
  const { user, logout } = useAuth();
  const { mobileOpen, setMobileOpen } = useSidebar();
  const navigate = useNavigate();
  const nav = NAV[user?.role] || NAV.user;

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); setMobileOpen(false); };

  if (!mobileOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
        onClick={() => setMobileOpen(false)}
      />
      {/* Drawer */}
      <div className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col md:hidden slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#1a56db] flex items-center justify-center">
              <Zap size={12} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Fix<span className="text-[#1a56db]">Flow</span></span>
          </div>
          <button className="btn-ghost btn-icon-sm" onClick={() => setMobileOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* User */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Avatar name={user?.name} size={30} />
            <div className="min-w-0">
              <p className="text-2xs font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xxs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {nav.map(item => (
            <NavItem key={item.to} {...item} collapsed={false} onClick={() => setMobileOpen(false)} />
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-slate-100 pt-3">
          <button onClick={handleLogout} className="nav-item w-full text-red-500 hover:bg-red-50 hover:text-red-700">
            <LogOut size={15} strokeWidth={2} className="shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileDrawer />
    </>
  );
}
