import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  ArrowLeft, MapPin, Clock, User, MessageCircle, Star,
  AlertTriangle, CheckCircle2, Send, Lock, Image,
  ChevronRight, Calendar, Timer
} from 'lucide-react';

const STATUS_STEPS = ['reported','assigned','in_progress','resolved','closed'];
const STEP_LABELS  = { reported:'Reported', assigned:'Assigned', in_progress:'In Progress', resolved:'Resolved', closed:'Closed' };

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000';

function ActivityItem({ c }) {
  const isSystem = c.type === 'status_change' || c.type === 'assignment';
  return (
    <div className={`flex gap-3 py-3 ${c.is_internal ? 'bg-amber-50/60 px-4 -mx-4 rounded-lg' : ''}`}>
      {isSystem ? (
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
          <ChevronRight size={10} className="text-blue-600" />
        </div>
      ) : (
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xxs font-bold shrink-0 mt-0.5 ${
          c.author_role === 'admin' ? 'bg-violet-100 text-violet-700' :
          c.author_role === 'staff' ? 'bg-blue-100 text-blue-700' :
          'bg-slate-100 text-slate-600'
        }`}>
          {c.author_name?.[0]?.toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-2xs font-semibold text-slate-800">{c.author_name}</span>
          <span className="text-xxs text-slate-400">{format(new Date(c.created_at), 'MMM d, h:mm a')}</span>
          {c.is_internal && (
            <span className="badge bg-amber-100 text-amber-700 gap-0.5">
              <Lock size={8} /> Internal
            </span>
          )}
          {isSystem && <span className="badge bg-blue-50 text-blue-600">System</span>}
        </div>
        <p className="text-2xs text-slate-600">{c.content}</p>
      </div>
    </div>
  );
}

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [showRating, setShowRating] = useState(false);

  const fetchTicket = () => {
    api.get(`/tickets/${id}`)
      .then(r => { setTicket(r.data.ticket); setComments(r.data.comments); })
      .catch(() => { toast.error('Ticket not found'); navigate(-1); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTicket(); }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const r = await api.post(`/tickets/${ticket.id}/comments`, { content: comment, isInternal });
      setComments(c => [...c, r.data.comment]);
      setComment('');
      toast.success('Comment added');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally { setSubmitting(false); }
  };

  const handleStatus = async (status) => {
    try {
      await api.put(`/tickets/${ticket.id}/status`, { status });
      fetchTicket();
      toast.success(`Status → ${status.replace('_',' ')}`);
    } catch (err) { toast.error('Failed'); }
  };

  const handleRating = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Select a rating');
    try {
      const r = await api.post(`/tickets/${ticket.id}/rate`, { rating, comment: ratingComment });
      setTicket(r.data.ticket);
      setShowRating(false);
      toast.success('Thank you for your feedback!');
    } catch (err) { toast.error('Failed'); }
  };

  if (loading) return <LoadingSpinner className="py-24" />;
  if (!ticket) return null;

  const currentStep = STATUS_STEPS.indexOf(ticket.status);
  const isStaff = ['staff','admin'].includes(user.role);
  const canRate  = user.role === 'user' && ['resolved','closed'].includes(ticket.status) && !ticket.rating;

  return (
    <div className="max-w-3xl fade-in space-y-4">
      {/* Back + title */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary btn-sm mt-0.5 shrink-0">
          <ArrowLeft size={13} /> Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="font-mono text-[#1a56db] font-bold text-xxs bg-blue-50 px-1.5 py-0.5 rounded">
              {ticket.ticket_id}
            </span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <CategoryBadge category={ticket.category} />
            {ticket.sla_breached && (
              <span className="badge bg-red-50 text-red-600 border border-red-200">⚠ SLA Breached</span>
            )}
          </div>
          <h1 className="text-slate-900 font-semibold" style={{fontSize:16}}>{ticket.title}</h1>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card p-4">
        <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Progress</p>
        <div className="flex items-center">
          {STATUS_STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xxs font-bold border-2 transition-all ${
                  i < currentStep  ? 'bg-emerald-500 border-emerald-500 text-white' :
                  i === currentStep ? 'bg-[#1a56db] border-[#1a56db] text-white' :
                  'bg-white border-slate-200 text-slate-400'
                }`}>
                  {i < currentStep ? <CheckCircle2 size={14} /> : i+1}
                </div>
                <span className={`text-xxs text-center leading-tight ${i === currentStep ? 'text-[#1a56db] font-semibold' : 'text-slate-400'}`}>
                  {STEP_LABELS[s]}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < currentStep ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main details */}
        <div className="md:col-span-2 space-y-4">
          <div className="card p-4 space-y-3">
            <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wide">Details</p>
            <div className="grid grid-cols-2 gap-3 text-2xs">
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-400 text-xxs">Location</p>
                  <p className="text-slate-800 font-medium">
                    {ticket.location}{ticket.building ? ` · ${ticket.building}` : ''}{ticket.floor ? `, ${ticket.floor}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar size={13} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-400 text-xxs">Reported</p>
                  <p className="text-slate-800 font-medium">{format(new Date(ticket.created_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User size={13} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-400 text-xxs">Reporter</p>
                  <p className="text-slate-800 font-medium">{ticket.reporter_name}</p>
                </div>
              </div>
              {ticket.assignee_name && (
                <div className="flex items-start gap-2">
                  <User size={13} className="text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-400 text-xxs">Assigned to</p>
                    <p className="text-slate-800 font-medium">{ticket.assignee_name}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-slate-400 text-xxs mb-1">Description</p>
              <p className="text-2xs text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>
            {ticket.photo_url && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-slate-400 text-xxs mb-1.5 flex items-center gap-1"><Image size={11} /> Photo</p>
                <img src={`${BASE_URL}${ticket.photo_url}`} alt="Issue" className="max-w-xs rounded-lg border border-slate-200" />
              </div>
            )}
          </div>

          {/* Resolution */}
          {ticket.resolution_notes && (
            <div className="card p-4 border-emerald-200 bg-emerald-50/40">
              <p className="text-2xs font-semibold text-emerald-700 flex items-center gap-1.5 mb-2">
                <CheckCircle2 size={13} /> Resolution
              </p>
              <p className="text-2xs text-emerald-800">{ticket.resolution_notes}</p>
              {ticket.resolution_proof_url && (
                <img src={`${BASE_URL}${ticket.resolution_proof_url}`} alt="proof"
                  className="mt-2 max-w-xs rounded-lg border border-emerald-200" />
              )}
            </div>
          )}

          {/* Comments */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <MessageCircle size={14} className="text-slate-500" />
              <p className="section-title">Activity</p>
            </div>
            <div className="px-4 divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-center text-slate-400 text-2xs py-8">No activity yet</p>
              ) : comments.map(c => <ActivityItem key={c.id} c={c} />)}
            </div>
            <div className="px-4 py-3 border-t border-slate-100">
              {isStaff && (
                <label className="flex items-center gap-2 text-2xs text-slate-500 mb-2 cursor-pointer">
                  <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-amber-500" />
                  <Lock size={11} /> Internal note
                </label>
              )}
              <form onSubmit={handleComment} className="flex gap-2">
                <input type="text" className="input flex-1"
                  placeholder={isInternal ? 'Internal note…' : 'Add a comment…'}
                  value={comment} onChange={e => setComment(e.target.value)} />
                <button type="submit" disabled={!comment.trim() || submitting} className="btn-primary btn-icon">
                  <Send size={13} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* SLA */}
          {ticket.sla_deadline && !['resolved','closed'].includes(ticket.status) && (
            <div className={`card p-4 ${ticket.sla_breached ? 'border-red-200 bg-red-50/30' : 'border-orange-200 bg-orange-50/30'}`}>
              <p className={`text-2xs font-semibold flex items-center gap-1.5 ${ticket.sla_breached ? 'text-red-700' : 'text-orange-700'}`}>
                <Timer size={13} /> SLA Deadline
              </p>
              <p className={`text-2xs mt-1 ${ticket.sla_breached ? 'text-red-600' : 'text-orange-600'}`}>
                {format(new Date(ticket.sla_deadline), 'MMM d, yyyy h:mm a')}
              </p>
              {ticket.sla_breached && <p className="text-xxs text-red-500 mt-0.5 font-medium">Deadline passed</p>}
            </div>
          )}

          {/* Staff quick actions */}
          {isStaff && (
            <div className="card p-4">
              <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick actions</p>
              <div className="space-y-1.5">
                {ticket.status === 'reported'    && <button onClick={() => handleStatus('in_progress')} className="btn-primary btn-sm w-full">Start working</button>}
                {ticket.status === 'assigned'    && <button onClick={() => handleStatus('in_progress')} className="btn-primary btn-sm w-full">Mark in progress</button>}
                {ticket.status === 'in_progress' && <button onClick={() => handleStatus('resolved')}    className="btn-success btn-sm w-full">Mark resolved</button>}
                {ticket.status === 'resolved'    && <button onClick={() => handleStatus('closed')}      className="btn-secondary btn-sm w-full">Close ticket</button>}
              </div>
            </div>
          )}

          {/* Rating */}
          {ticket.rating ? (
            <div className="card p-4">
              <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Rating</p>
              <div className="flex gap-0.5 mb-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={16} className={s <= ticket.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                ))}
              </div>
              {ticket.rating_comment && <p className="text-2xs text-slate-500 italic">"{ticket.rating_comment}"</p>}
            </div>
          ) : canRate && (
            <div className="card p-4">
              <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Rate resolution</p>
              {!showRating ? (
                <button onClick={() => setShowRating(true)} className="btn-secondary btn-sm w-full">
                  <Star size={13} /> Leave feedback
                </button>
              ) : (
                <form onSubmit={handleRating} className="space-y-3">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setRating(s)}>
                        <Star size={22} className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 hover:text-amber-300 transition-colors'} />
                      </button>
                    ))}
                  </div>
                  <textarea rows={2} className="input" placeholder="Optional comment…"
                    value={ratingComment} onChange={e => setRatingComment(e.target.value)} />
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary btn-sm flex-1">Submit</button>
                    <button type="button" onClick={() => setShowRating(false)} className="btn-secondary btn-sm">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
