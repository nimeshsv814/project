import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-4">
        <Sidebar />
        <main className="flex-1 space-y-4">
          <TopBar />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
