const colorMap = {
  LOW: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700'
};

export default function RiskBadge({ riskLevel }) {
  const style = colorMap[riskLevel] || 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${style}`}>{riskLevel}</span>;
}
