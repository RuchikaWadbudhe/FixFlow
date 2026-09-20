import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { SkeletonRow } from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Users, ShieldCheck, Wrench, User } from 'lucide-react';

const ROLE_CONFIG = {
  admin: { label: 'Admin',  cls: 'bg-violet-50 text-violet-700 border border-violet-200', icon: ShieldCheck },
  staff: { label: 'Staff',  cls: 'bg-blue-50 text-blue-700 border border-blue-200',       icon: Wrench },
  user:  { label: 'User',   cls: 'bg-slate-50 text-slate-600 border border-slate-200',    icon: User },
};

function RoleBadge({ role }) {
  const c = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  return <span className={`badge ${c.cls} capitalize`}>{c.label}</span>;
}

function Avatar({ name }) {
  const initials = name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '?';
  return (
    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xxs font-bold shrink-0">
      {initials}
    </div>
  );
}

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    api.get('/admin/users')
      .then(r => setUsers(r.data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      const r = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(u => u.map(user => user.id === userId ? { ...user, role: r.data.user.role } : user));
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally { setUpdating(null); }
  };

  const counts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role]||0)+1; return acc; }, {});

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">User Management</h1>
        <p className="page-sub">{users.length} registered users</p>
      </div>

      {/* Summary pills */}
      {!loading && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(ROLE_CONFIG).map(([role, c]) => (
            <div key={role} className={`flex items-center gap-1.5 badge ${c.cls} px-3 py-1.5 h-auto`}>
              <c.icon size={11} />
              <span className="font-semibold">{counts[role] || 0}</span>
              <span>{c.label}{(counts[role]||0) !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="table-wrap">
          <table className="table">
            <thead className="table-sticky">
              <tr>
                <th>User</th>
                <th className="hidden sm:table-cell">Email</th>
                <th className="hidden md:table-cell">Department</th>
                <th>Role</th>
                <th className="hidden lg:table-cell">Tickets</th>
                <th className="hidden lg:table-cell">Joined</th>
                <th>Change role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:6}).map((_,i) => <SkeletonRow key={i} cols={7} />)
              ) : users.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state py-12">
                    <div className="empty-state-icon"><Users size={20} /></div>
                    <p className="text-slate-500 text-sm font-medium">No users found</p>
                  </div>
                </td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={u.name} />
                      <span className="text-2xs font-semibold text-slate-800 truncate max-w-[120px]">{u.name}</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell text-slate-500 text-2xs">{u.email}</td>
                  <td className="hidden md:table-cell text-slate-500 text-2xs">{u.department || <span className="text-slate-300">—</span>}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td className="hidden lg:table-cell">
                    <span className="text-2xs text-slate-600 font-medium">{u.ticket_count}</span>
                  </td>
                  <td className="hidden lg:table-cell text-slate-400 text-xxs">
                    {format(new Date(u.created_at), 'MMM d, yyyy')}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <select
                        className="input w-auto text-xxs"
                        style={{ height: 28 }}
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        disabled={updating === u.id}
                      >
                        <option value="user">User</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                      {updating === u.id && (
                        <svg className="animate-spin w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
