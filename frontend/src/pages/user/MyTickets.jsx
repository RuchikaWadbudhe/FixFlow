import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import { SkeletonRow } from '../../components/ui/LoadingSpinner';
import { PlusCircle, Search, SlidersHorizontal, Ticket, ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STATUSES   = ['reported','assigned','in_progress','resolved','closed'];
const PRIORITIES = ['low','medium','high','critical'];

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status:'', priority:'', search:'' });
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');

  const fetchTickets = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page, limit: 12,
      ...(filters.status   ? { status:   filters.status }   : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.search   ? { search:   filters.search }   : {}),
    });
    api.get(`/tickets?${params}`)
      .then(r => { setTickets(r.data.tickets); setTotalPages(r.data.totalPages); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const applySearch = () => setFilters(f => ({ ...f, search }));
  const clearFilters = () => { setFilters({ status:'', priority:'', search:'' }); setSearch(''); setPage(1); };
  const hasFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">My Tickets</h1>
          <p className="page-sub">{total} ticket{total !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/tickets/new" className="btn-primary shrink-0">
          <PlusCircle size={14} /> New ticket
        </Link>
      </div>

      {/* Search + filter bar */}
      <div className="card p-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text" placeholder="Search by title, ID or location…"
              className="input pl-8"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
            />
          </div>
          <button onClick={applySearch} className="btn-secondary">Search</button>
          <button
            onClick={() => setShowFilters(s => !s)}
            className={`btn-secondary gap-1.5 ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
          >
            <SlidersHorizontal size={13} /> Filters
            {hasFilters && <span className="w-4 h-4 rounded-full bg-[#1a56db] text-white text-xxs flex items-center justify-center">!</span>}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
            <select className="input w-auto" value={filters.status} onChange={e => { setFilters(f=>({...f,status:e.target.value})); setPage(1); }}>
              <option value="">All statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
            </select>
            <select className="input w-auto" value={filters.priority} onChange={e => { setFilters(f=>({...f,priority:e.target.value})); setPage(1); }}>
              <option value="">All priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50">
                <X size={12} /> Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Title</th>
                <th className="hidden sm:table-cell">Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="hidden md:table-cell">Location</th>
                <th className="hidden lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:6}).map((_,i) => <SkeletonRow key={i} cols={7} />)
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><Ticket size={20} /></div>
                      <p className="text-slate-600 font-medium text-sm">No tickets found</p>
                      <p className="text-slate-400 text-2xs mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : tickets.map(t => (
                <tr key={t.id}>
                  <td>
                    <Link to={`/tickets/${t.id}`}
                      className="font-mono text-[#1a56db] font-semibold text-xxs hover:underline">
                      {t.ticket_id}
                    </Link>
                    {t.sla_breached && <span className="block text-xxs text-red-500 mt-0.5">⚠ SLA</span>}
                  </td>
                  <td className="max-w-[200px]">
                    <Link to={`/tickets/${t.id}`} className="text-slate-800 font-medium hover:text-[#1a56db] truncate block">
                      {t.title}
                    </Link>
                  </td>
                  <td className="hidden sm:table-cell"><CategoryBadge category={t.category} /></td>
                  <td><PriorityBadge priority={t.priority} /></td>
                  <td><StatusBadge status={t.status} /></td>
                  <td className="hidden md:table-cell text-slate-500">
                    <span className="flex items-center gap-1 text-xxs"><MapPin size={10} className="shrink-0" />{t.location}</span>
                  </td>
                  <td className="hidden lg:table-cell text-slate-400 text-xxs whitespace-nowrap">
                    {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
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
