import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Overview' },
  { to: '/cluster-health', label: 'Cluster Health' },
  { to: '/deployments', label: 'Active Deployments' },
  { to: '/risk-score', label: 'Risk Score' },
  { to: '/analytics', label: 'Deployment Analytics' },
  { to: '/incidents', label: 'Incident Reports' }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-full lg:w-64 shrink-0 rounded-xl bg-slate-900 text-white p-4 lg:min-h-[calc(100vh-2rem)]">
      <h1 className="text-lg font-bold">AIOps Gatekeeper</h1>
      <p className="text-xs text-slate-300 mt-1">AI Deployment Failure Prediction System</p>
      <nav className="mt-6 space-y-2">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                active ? 'bg-brand-500 text-white' : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
