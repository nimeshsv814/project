import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import ClusterHealthPage from './pages/ClusterHealthPage';
import ActiveDeploymentsPage from './pages/ActiveDeploymentsPage';
import RiskScorePage from './pages/RiskScorePage';
import DeploymentAnalyticsPage from './pages/DeploymentAnalyticsPage';
import IncidentReportsPage from './pages/IncidentReportsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="cluster-health" element={<ClusterHealthPage />} />
        <Route path="deployments" element={<ActiveDeploymentsPage />} />
        <Route path="risk-score" element={<RiskScorePage />} />
        <Route path="analytics" element={<DeploymentAnalyticsPage />} />
        <Route path="incidents" element={<IncidentReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
