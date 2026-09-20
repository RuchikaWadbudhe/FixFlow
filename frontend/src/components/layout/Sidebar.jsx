import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, PlusCircle, List, BarChart3,
  Users, ClipboardList, CheckSquare, Settings
} from 'lucide-react';

const userNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tickets/new', icon: PlusCircle, label: 'New Ticket' },
  { to: '/my-tickets', icon: List, label: 'My Tickets' },
];

const staffNav = [
  { to: '/staff', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/staff/tickets', icon: ClipboardList, label: 'All Tickets' },
];

const adminNav = [
  { to: '/admin', icon: BarChart3, label: 'Dashboard' },
  { to: '/admin/tickets', icon: ClipboardList, label: 'All Tickets' },
  { to: '/admin/users', icon: Users, label: 'Users' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const nav = user?.role === 'admin' ? adminNav : user?.role === 'staff' ? staffNav : userNav;

  return (
    <aside className="w-56 shrink-0 hidden md:block">
      <div className="card p-3 sticky top-20">
        <nav className="space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to.split('/').length <= 2}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
