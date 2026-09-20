import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import { SkeletonRow } from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Search, SlidersHorizontal, Eye, UserCheck,
  ChevronLeft, ChevronRight, MapPin, X, Timer, ClipboardList
} from 'lucide-react';

const STATUSES   = ['reported','assigned','in_progress','resolved','closed'];
const PRIORITIES = ['low','medium','high','critical'];
const CATEGORIES = ['electrical','plumbing','internet','cleaning','furniture','parking','security','hvac','other'];

export default function AdminTickets() {
  const [tickets, setTickets]     = useState([]);
  const [staff, setStaff]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [filters, setFilters]     = useState({ status:'', priority:'', category:'', search:'' });
  const [search, setSearch]       = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState({});

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page, limit: 15,
      ...(filters.status   ? { status:   filters.status }   : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.search   ? { search:   filters.search }   : {}),
    });
    Promise.all([
      api.get(`/admin/recent-tickets?${params}`),
      api.get('/auth/staff-list'),
    ]).then(([tr, sr]) => {
      setTickets(tr.data.tickets);
      setTotalPages(tr.data.totalPages);
      setTotal(tr.data.total);
      setStaff(sr.data.staff);
    }).catch(console.error).finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAssign = async (ticketId) => {
    const staffId = selectedStaff[ticketId];
    if (!staffId) return toast.error('Select a staff member first');
    setAssigningId(ticketId);
    try {
      await api.put(`/tickets/${ticketId}/assign`, { assignedTo: staffId });
      toast.success('Ticket assigned');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally { setAssigningId(null); }
  };

  const applySearch  = () => { setFilters(f => ({ ...f, search })); setPage(1); };
  const clearFilters = () => { setFilters({ status:'', priority:'', category:'', search:'' }); setSearch(''); setPage(1); };
  const hasFilters   = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-4 fade-in">
      <div>
        <h1 className="page-title">All Tickets</h1>
        <p className="page-sub">{total} ticket{total !== 1 ? 's' : ''} total</p>
      </div>

      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-slate-100 space-y-2.5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input className="input pl-8" placeholder="Search tickets…"
                value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applySearch()} />
            </div>
            <button onClick={applySearch} className="btn-secondary">Search</button>
            <button
              onClick={() => setShowFilters(s => !s)}
              className={`btn-secondary btn-sm gap-1.5 ${showFilters ? 'bg-blue-50 border-blue-200 text-[#1a56db]' : ''}`}
            >
              <SlidersHorizontal size={13} />
              {hasFilters && <span className="w-4 h-4 rounded-full bg-[#1a56db] text-white text-xxs flex items-center justify-center">!</span>}
            </button>
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
                <button onClick={clearFilters} className="btn-ghost btn-sm text-red-500 hover:bg-red-50">
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
                <th>ID</th>
                <th>Title</th>
                <th className="hidden sm:table-cell">Cat.</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="hidden md:table-cell">Location</th>
                <th className="hidden lg:table-cell">Reporter</th>
                <th>Assigned to</th>
                <th className="hidden xl:table-cell">Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:8}).map((_,i) => <SkeletonRow key={i} cols={10} />)
              ) : tickets.length === 0 ? (
                <tr><td colSpan={10}>
                  <div className="empty-state py-12">
                    <div className="empty-state-icon"><ClipboardList size={20} /></div>
                    <p className="text-slate-500 text-sm font-medium">No tickets found</p>
                  </div>
                </td></tr>
              ) : tickets.map(t => (
                <tr key={t.id}>
                  <td>
                    <span className="font-mono text-[#1a56db] font-bold text-xxs block">{t.ticket_id}</span>
                    {t.sla_breached && (
                      <span className="text-xxs text-red-500 flex items-center gap-0.5">
                        <Timer size={9} /> SLA
                      </span>
                    )}
                  </td>
                  <td className="max-w-[160px]">
                    <p className="text-slate-800 font-medium text-2xs truncate">{t.title}</p>
                  </td>
                  <td className="hidden sm:table-cell"><CategoryBadge category={t.category} /></td>
                  <td><PriorityBadge priority={t.priority} /></td>
                  <td><StatusBadge status={t.status} /></td>
                  <td className="hidden md:table-cell">
                    <span className="flex items-center gap-1 text-xxs text-slate-500">
                      <MapPin size={10} className="shrink-0" />{t.location}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell text-slate-500 text-2xs">{t.reporter_name}</td>
                  <td>
                    {t.assignee_name ? (
                      <span className="text-2xs text-slate-700 font-medium">{t.assignee_name}</span>
                    ) : (
                      <div className="flex items-center gap-1 min-w-[150px]">
                        <select
                          className="input text-xxs py-0 flex-1"
                          style={{ height: 28 }}
                          value={selectedStaff[t.id] || ''}
                          onChange={e => setSelectedStaff(s => ({ ...s, [t.id]: e.target.value }))}>
                          <option value="">Assign…</option>
                          {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <button
                          onClick={() => handleAssign(t.id)}
                          disabled={assigningId === t.id || !selectedStaff[t.id]}
                          className="btn-primary btn-sm btn-icon shrink-0">
                          <UserCheck size={12} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="hidden xl:table-cell text-slate-400 text-xxs whitespace-nowrap">
                    {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                  </td>
                  <td>
                    <Link to={`/tickets/${t.id}`} className="btn-secondary btn-sm btn-icon">
                      <Eye size={13} />
                    </Link>
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
