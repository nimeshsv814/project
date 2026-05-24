import { useEffect, useState } from 'react';

import LiveMonitoringChart from '../charts/LiveMonitoringChart';
import { getMetrics } from '../services/platformService';

export default function ClusterHealthPage() {
  const [metrics, setMetrics] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await getMetrics();
        setMetrics(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch cluster health metrics');
      }
    }

    loadMetrics();
  }, []);

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <LiveMonitoringChart metrics={metrics} />
      <section className="rounded-xl bg-white p-4 shadow overflow-auto">
        <h3 className="text-base font-semibold text-slate-800">Latest Cluster Metrics</h3>
        <table className="mt-3 min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">Service</th>
              <th className="py-2">CPU</th>
              <th className="py-2">Memory</th>
              <th className="py-2">Restarts</th>
              <th className="py-2">Node Utilization</th>
              <th className="py-2">Response Time</th>
            </tr>
          </thead>
          <tbody>
            {metrics.slice(0, 20).map((item) => (
              <tr key={item._id} className="border-t border-slate-100">
                <td className="py-2">{item.service}</td>
                <td className="py-2">{item.cpu}%</td>
                <td className="py-2">{item.memory}%</td>
                <td className="py-2">{item.podRestarts}</td>
                <td className="py-2">{item.nodeUtilization}%</td>
                <td className="py-2">{item.responseTime} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
