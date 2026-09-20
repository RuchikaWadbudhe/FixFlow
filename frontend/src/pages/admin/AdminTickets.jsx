import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { Search, Filter, Eye, UserCheck, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status:'', priority:'', category:'', search:'' });
  const [showFilters, setShowFilters] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState({});

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) });
    Promise.all([
      api.get(`/admin/recent-tickets?${params}`),
      api.get('/auth/staff-list'),
    ]).then(([ticketsRes, staffRes]) => {
      setTickets(ticketsRes.data.tickets);
      setTotalPages(ticketsRes.data.totalPages);
      setTotal(ticketsRes.data.total);
      setStaff(staffRes.data.staff);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, filters]);

  const handleAssign = async (ticketId) => {
    const staffId = selectedStaff[ticketId];
    if (!staffId) return toast.error('Please select a staff member');
    setAssigningId(ticketId);
    try {
      await api.put(`/tickets/${ticketId}/assign`, { assignedTo: staffId });
      toast.success('Ticket assigned successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign');
    } finally {
      setAssigningId(null);
    }
  };

  const handleFilterChange = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Tickets</h1>
        <p className="text-gray-500 text-sm">{total} tickets total</p>
      </div>

      <div className="card p-4">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9 text-sm" placeholder="Search tickets..."
              value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
          </div>
          <button onClick={() => setShowFilters(s => !s)} className={`btn-secondary btn-sm ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}>
            <Filter size={14} /> Filters
          </button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-2">
            {[['status', ['reported','assigned','in_progress','resolved','closed'], 'All Statuses'],
              ['priority', ['low','medium','high','critical'], 'All Priorities'],
              ['category', ['electrical','plumbing','internet','cleaning','furniture','parking','security','hvac','other'], 'All Categories']
            ].map(([key, opts, ph]) => (
              <select key={key} className="input w-auto text-sm" value={filters[key]} onChange={e => handleFilterChange(key, e.target.value)}>
                <option value="">{ph}</option>
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

      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner className="py-16" />
        ) : tickets.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No tickets found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['ID','Title','Cat.','Priority','Status','Location','Reporter','Assigned To','Created','Actions'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tickets.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3">
                      <span className="font-mono text-blue-600 font-bold text-xs">{t.ticket_id}</span>
                      {t.sla_breached && <span className="block text-xs text-red-500">⚠ SLA</span>}
                    </td>
                    <td className="px-3 py-3 max-w-[160px]">
                      <p className="font-medium text-gray-900 truncate text-xs">{t.title}</p>
                    </td>
                    <td className="px-3 py-3"><CategoryBadge category={t.category} /></td>
                    <td className="px-3 py-3"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-3 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-3 py-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={10} />{t.location}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">{t.reporter_name}</td>
                    <td className="px-3 py-3">
                      {t.assignee_name ? (
                        <span className="text-xs text-gray-700 font-medium">{t.assignee_name}</span>
                      ) : (
                        <div className="flex items-center gap-1.5 min-w-[160px]">
                          <select className="input text-xs py-1 flex-1"
                            value={selectedStaff[t.id] || ''}
                            onChange={e => setSelectedStaff(s => ({ ...s, [t.id]: e.target.value }))}>
                            <option value="">Assign staff...</option>
                            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                          <button onClick={() => handleAssign(t.id)} disabled={assigningId === t.id}
                            className="btn-primary btn-sm shrink-0">
                            <UserCheck size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-3 py-3">
                      <Link to={`/tickets/${t.id}`} className="btn-secondary btn-sm"><Eye size={13} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
