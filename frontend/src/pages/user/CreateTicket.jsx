import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Upload, X, MapPin, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'electrical', label: '⚡ Electrical' },
  { value: 'plumbing', label: '🔧 Plumbing' },
  { value: 'internet', label: '🌐 Internet / Network' },
  { value: 'cleaning', label: '🧹 Cleaning' },
  { value: 'furniture', label: '🪑 Furniture' },
  { value: 'parking', label: '🚗 Parking' },
  { value: 'security', label: '🔒 Security' },
  { value: 'hvac', label: '❄️ HVAC / AC' },
  { value: 'other', label: '📋 Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', desc: 'Non-urgent, can wait', color: 'border-green-200 bg-green-50 text-green-700' },
  { value: 'medium', label: 'Medium', desc: 'Needs attention soon', color: 'border-yellow-200 bg-yellow-50 text-yellow-700' },
  { value: 'high', label: 'High', desc: 'Urgently needs fixing', color: 'border-orange-200 bg-orange-50 text-orange-700' },
  { value: 'critical', label: 'Critical', desc: 'Safety hazard / immediate', color: 'border-red-200 bg-red-50 text-red-700' },
];

export default function CreateTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: '', priority: 'medium',
    location: '', building: '', floor: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Photo must be under 5MB');
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.location) {
      return toast.error('Please fill all required fields');
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => v && formData.append(k, v));
      if (photo) formData.append('photo', photo);

      const res = await api.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(`Ticket ${res.data.ticket.ticket_id} created successfully!`);
      navigate(`/tickets/${res.data.ticket.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Report New Issue</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to create a support ticket</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <button onClick={() => s < step && setStep(s)}
              className={`w-8 h-8 rounded-full text-sm font-semibold flex items-center justify-center transition-all ${
                s === step ? 'bg-blue-600 text-white' :
                s < step ? 'bg-green-500 text-white cursor-pointer' : 'bg-gray-200 text-gray-500'
              }`}>
              {s < step ? '✓' : s}
            </button>
            {s < 3 && <div className={`h-0.5 w-12 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
        <div className="ml-3 text-sm text-gray-500">
          {step === 1 ? 'Issue Details' : step === 2 ? 'Location & Priority' : 'Review & Submit'}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Details */}
        {step === 1 && (
          <div className="card p-6 space-y-5">
            <div>
              <label className="label">Issue Title <span className="text-red-500">*</span></label>
              <input type="text" required maxLength={200} className="input"
                placeholder="Brief description of the issue"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <p className="text-xs text-gray-400 mt-1">{form.title.length}/200 characters</p>
            </div>

            <div>
              <label className="label">Category <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.value} type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left ${
                      form.category === cat.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Description <span className="text-red-500">*</span></label>
              <textarea required rows={4} className="input resize-none"
                placeholder="Describe the issue in detail — what happened, when it started, and how it's affecting you..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div>
              <label className="label">Photo <span className="text-gray-400">(optional, max 5MB)</span></label>
              {photoPreview ? (
                <div className="relative inline-block">
                  <img src={photoPreview} alt="Preview" className="w-40 h-32 object-cover rounded-lg border" />
                  <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <Upload size={20} className="text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500">Click to upload photo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </label>
              )}
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={() => {
                if (!form.title || !form.description || !form.category)
                  return toast.error('Please fill title, category and description');
                setStep(2);
              }} className="btn-primary">
                Next: Location →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Location & Priority */}
        {step === 2 && (
          <div className="card p-6 space-y-5">
            <div>
              <label className="label"><MapPin size={14} className="inline mr-1" />Location <span className="text-red-500">*</span></label>
              <input type="text" required className="input"
                placeholder="e.g. Library, Lab 3, Cafeteria, Block A"
                value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Building</label>
                <input type="text" className="input" placeholder="e.g. Main Block, Tower B"
                  value={form.building} onChange={e => setForm(f => ({ ...f, building: e.target.value }))} />
              </div>
              <div>
                <label className="label">Floor</label>
                <input type="text" className="input" placeholder="e.g. Ground, 2nd"
                  value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="label">Priority <span className="text-red-500">*</span></label>
              <div className="space-y-2">
                {PRIORITIES.map(p => (
                  <label key={p.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      form.priority === p.value ? p.color + ' border-current' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input type="radio" name="priority" value={p.value} checked={form.priority === p.value}
                      onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="sr-only" />
                    <div className="flex-1">
                      <span className="font-semibold text-sm">{p.label}</span>
                      <span className="text-xs ml-2 opacity-75">— {p.desc}</span>
                    </div>
                    {form.priority === p.value && <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-current" /></div>}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">← Back</button>
              <button type="button" onClick={() => {
                if (!form.location) return toast.error('Location is required');
                setStep(3);
              }} className="btn-primary">
                Next: Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <AlertCircle size={18} />
              <span className="font-semibold">Review your ticket before submitting</span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div><span className="text-gray-500">Title:</span> <span className="font-medium text-gray-900">{form.title}</span></div>
                <div><span className="text-gray-500">Category:</span> <span className="font-medium text-gray-900 capitalize">{form.category}</span></div>
                <div><span className="text-gray-500">Priority:</span> <span className="font-medium text-gray-900 capitalize">{form.priority}</span></div>
                <div><span className="text-gray-500">Location:</span> <span className="font-medium text-gray-900">{form.location}</span></div>
                {form.building && <div><span className="text-gray-500">Building:</span> <span className="font-medium">{form.building}</span></div>}
                {form.floor && <div><span className="text-gray-500">Floor:</span> <span className="font-medium">{form.floor}</span></div>}
              </div>
              <div><span className="text-gray-500">Description:</span>
                <p className="font-medium text-gray-900 mt-1">{form.description}</p>
              </div>
              {photoPreview && (
                <div><span className="text-gray-500">Photo:</span>
                  <img src={photoPreview} alt="Preview" className="w-24 h-20 object-cover rounded mt-1" />
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary">← Back</button>
              <button type="submit" disabled={loading} className="btn-primary btn-lg">
                {loading ? 'Submitting...' : '🚀 Submit Ticket'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
