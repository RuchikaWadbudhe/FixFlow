import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatCard from '../../components/ui/StatCard';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { ClipboardList, Clock, CheckCircle, AlertTriangle, MapPin, Search, Filter, ChevronLeft, ChevronRight, Eye, UserCheck } from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: '', priority: '', category: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [accepting, setAccepting] = useState(null);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) });
    Promise.all([
      api.get(`/tickets?${params}`),
      api.get('/admin/stats'),
    ]).then(([ticketsRes, statsRes]) => {
      setTickets(ticketsRes.data.tickets);
      setTotalPages(ticketsRes.data.totalPages);
      setTotal(ticketsRes.data.total);
      setStats(statsRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, filters]);

  const handleAccept = async (ticketId) => {
    setAccepting(ticketId);
    try {
      await api.put(`/tickets/${ticketId}/assign`, { assignedTo: user.id });
      toast.success('Ticket accepted and assigned to you');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept ticket');
    } finally {
      setAccepting(null);
    }
  };

  const handleFilterChange = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage and resolve assigned issues</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Tickets" value={stats.total} icon={ClipboardList} color="blue" />
          <StatCard title="Open" value={stats.open} icon={AlertTriangle} color="yellow" />
          <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="purple" />
          <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="green" />
        </div>
      )}

      {/* Tickets table */}
      <div className="card">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Tickets <span className="text-gray-400 font-normal text-sm">({total})</span></h2>
            <button onClick={() => setShowFilters(s => !s)} className={`btn-secondary btn-sm ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}>
              <Filter size={14} /> Filters
            </button>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-9 text-sm" placeholder="Search by title, ID, or location..."
                value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {[['status', ['reported','assigned','in_progress','resolved','closed'], 'All Statuses'],
                ['priority', ['low','medium','high','critical'], 'All Priorities'],
                ['category', ['electrical','plumbing','internet','cleaning','furniture','parking','security','hvac','other'], 'All Categories']
              ].map(([key, opts, placeholder]) => (
                <select key={key} className="input w-auto text-sm" value={filters[key]} onChange={e => handleFilterChange(key, e.target.value)}>
                  <option value="">{placeholder}</option>
                  {opts.map(o => <option key={o} value={o}>{o.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                </select>
              ))}
              {Object.values(filters).some(Boolean) && (
                <button onClick={() => { setFilters({ status:'', priority:'', category:'', search:'' }); setPage(1); }}
                  className="text-sm text-red-500 hover:text-red-700">Clear</button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSpinner className="py-16" />
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <ClipboardList size={36} className="mx-auto mb-2 text-gray-300" />
            <p>No tickets found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Ticket ID', 'Title', 'Category', 'Priority', 'Status', 'Location', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-blue-600 font-bold text-xs">{ticket.ticket_id}</span>
                      {ticket.sla_breached && <span className="block text-xs text-red-500 mt-0.5">⚠ SLA</span>}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-gray-900 truncate">{ticket.title}</p>
                      <p className="text-xs text-gray-400">{ticket.reporter_name}</p>
                    </td>
                    <td className="px-4 py-3"><CategoryBadge category={ticket.category} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-gray-600 text-xs"><MapPin size={11} />{ticket.location}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/tickets/${ticket.id}`} className="btn-secondary btn-sm">
                          <Eye size={13} />
                        </Link>
                        {ticket.status === 'reported' && !ticket.assigned_to && (
                          <button onClick={() => handleAccept(ticket.id)}
                            disabled={accepting === ticket.id}
                            className="btn-primary btn-sm">
                            <UserCheck size={13} />
                            {accepting === ticket.id ? '...' : 'Accept'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p-1)} disabled={page===1} className="btn-secondary btn-sm"><ChevronLeft size={13} /></button>
              <button onClick={() => setPage(p => p+1)} disabled={page===totalPages} className="btn-secondary btn-sm"><ChevronRight size={13} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
