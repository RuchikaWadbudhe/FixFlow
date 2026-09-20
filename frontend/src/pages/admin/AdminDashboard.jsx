import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { SkeletonCard, SkeletonRow } from '../../components/ui/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  ClipboardList, AlertTriangle, Clock, CheckCircle,
  XCircle, AlertOctagon, Timer, TrendingUp, ArrowRight, MapPin, Eye
} from 'lucide-react';

const PIE_COLORS = ['#10b981','#f59e0b','#f97316','#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2">
      {label && <p className="text-xxs text-slate-500 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-2xs font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats]           = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [byPriority, setByPriority] = useState([]);
  const [byLocation, setByLocation] = useState([]);
  const [trend, setTrend]           = useState([]);
  const [recent, setRecent]         = useState([]);
  const [loading, setLoading]       = useState(true);

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
      setRecent(rt.data.tickets);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const kpiRows = stats ? [
    { title: 'Total issues',       value: stats.total,       icon: ClipboardList,  color: 'blue'   },
    { title: 'Open',               value: stats.open,        icon: AlertTriangle,  color: 'yellow', subtitle: 'Reported + Assigned' },
    { title: 'In progress',        value: stats.inProgress,  icon: Clock,          color: 'purple' },
    { title: 'Resolved',           value: stats.resolved,    icon: CheckCircle,    color: 'green'  },
    { title: 'Closed',             value: stats.closed,      icon: XCircle,        color: 'gray'   },
    { title: 'High priority open', value: stats.highPriority,icon: AlertOctagon,   color: 'red'    },
    { title: 'SLA breached',       value: stats.slaBreached, icon: Timer,          color: 'orange' },
    { title: 'Avg. resolution',    value: stats.avgResolutionHours ? `${stats.avgResolutionHours}h` : '—', icon: TrendingUp, color: 'blue', subtitle: 'hours to close' },
  ] : [];

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-sub">Real-time overview of all issues across your facility</p>
        </div>
        <Link to="/admin/tickets" className="btn-secondary btn-sm shrink-0">
          <ClipboardList size={13} /> All tickets
        </Link>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading
          ? Array.from({length:8}).map((_,i) => <SkeletonCard key={i} />)
          : kpiRows.map(k => <StatCard key={k.title} {...k} />)
        }
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category bar chart */}
        <div className="card p-4">
          <p className="section-title mb-3">Issues by category</p>
          {loading ? (
            <div className="skeleton h-48 rounded-lg" />
          ) : byCategory.length === 0 ? (
            <p className="text-center text-slate-400 text-2xs py-12">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byCategory} margin={{ top:0, right:4, left:-24, bottom:0 }} barSize={10}>
                <XAxis dataKey="category" tick={{ fontSize:10, fill:'#94a3b8' }}
                  tickFormatter={v => v.charAt(0).toUpperCase()+v.slice(1,3)} />
                <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize:11 }} />
                <Bar dataKey="total"    name="Total"    fill="#1a56db" radius={[3,3,0,0]} />
                <Bar dataKey="open"     name="Open"     fill="#f59e0b" radius={[3,3,0,0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Priority pie chart */}
        <div className="card p-4">
          <p className="section-title mb-3">Issues by priority</p>
          {loading ? (
            <div className="skeleton h-48 rounded-lg" />
          ) : byPriority.length === 0 ? (
            <p className="text-center text-slate-400 text-2xs py-12">No data yet</p>
          ) : (
            <div className="flex items-center gap-4 h-48">
              <ResponsiveContainer width="55%" height="100%">
                <PieChart>
                  <Pie data={byPriority} dataKey="total" nameKey="priority"
                    cx="50%" cy="50%" innerRadius={44} outerRadius={72}
                    paddingAngle={3}>
                    {byPriority.map((_, i) => <Cell key={i} fill={PIE_COLORS[i] || '#94a3b8'} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {byPriority.map((p, i) => (
                  <div key={p.priority} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-2xs text-slate-600 capitalize flex-1">{p.priority}</span>
                    <span className="text-2xs font-bold text-slate-900">{p.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 7-day trend */}
        <div className="card p-4">
          <p className="section-title mb-3">7-day trend</p>
          {loading ? (
            <div className="skeleton h-44 rounded-lg" />
          ) : trend.length === 0 ? (
            <p className="text-center text-slate-400 text-2xs py-10">No data in last 7 days</p>
          ) : (
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={trend} margin={{ top:4, right:4, left:-24, bottom:0 }}>
                <XAxis dataKey="day" tick={{ fontSize:10, fill:'#94a3b8' }} />
                <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize:11 }} />
                <Line type="monotone" dataKey="total" name="Reported"
                  stroke="#1a56db" strokeWidth={2} dot={{ r:3, fill:'#1a56db' }} activeDot={{ r:4 }} />
                <Line type="monotone" dataKey="resolved" name="Resolved"
                  stroke="#10b981" strokeWidth={2} dot={{ r:3, fill:'#10b981' }} activeDot={{ r:4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top locations */}
        <div className="card p-4">
          <p className="section-title mb-3">Top locations</p>
          {loading ? (
            <div className="space-y-2.5">
              {Array.from({length:5}).map((_,i) => (
                <div key={i} className="space-y-1">
                  <div className="skeleton h-2.5 w-1/2 rounded" />
                  <div className="skeleton h-1.5 rounded" />
                </div>
              ))}
            </div>
          ) : byLocation.length === 0 ? (
            <p className="text-center text-slate-400 text-2xs py-10">No data yet</p>
          ) : (
            <div className="space-y-3">
              {byLocation.slice(0,6).map((loc, i) => (
                <div key={loc.location} className="flex items-center gap-2.5">
                  <span className="text-xxs text-slate-400 w-3.5 shrink-0 text-right">{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xs text-slate-700 font-medium truncate flex items-center gap-1">
                        <MapPin size={10} className="text-slate-400 shrink-0" />{loc.location}
                      </span>
                      <span className="text-2xs font-bold text-slate-900 ml-2 shrink-0">{loc.total}</span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1a56db] rounded-full transition-all duration-500"
                        style={{ width: `${(loc.total / byLocation[0].total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent tickets */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <p className="section-title">Recent tickets</p>
          <Link to="/admin/tickets" className="btn-ghost btn-sm gap-1 text-[#1a56db]">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="hidden md:table-cell">Reporter</th>
                <th className="hidden lg:table-cell">Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({length:5}).map((_,i) => <SkeletonRow key={i} cols={7} />)
                : recent.length === 0
                  ? <tr><td colSpan={7} className="text-center text-slate-400 text-2xs py-8">No tickets yet</td></tr>
                  : recent.map(t => (
                    <tr key={t.id}>
                      <td>
                        <span className="font-mono text-[#1a56db] font-bold text-xxs">{t.ticket_id}</span>
                      </td>
                      <td className="max-w-[200px]">
                        <span className="text-slate-800 font-medium text-2xs truncate block">{t.title}</span>
                      </td>
                      <td><PriorityBadge priority={t.priority} /></td>
                      <td><StatusBadge status={t.status} /></td>
                      <td className="hidden md:table-cell text-slate-500 text-2xs">{t.reporter_name}</td>
                      <td className="hidden lg:table-cell text-slate-400 text-xxs whitespace-nowrap">
                        {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                      </td>
                      <td>
                        <Link to={`/tickets/${t.id}`} className="btn-secondary btn-sm btn-icon">
                          <Eye size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
