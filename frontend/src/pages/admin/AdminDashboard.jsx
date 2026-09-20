import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import {
  ClipboardList, AlertTriangle, Clock, CheckCircle, XCircle,
  TrendingUp, Timer, AlertOctagon, MapPin, Eye
} from 'lucide-react';

const CATEGORY_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899','#6b7280'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [byPriority, setByPriority] = useState([]);
  const [byLocation, setByLocation] = useState([]);
  const [trend, setTrend] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/by-category'),
      api.get('/admin/by-priority'),
      api.get('/admin/by-location'),
      api.get('/admin/trend'),
      api.get('/admin/recent-tickets?limit=8'),
    ]).then(([s, cat, pri, loc, tr, rt]) => {
      setStats(s.data);
      setByCategory(cat.data.data);
      setByPriority(pri.data.data);
      setByLocation(loc.data.data);
      setTrend(tr.data.data);
      setRecentTickets(rt.data.tickets);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Real-time overview of all issues across your facility</p>
        </div>
        <Link to="/admin/tickets" className="btn-primary btn-sm">
          <ClipboardList size={15} /> All Tickets
        </Link>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Issues" value={stats.total} icon={ClipboardList} color="blue" />
          <StatCard title="Open Issues" value={stats.open} icon={AlertTriangle} color="yellow" subtitle="Reported + Assigned" />
          <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="purple" />
          <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="green" />
          <StatCard title="Closed" value={stats.closed} icon={XCircle} color="gray" />
          <StatCard title="High Priority Open" value={stats.highPriority} icon={AlertOctagon} color="red" />
          <StatCard title="SLA Breached" value={stats.slaBreached} icon={Timer} color="orange" />
          <StatCard title="Avg. Resolution" value={stats.avgResolutionHours ? `${stats.avgResolutionHours}h` : 'N/A'} icon={TrendingUp} color="blue" subtitle="hours to resolve" />
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Issues by Category */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Issues by Category</h3>
          {byCategory.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byCategory} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" tick={{ fontSize: 11 }} tickFormatter={v => v.charAt(0).toUpperCase()+v.slice(1)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(v, n) => [v, n === 'total' ? 'Total' : n === 'open' ? 'Open' : 'Resolved']} />
                <Legend formatter={v => v === 'total' ? 'Total' : v === 'open' ? 'Open' : 'Resolved'} />
                <Bar dataKey="total" fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar dataKey="open" fill="#f59e0b" radius={[4,4,0,0]} />
                <Bar dataKey="resolved" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Issues by Priority */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Issues by Priority</h3>
          {byPriority.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No data yet</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={byPriority} dataKey="total" nameKey="priority" cx="50%" cy="50%" outerRadius={80} label={({ priority, percent }) => `${(percent*100).toFixed(0)}%`}>
                    {byPriority.map((_, i) => (
                      <Cell key={i} fill={['#10b981','#f59e0b','#f97316','#ef4444'][i] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {byPriority.map((p, i) => (
                  <div key={p.priority} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: ['#10b981','#f59e0b','#f97316','#ef4444'][i] }} />
                    <span className="capitalize text-gray-700">{p.priority}</span>
                    <span className="font-bold text-gray-900 ml-auto pl-4">{p.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 7-day trend */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">7-Day Ticket Trend</h3>
          {trend.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No data in last 7 days</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trend} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Reported" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By Location */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Top Locations</h3>
          {byLocation.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {byLocation.slice(0,6).map((loc, i) => (
                <div key={loc.location} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-4 shrink-0">{i+1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-medium text-gray-900 truncate flex items-center gap-1">
                        <MapPin size={11} className="text-gray-400 shrink-0" />{loc.location}
                      </span>
                      <span className="text-sm font-bold text-gray-900 ml-2 shrink-0">{loc.total}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(loc.total / byLocation[0].total) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Tickets</h3>
          <Link to="/admin/tickets" className="text-sm text-blue-600 hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['ID', 'Title', 'Priority', 'Status', 'Reporter', 'Created', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentTickets.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-blue-600 font-bold text-xs">{t.ticket_id}</td>
                  <td className="px-4 py-3 max-w-xs"><p className="font-medium text-gray-900 truncate">{t.title}</p></td>
                  <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-gray-600">{t.reporter_name}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}</td>
                  <td className="px-4 py-3">
                    <Link to={`/tickets/${t.id}`} className="btn-secondary btn-sm"><Eye size={13} /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentTickets.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">No tickets yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
