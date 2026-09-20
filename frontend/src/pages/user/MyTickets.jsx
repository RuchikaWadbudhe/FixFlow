import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { PlusCircle, Search, Filter, Ticket, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchTickets = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 10, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) });
    api.get(`/tickets?${params}`)
      .then(res => {
        setTickets(res.data.tickets);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, [page, filters]);

  const handleFilterChange = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-500 text-sm">{total} ticket{total !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/tickets/new" className="btn-primary">
          <PlusCircle size={16} /> New Ticket
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="card p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search tickets..." className="input pl-9"
              value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
          </div>
          <button onClick={() => setShowFilters(s => !s)} className={`btn-secondary ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}>
            <Filter size={16} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
            <select className="input w-auto" value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
              <option value="">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select className="input w-auto" value={filters.priority} onChange={e => handleFilterChange('priority', e.target.value)}>
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            {(filters.status || filters.priority || filters.search) && (
              <button onClick={() => { setFilters({ status: '', priority: '', search: '' }); setPage(1); }}
                className="text-sm text-red-500 hover:text-red-700">Clear filters</button>
            )}
          </div>
        )}
      </div>

      {/* Tickets List */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner className="py-16" />
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center">
            <Ticket size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No tickets found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or create a new ticket</p>
            <Link to="/tickets/new" className="btn-primary mt-4 inline-flex">Report an Issue</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tickets.map(ticket => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`}
                className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                      {ticket.ticket_id}
                    </span>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    <CategoryBadge category={ticket.category} />
                  </div>
                  <p className="font-semibold text-gray-900 group-hover:text-blue-600 truncate">{ticket.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin size={11} /> {ticket.location}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                    {ticket.assignee_name && (
                      <><span>·</span><span>Assigned to {ticket.assignee_name}</span></>
                    )}
                  </div>
                </div>
                {ticket.sla_breached && (
                  <span className="badge bg-red-100 text-red-700 shrink-0 text-xs">SLA Breached</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary btn-sm">
              <ChevronLeft size={14} /> Prev
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="btn-secondary btn-sm">
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
