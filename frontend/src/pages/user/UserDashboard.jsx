import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatCard from '../../components/ui/StatCard';
import { PlusCircle, Ticket, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function UserDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tickets?limit=5')
      .then(res => setTickets(res.data.tickets))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => ['reported','assigned'].includes(t.status)).length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => ['resolved','closed'].includes(t.status)).length,
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track and manage your reported issues</p>
        </div>
        <Link to="/tickets/new" className="btn-primary">
          <PlusCircle size={16} /> New Ticket
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tickets" value={stats.total} icon={Ticket} color="blue" />
        <StatCard title="Open" value={stats.open} icon={AlertTriangle} color="yellow" />
        <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="purple" />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="green" />
      </div>

      {/* Recent Tickets */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Tickets</h2>
          <Link to="/my-tickets" className="text-sm text-blue-600 hover:underline">View all →</Link>
        </div>

        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center">
            <Ticket size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No tickets yet</p>
            <Link to="/tickets/new" className="btn-primary mt-4 inline-flex">Report an Issue</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tickets.map(ticket => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-blue-600 font-semibold">{ticket.ticket_id}</span>
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <p className="font-medium text-gray-900 truncate group-hover:text-blue-600">{ticket.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ticket.location} · {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</p>
                </div>
                <StatusBadge status={ticket.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
