import { useEffect, useMemo, useState } from 'react';

import FailureTrendChart from '../charts/FailureTrendChart';
import RiskHistoryChart from '../charts/RiskHistoryChart';
import { getDeployments, getPredictions } from '../services/platformService';

export default function DeploymentAnalyticsPage() {
  const [deployments, setDeployments] = useState([]);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    Promise.all([getDeployments(), getPredictions()])
      .then(([deploymentsData, predictionsData]) => {
        setDeployments(deploymentsData);
        setPredictions(predictionsData);
      })
      .catch(() => null);
  }, []);

  const criticalCount = useMemo(
    () => predictions.filter((item) => item.riskLevel === 'CRITICAL').length,
    [predictions]
  );

  const highCount = useMemo(() => predictions.filter((item) => item.riskLevel === 'HIGH').length, [predictions]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-xs uppercase text-slate-500">Total Predictions</p>
          <p className="text-2xl font-semibold text-slate-900 mt-2">{predictions.length}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-xs uppercase text-slate-500">Critical Risk Events</p>
          <p className="text-2xl font-semibold text-red-600 mt-2">{criticalCount}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-xs uppercase text-slate-500">High Risk Events</p>
          <p className="text-2xl font-semibold text-orange-600 mt-2">{highCount}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <FailureTrendChart predictions={predictions} />
        <RiskHistoryChart deployments={deployments} />
      </div>
    </div>
  );
}
