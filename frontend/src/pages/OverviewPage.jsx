import { useEffect, useMemo, useState } from 'react';

import MetricCard from '../components/MetricCard';
import RecommendationPanel from '../components/RecommendationPanel';
import FailureTrendChart from '../charts/FailureTrendChart';
import RiskHistoryChart from '../charts/RiskHistoryChart';
import LiveMonitoringChart from '../charts/LiveMonitoringChart';
import { getDeployments, getMetrics, getPredictions } from '../services/platformService';

export default function OverviewPage() {
  const [deployments, setDeployments] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [deploymentsData, metricsData, predictionsData] = await Promise.all([
          getDeployments(),
          getMetrics(),
          getPredictions()
        ]);
        setDeployments(deploymentsData);
        setMetrics(metricsData);
        setPredictions(predictionsData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      }
    }

    fetchData();
  }, []);

  const highRiskCount = useMemo(
    () => deployments.filter((item) => ['HIGH', 'CRITICAL'].includes(item.lastRiskLevel)).length,
    [deployments]
  );

  const avgCpu = useMemo(() => {
    if (!metrics.length) return 0;
    return (metrics.reduce((sum, item) => sum + Number(item.cpu || 0), 0) / metrics.length).toFixed(2);
  }, [metrics]);

  const avgMemory = useMemo(() => {
    if (!metrics.length) return 0;
    return (metrics.reduce((sum, item) => sum + Number(item.memory || 0), 0) / metrics.length).toFixed(2);
  }, [metrics]);

  const recommendationList = useMemo(() => {
    const riskyPrediction = predictions.find((item) => ['HIGH', 'CRITICAL'].includes(item.riskLevel));
    if (!riskyPrediction) return [];
    return riskyPrediction.reasons.map((reason) => `Investigate: ${reason}`);
  }, [predictions]);

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard title="Active Deployments" value={deployments.length} hint="Tracked services in AKS" />
        <MetricCard title="High/Critical Risk" value={highRiskCount} hint="Requires action or approval" />
        <MetricCard title="Average CPU" value={`${avgCpu}%`} hint="From latest Prometheus samples" />
        <MetricCard title="Average Memory" value={`${avgMemory}%`} hint="Across monitored workloads" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <FailureTrendChart predictions={predictions} />
        <RiskHistoryChart deployments={deployments} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <LiveMonitoringChart metrics={metrics} />
        </div>
        <RecommendationPanel recommendations={recommendationList} />
      </div>
    </div>
  );
}
