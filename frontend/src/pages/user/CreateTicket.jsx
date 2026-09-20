import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Upload, X, MapPin, ChevronRight, Check } from 'lucide-react';

const CATEGORIES = [
  { value: 'electrical', emoji: '⚡', label: 'Electrical' },
  { value: 'plumbing',   emoji: '🔧', label: 'Plumbing' },
  { value: 'internet',   emoji: '🌐', label: 'Internet' },
  { value: 'cleaning',   emoji: '🧹', label: 'Cleaning' },
  { value: 'furniture',  emoji: '🪑', label: 'Furniture' },
  { value: 'parking',    emoji: '🚗', label: 'Parking' },
  { value: 'security',   emoji: '🔒', label: 'Security' },
  { value: 'hvac',       emoji: '❄️', label: 'HVAC' },
  { value: 'other',      emoji: '📋', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low',      label: 'Low',      desc: 'No urgency',            dot: 'bg-slate-400' },
  { value: 'medium',   label: 'Medium',   desc: 'Needs attention soon',  dot: 'bg-amber-400' },
  { value: 'high',     label: 'High',     desc: 'Urgently needs fixing', dot: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', desc: 'Safety hazard',         dot: 'bg-red-500' },
];

const STEPS = ['Details', 'Location', 'Review'];

export default function CreateTicket() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '', description: '', category: '', priority: 'medium',
    location: '', building: '', floor: '',
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error('Photo must be under 5MB');
    setPhoto(f);
    setPreview(URL.createObjectURL(f));
  };

  const nextStep = () => {
    if (step === 0) {
      if (!form.title.trim()) return toast.error('Issue title is required');
      if (!form.category) return toast.error('Select a category');
      if (!form.description.trim()) return toast.error('Description is required');
    }
    if (step === 1) {
      if (!form.location.trim()) return toast.error('Location is required');
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (photo) fd.append('photo', photo);
      const res = await api.post('/tickets', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`Ticket ${res.data.ticket.ticket_id} created`);
      navigate(`/tickets/${res.data.ticket.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl fade-in">
      {/* Page header */}
      <div className="mb-5">
        <h1 className="page-title">Report an issue</h1>
        <p className="page-sub">Fill in the details to create a support ticket</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-6">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-1.5 transition-colors ${
                i < step ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xxs font-bold transition-all ${
                i < step  ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-[#1a56db] text-white' :
                'bg-slate-200 text-slate-500'
              }`}>
                {i < step ? <Check size={11} /> : i + 1}
              </div>
              <span className={`text-2xs font-medium ${i === step ? 'text-slate-900' : 'text-slate-400'}`}>
                {label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px mx-2 ${i < step ? 'bg-emerald-300' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0 — Details */}
      {step === 0 && (
        <div className="card p-5 space-y-4">
          <div className="input-group">
            <label className="label">Issue title <span className="text-red-500">*</span></label>
            <input type="text" maxLength={200} className="input"
              placeholder="Brief one-line description of the problem"
              value={form.title} onChange={e => set('title', e.target.value)} />
            <p className="hint">{form.title.length}/200</p>
          </div>

          <div className="input-group">
            <label className="label">Category <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map(cat => (
                <button key={cat.value} type="button"
                  onClick={() => set('category', cat.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-left transition-all ${
                    form.category === cat.value
                      ? 'border-[#1a56db] bg-blue-50 text-[#1a56db]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  style={{ fontSize: 12 }}
                >
                  <span>{cat.emoji}</span>
                  <span className="font-medium truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="label">Description <span className="text-red-500">*</span></label>
            <textarea rows={4} className="input"
              placeholder="Describe what happened, when it started, and how it's affecting you…"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div className="input-group">
            <label className="label">Photo <span className="text-slate-400 font-normal">— optional, max 5 MB</span></label>
            {preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="preview" className="h-28 w-auto rounded-lg border border-slate-200 object-cover" />
                <button type="button" onClick={() => { setPhoto(null); setPreview(null); }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                  <X size={10} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all">
                <Upload size={16} className="text-slate-400 mb-1" />
                <span className="text-2xs text-slate-400">Click to upload</span>
                <input type="file" className="hidden" accept="image/*" onChange={handlePhoto} />
              </label>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button type="button" onClick={nextStep} className="btn-primary">
              Next: Location <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Step 1 — Location & Priority */}
      {step === 1 && (
        <div className="card p-5 space-y-4">
          <div className="input-group">
            <label className="label"><MapPin size={12} className="inline mr-1" />Location <span className="text-red-500">*</span></label>
            <input type="text" className="input"
              placeholder="e.g. Library, Lab 3, Cafeteria, Block A"
              value={form.location} onChange={e => set('location', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="input-group">
              <label className="label">Building</label>
              <input type="text" className="input" placeholder="e.g. Main Block"
                value={form.building} onChange={e => set('building', e.target.value)} />
            </div>
            <div className="input-group">
              <label className="label">Floor</label>
              <input type="text" className="input" placeholder="e.g. Ground, 2nd"
                value={form.floor} onChange={e => set('floor', e.target.value)} />
            </div>
          </div>

          <div className="input-group">
            <label className="label">Priority <span className="text-red-500">*</span></label>
            <div className="space-y-1.5">
              {PRIORITIES.map(p => (
                <label key={p.value}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                    form.priority === p.value
                      ? 'border-[#1a56db] bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}>
                  <input type="radio" name="priority" value={p.value} className="sr-only"
                    checked={form.priority === p.value} onChange={() => set('priority', p.value)} />
                  <div className={`w-2 h-2 rounded-full shrink-0 ${p.dot}`} />
                  <span className="text-2xs font-semibold text-slate-800">{p.label}</span>
                  <span className="text-xxs text-slate-400 ml-auto">{p.desc}</span>
                  {form.priority === p.value && <Check size={13} className="text-[#1a56db] shrink-0" />}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={() => setStep(0)} className="btn-secondary">← Back</button>
            <button type="button" onClick={nextStep} className="btn-primary">
              Review <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Review */}
      {step === 2 && (
        <div className="card p-5 space-y-4">
          <p className="text-2xs text-slate-500 font-medium uppercase tracking-wide">Review before submitting</p>

          <div className="bg-slate-50 rounded-lg border border-slate-200 divide-y divide-slate-100">
            {[
              ['Title',       form.title],
              ['Category',    form.category],
              ['Priority',    form.priority],
              ['Location',    form.location],
              form.building && ['Building', form.building],
              form.floor    && ['Floor',    form.floor],
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} className="flex gap-3 px-3 py-2.5 text-2xs">
                <span className="text-slate-400 w-20 shrink-0">{k}</span>
                <span className="text-slate-800 font-medium capitalize">{v}</span>
              </div>
            ))}
            <div className="px-3 py-2.5 text-2xs">
              <span className="text-slate-400 block mb-1">Description</span>
              <span className="text-slate-800">{form.description}</span>
            </div>
            {preview && (
              <div className="px-3 py-2.5">
                <span className="text-2xs text-slate-400 block mb-1.5">Photo</span>
                <img src={preview} alt="preview" className="h-20 rounded-lg border border-slate-200 object-cover" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary">← Back</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary btn-lg">
              {loading ? 'Submitting…' : 'Submit ticket'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
