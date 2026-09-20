export const STATUS_LABELS = {
  reported: 'Reported', assigned: 'Assigned', in_progress: 'In Progress',
  resolved: 'Resolved', closed: 'Closed',
};

export function StatusBadge({ status }) {
  return <span className={`status-${status}`}>{STATUS_LABELS[status] || status}</span>;
}

export function PriorityBadge({ priority }) {
  const labels = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
  return <span className={`priority-${priority}`}>{labels[priority] || priority}</span>;
}

export function CategoryBadge({ category }) {
  const labels = {
    electrical: 'Electrical', plumbing: 'Plumbing', internet: 'Internet',
    cleaning: 'Cleaning', furniture: 'Furniture', parking: 'Parking',
    security: 'Security', hvac: 'HVAC', other: 'Other',
  };
  return <span className="category-badge">{labels[category] || category}</span>;
}
