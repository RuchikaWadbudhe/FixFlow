import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  ArrowLeft, MapPin, Clock, User, MessageCircle, Star,
  AlertTriangle, CheckCircle, Send, Lock, Image
} from 'lucide-react';

const STATUS_STEPS = ['reported', 'assigned', 'in_progress', 'resolved', 'closed'];
const STEP_LABELS = { reported: 'Reported', assigned: 'Assigned', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' };

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [isInternal, setIsInternal] = useState(false);

  const fetchTicket = () => {
    api.get(`/tickets/${id}`)
      .then(res => {
        setTicket(res.data.ticket);
        setComments(res.data.comments);
      })
      .catch(() => { toast.error('Ticket not found'); navigate(-1); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTicket(); }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/tickets/${ticket.id}/comments`, { content: comment, isInternal });
      setComments(c => [...c, res.data.comment]);
      setComment('');
      toast.success('Comment added');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.put(`/tickets/${ticket.id}/status`, { status: newStatus });
      setTicket(res.data.ticket);
      fetchTicket();
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleRating = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Please select a rating');
    try {
      const res = await api.post(`/tickets/${ticket.id}/rate`, { rating, comment: ratingComment });
      setTicket(res.data.ticket);
      setShowRating(false);
      toast.success('Thank you for your feedback!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit rating');
    }
  };

  if (loading) return <LoadingSpinner className="py-20" />;
  if (!ticket) return null;

  const currentStep = STATUS_STEPS.indexOf(ticket.status);
  const canRate = user.role === 'user' && ['resolved', 'closed'].includes(ticket.status) && !ticket.rating;
  const isStaffOrAdmin = ['staff', 'admin'].includes(user.role);

  return (
    <div className="max-w-3xl fade-in">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary btn-sm">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{ticket.ticket_id}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            {ticket.sla_breached && <span className="badge bg-red-100 text-red-700 text-xs">⚠ SLA Breached</span>}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1 truncate">{ticket.title}</h1>
        </div>
      </div>

      <div className="space-y-5">
        {/* Progress Tracker */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Ticket Progress</h3>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, idx) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`flex flex-col items-center ${idx < STATUS_STEPS.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    idx < currentStep ? 'bg-green-500 border-green-500 text-white' :
                    idx === currentStep ? 'bg-blue-600 border-blue-600 text-white' :
                    'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {idx < currentStep ? '✓' : idx + 1}
                  </div>
                  <span className={`text-xs mt-1 text-center ${idx === currentStep ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                    {STEP_LABELS[step]}
                  </span>
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mb-5 mx-1 ${idx < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Issue Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin size={15} className="mt-0.5 text-gray-400 shrink-0" />
              <div><p className="text-xs text-gray-400">Location</p><p className="font-medium text-gray-900">{ticket.location}{ticket.building && ` · ${ticket.building}`}{ticket.floor && `, Floor ${ticket.floor}`}</p></div>
            </div>
            <div className="flex items-start gap-2 text-gray-600">
              <Clock size={15} className="mt-0.5 text-gray-400 shrink-0" />
              <div><p className="text-xs text-gray-400">Reported</p><p className="font-medium text-gray-900">{format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')}</p></div>
            </div>
            <div className="flex items-start gap-2 text-gray-600">
              <User size={15} className="mt-0.5 text-gray-400 shrink-0" />
              <div><p className="text-xs text-gray-400">Reported by</p><p className="font-medium text-gray-900">{ticket.reporter_name}</p></div>
            </div>
            {ticket.assignee_name && (
              <div className="flex items-start gap-2 text-gray-600">
                <User size={15} className="mt-0.5 text-blue-400 shrink-0" />
                <div><p className="text-xs text-gray-400">Assigned to</p><p className="font-medium text-gray-900">{ticket.assignee_name}</p></div>
              </div>
            )}
            <div className="sm:col-span-2">
              <CategoryBadge category={ticket.category} />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Description</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {ticket.photo_url && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Image size={12} /> Photo</p>
              <img src={`${import.meta.env.VITE_API_URL?.replace('/api','')}${ticket.photo_url}`} alt="Issue" className="max-w-xs rounded-lg border" />
            </div>
          )}

          {ticket.resolution_notes && (
            <div className="mt-4 pt-4 border-t border-gray-100 bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-600 font-semibold mb-1 flex items-center gap-1"><CheckCircle size={12} /> Resolution Notes</p>
              <p className="text-sm text-green-800">{ticket.resolution_notes}</p>
              {ticket.resolution_proof_url && (
                <img src={`${import.meta.env.VITE_API_URL?.replace('/api','')}${ticket.resolution_proof_url}`} alt="Resolution proof" className="max-w-xs rounded-lg border mt-2" />
              )}
            </div>
          )}

          {/* SLA */}
          {ticket.sla_deadline && !['resolved','closed'].includes(ticket.status) && (
            <div className={`mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm ${ticket.sla_breached ? 'text-red-600' : 'text-orange-600'}`}>
              <AlertTriangle size={15} />
              <span>SLA deadline: {format(new Date(ticket.sla_deadline), 'MMM d, yyyy h:mm a')}</span>
              {ticket.sla_breached && <span className="badge bg-red-100 text-red-700">Breached</span>}
            </div>
          )}
        </div>

        {/* Staff actions */}
        {isStaffOrAdmin && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              {ticket.status === 'reported' && (
                <button onClick={() => handleStatusChange('in_progress')} className="btn-primary btn-sm">Mark In Progress</button>
              )}
              {ticket.status === 'assigned' && (
                <button onClick={() => handleStatusChange('in_progress')} className="btn-primary btn-sm">Start Working</button>
              )}
              {ticket.status === 'in_progress' && (
                <button onClick={() => handleStatusChange('resolved')} className="btn-success btn-sm">Mark Resolved</button>
              )}
              {ticket.status === 'resolved' && (
                <button onClick={() => handleStatusChange('closed')} className="btn-secondary btn-sm">Close Ticket</button>
              )}
            </div>
          </div>
        )}

        {/* Rating */}
        {ticket.rating ? (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Rating</h3>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={20} className={s <= ticket.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
              ))}
              <span className="text-sm text-gray-500 ml-2">{ticket.rating}/5</span>
            </div>
            {ticket.rating_comment && <p className="text-sm text-gray-600 mt-1 italic">"{ticket.rating_comment}"</p>}
          </div>
        ) : canRate && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Rate this Resolution</h3>
            {!showRating ? (
              <button onClick={() => setShowRating(true)} className="btn-secondary btn-sm">
                <Star size={14} /> Rate Resolution
              </button>
            ) : (
              <form onSubmit={handleRating} className="space-y-3">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setRating(s)}>
                      <Star size={28} className={`${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'} transition-colors`} />
                    </button>
                  ))}
                </div>
                <textarea rows={2} className="input resize-none" placeholder="Optional comment..."
                  value={ratingComment} onChange={e => setRatingComment(e.target.value)} />
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary btn-sm">Submit</button>
                  <button type="button" onClick={() => setShowRating(false)} className="btn-secondary btn-sm">Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Comments */}
        <div className="card">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle size={16} /> Activity & Comments
            </h3>
          </div>

          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No comments yet</p>
            ) : comments.map(c => (
              <div key={c.id} className={`px-5 py-4 ${c.is_internal ? 'bg-yellow-50' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    c.author_role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    c.author_role === 'staff' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {c.author_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{c.author_name}</span>
                      <span className="text-xs text-gray-400">{format(new Date(c.created_at), 'MMM d, h:mm a')}</span>
                      {c.is_internal && <span className="badge bg-yellow-100 text-yellow-700 text-xs flex items-center gap-0.5"><Lock size={9} /> Internal</span>}
                      {c.type === 'status_change' && <span className="badge bg-blue-50 text-blue-600 text-xs">Status change</span>}
                    </div>
                    <p className="text-sm text-gray-700">{c.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add comment */}
          <div className="p-5 border-t border-gray-100">
            <form onSubmit={handleComment} className="space-y-2">
              {isStaffOrAdmin && (
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} />
                  <Lock size={12} /> Internal note (hidden from reporter)
                </label>
              )}
              <div className="flex gap-2">
                <input type="text" className="input flex-1" placeholder="Add a comment..."
                  value={comment} onChange={e => setComment(e.target.value)} />
                <button type="submit" disabled={!comment.trim() || submitting} className="btn-primary">
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
