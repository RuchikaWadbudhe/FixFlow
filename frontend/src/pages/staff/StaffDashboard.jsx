import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import { SkeletonRow, SkeletonCard } from '../../components/ui/LoadingSpinner';
import StatCard from '../../components/ui/StatCard';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  ClipboardList, Clock, CheckCircle, AlertTriangle,
  Search, SlidersHorizontal, Eye, UserCheck,
  ChevronLeft, ChevronRight, MapPin, X, Timer
} from 'lucide-react';

const STATUSES   = ['reported','assigned','in_progress','resolved','closed'];
const PRIORITIES = ['low','medium','high','critical'];
const CATEGORIES = ['electrical','plumbing','internet','cleaning','furniture','parking','security','hvac','other'];

export default function StaffDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets]     = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [filters, setFilters]     = useState({ status:'', priority:'', category:'', search:'' });
  const [search, setSearch]       = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [accepting, setAccepting] = useState(null);

  const fetchStats = useCallback(() => {
    setStatsLoading(true);
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, []);

  const fetchTickets = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page, limit: 15,
      ...(filters.status   ? { status:   filters.status }   : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.search   ? { search:   filters.search }   : {}),
    });
    api.get(`/tickets?${params}`)
      .then(r => { setTickets(r.data.tickets); setTotalPages(r.data.totalPages); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleAccept = async (ticketId) => {
    setAccepting(ticketId);
    try {
      await api.put(`/tickets/${ticketId}/assign`, { assignedTo: user.id });
      toast.success('Ticket accepted');
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally { setAccepting(null); }
  };

  const applySearch  = () => { setFilters(f => ({ ...f, search })); setPage(1); };
  const clearFilters = () => { setFilters({ status:'', priority:'', category:'', search:'' }); setSearch(''); setPage(1); };
  const hasFilters   = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">Staff Dashboard</h1>
        <p className="page-sub">Manage and resolve assigned issues</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsLoading ? (
          Array.from({length:4}).map((_,i) => <SkeletonCard key={i} />)
        ) : stats ? (
          <>
            <StatCard title="Total tickets"  value={stats.total}      icon={ClipboardList}  color="blue" />
            <StatCard title="Open"           value={stats.open}       icon={AlertTriangle}  color="yellow" />
            <StatCard title="In progress"    value={stats.inProgress} icon={Clock}          color="purple" />
            <StatCard title="Resolved"       value={stats.resolved}   icon={CheckCircle}    color="green" />
          </>
        ) : null}
      </div>

      {/* Tickets table */}
      <div className="card overflow-hidden">
        {/* Table toolbar */}
        <div className="px-4 py-3 border-b border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <p className="section-title">
              Tickets <span className="text-slate-400 font-normal text-2xs ml-1">{total}</span>
            </p>
            <button
              onClick={() => setShowFilters(s => !s)}
              className={`btn-secondary btn-sm gap-1.5 ${showFilters ? 'bg-blue-50 border-blue-200 text-[#1a56db]' : ''}`}
            >
              <SlidersHorizontal size={13} /> Filters
              {hasFilters && <span className="w-4 h-4 rounded-full bg-[#1a56db] text-white text-xxs flex items-center justify-center">!</span>}
            </button>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input className="input pl-8" placeholder="Search by title, ticket ID or location…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applySearch()} />
            </div>
            <button onClick={applySearch} className="btn-secondary">Search</button>
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {[
                ['status',   STATUSES,   'All statuses'],
                ['priority', PRIORITIES, 'All priorities'],
                ['category', CATEGORIES, 'All categories'],
              ].map(([key, opts, ph]) => (
                <select key={key} className="input w-auto"
                  value={filters[key]}
                  onChange={e => { setFilters(f => ({ ...f, [key]: e.target.value })); setPage(1); }}>
                  <option value="">{ph}</option>
                  {opts.map(o => <option key={o} value={o}>{o.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                </select>
              ))}
              {hasFilters && (
                <button onClick={clearFilters} className="btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50">
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table className="table">
            <thead className="table-sticky">
              <tr>
                <th>Ticket</th>
                <th>Title</th>
                <th className="hidden sm:table-cell">Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="hidden md:table-cell">Location</th>
                <th className="hidden lg:table-cell">Reporter</th>
                <th className="hidden lg:table-cell">Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:8}).map((_,i) => <SkeletonRow key={i} cols={9} />)
              ) : tickets.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="empty-state py-12">
                    <div className="empty-state-icon"><ClipboardList size={20} /></div>
                    <p className="text-slate-500 text-sm font-medium">No tickets found</p>
                  </div>
                </td></tr>
              ) : tickets.map(t => (
                <tr key={t.id}>
                  <td>
                    <Link to={`/tickets/${t.id}`}
                      className="font-mono text-[#1a56db] font-bold text-xxs hover:underline block">
                      {t.ticket_id}
                    </Link>
                    {t.sla_breached && (
                      <span className="text-xxs text-red-500 flex items-center gap-0.5 mt-0.5">
                        <Timer size={9} /> SLA
                      </span>
                    )}
                  </td>
                  <td className="max-w-[180px]">
                    <Link to={`/tickets/${t.id}`} className="font-medium text-slate-800 hover:text-[#1a56db] truncate block text-2xs">
                      {t.title}
                    </Link>
                    <p className="text-xxs text-slate-400 truncate">{t.reporter_name}</p>
                  </td>
                  <td className="hidden sm:table-cell"><CategoryBadge category={t.category} /></td>
                  <td><PriorityBadge priority={t.priority} /></td>
                  <td><StatusBadge status={t.status} /></td>
                  <td className="hidden md:table-cell">
                    <span className="flex items-center gap-1 text-slate-500 text-xxs">
                      <MapPin size={10} className="shrink-0" />{t.location}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell text-slate-500 text-2xs">{t.reporter_name}</td>
                  <td className="hidden lg:table-cell text-slate-400 text-xxs whitespace-nowrap">
                    {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Link to={`/tickets/${t.id}`} className="btn-secondary btn-sm btn-icon" title="View">
                        <Eye size={13} />
                      </Link>
                      {t.status === 'reported' && !t.assigned_to && (
                        <button
                          onClick={() => handleAccept(t.id)}
                          disabled={accepting === t.id}
                          className="btn-primary btn-sm gap-1"
                          title="Accept ticket"
                        >
                          <UserCheck size={12} />
                          {accepting === t.id ? '…' : 'Accept'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100">
            <p className="text-xxs text-slate-400">Page {page} of {totalPages}</p>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p=>p-1)} disabled={page===1} className="btn-secondary btn-sm">
                <ChevronLeft size={13} />
              </button>
              <button onClick={() => setPage(p=>p+1)} disabled={page===totalPages} className="btn-secondary btn-sm">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
