export const STATUS_STYLES = {
  reported:    'bg-yellow-100 text-yellow-800',
  assigned:    'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  resolved:    'bg-green-100 text-green-800',
  closed:      'bg-gray-100 text-gray-600',
};

export const PRIORITY_STYLES = {
  low:      'bg-green-100 text-green-700',
  medium:   'bg-yellow-100 text-yellow-700',
  high:     'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export const STATUS_LABELS = {
  reported:    'Reported',
  assigned:    'Assigned',
  in_progress: 'In Progress',
  resolved:    'Resolved',
  closed:      'Closed',
};

export function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const labels = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
  return (
    <span className={`badge ${PRIORITY_STYLES[priority] || 'bg-gray-100 text-gray-600'}`}>
      {labels[priority] || priority}
    </span>
  );
}

export function CategoryBadge({ category }) {
  const labels = {
    electrical: 'Electrical', plumbing: 'Plumbing', internet: 'Internet',
    cleaning: 'Cleaning', furniture: 'Furniture', parking: 'Parking',
    security: 'Security', hvac: 'HVAC', other: 'Other',
  };
  return (
    <span className="badge bg-indigo-100 text-indigo-700">
      {labels[category] || category}
    </span>
  );
}
