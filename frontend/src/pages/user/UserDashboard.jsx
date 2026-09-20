import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/LoadingSpinner';
import StatCard from '../../components/ui/StatCard';
import { PlusCircle, Ticket, Clock, CheckCircle, AlertTriangle, ArrowRight, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function UserDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tickets?limit=6')
      .then(r => setTickets(r.data.tickets))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total     = tickets.length;
  const open      = tickets.filter(t => ['reported','assigned'].includes(t.status)).length;
  const inProg    = tickets.filter(t => t.status === 'in_progress').length;
  const resolved  = tickets.filter(t => ['resolved','closed'].includes(t.status)).length;

  return (
    <div className="space-y-5 fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Good to see you, {user.name.split(' ')[0]} 👋</h1>
          <p className="page-sub">Here's an overview of your reported issues</p>
        </div>
        <Link to="/tickets/new" className="btn-primary shrink-0">
          <PlusCircle size={14} /> New ticket
        </Link>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? (
          Array.from({length:4}).map((_,i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Total tickets"  value={total}   icon={Ticket}        color="blue" />
            <StatCard title="Open"           value={open}    icon={AlertTriangle} color="yellow" />
            <StatCard title="In progress"    value={inProg}  icon={Clock}         color="purple" />
            <StatCard title="Resolved"       value={resolved} icon={CheckCircle}  color="green" />
          </>
        )}
      </div>

      {/* Recent tickets */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <p className="section-title">Recent tickets</p>
          <Link to="/my-tickets" className="btn-ghost btn-sm gap-1 text-[#1a56db]">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({length:4}).map((_,i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="skeleton h-3 w-16 rounded" />
                <div className="skeleton h-3 flex-1 rounded" />
                <div className="skeleton h-5 w-20 rounded-md" />
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Ticket size={20} /></div>
            <p className="text-slate-600 font-medium text-sm">No tickets yet</p>
            <p className="text-slate-400 text-2xs mt-1">Create your first ticket to get started</p>
            <Link to="/tickets/new" className="btn-primary btn-sm mt-4">Report an issue</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tickets.map(ticket => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/70 transition-colors group"
              >
                <span className="font-mono text-[#1a56db] font-semibold text-xxs bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                  {ticket.ticket_id}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-2xs font-medium text-slate-800 truncate group-hover:text-[#1a56db] transition-colors">
                    {ticket.title}
                  </p>
                  <p className="text-xxs text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                    <MapPin size={10} className="shrink-0" />
                    {ticket.location} · {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
