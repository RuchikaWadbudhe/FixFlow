const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-100' },
  green:  { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  yellow: { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100' },
  red:    { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-100' },
  purple: { bg: 'bg-violet-50',  text: 'text-violet-600',  border: 'border-violet-100' },
  gray:   { bg: 'bg-slate-100',  text: 'text-slate-500',   border: 'border-slate-200' },
  orange: { bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-100' },
};

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, trend }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <div className="kpi-card">
      <div className={`kpi-icon ${c.bg} ${c.text} border ${c.border}`}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xs text-slate-500 font-medium truncate">{title}</p>
        <p className="text-xl font-bold text-slate-900 leading-tight mt-0.5">{value}</p>
        {subtitle && <p className="text-xxs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
