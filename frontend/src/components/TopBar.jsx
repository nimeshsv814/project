import { useAuth } from '../hooks/useAuth';

export default function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-white p-4 shadow">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Deployment Intelligence Dashboard</h2>
        <p className="text-sm text-slate-500">Monitor release risk and automate remediation on AKS</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.role}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
