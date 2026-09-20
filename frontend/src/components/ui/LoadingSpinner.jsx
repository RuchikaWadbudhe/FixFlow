export default function LoadingSpinner({ size = 'md', className = '' }) {
  const s = { sm: 16, md: 24, lg: 36 }[size];
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className="animate-spin text-blue-600">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-slate-400 text-2xs">Loading…</p>
      </div>
    </div>
  );
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-3 py-3 border-b border-slate-100">
          <div className="skeleton h-3.5 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-4 space-y-3">
      <div className="skeleton h-3 w-1/3 rounded" />
      <div className="skeleton h-7 w-1/2 rounded" />
      <div className="skeleton h-2.5 w-2/3 rounded" />
    </div>
  );
}
