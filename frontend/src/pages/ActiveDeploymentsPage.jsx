import { useEffect, useState } from 'react';

import RiskBadge from '../components/RiskBadge';
import { deploymentCheck, getDeployments } from '../services/platformService';
import { useAuth } from '../hooks/useAuth';

export default function ActiveDeploymentsPage() {
  const { user } = useAuth();
  const [deployments, setDeployments] = useState([]);
  const [checking, setChecking] = useState('');
  const [message, setMessage] = useState('');
  const canTriggerCheck = ['Admin', 'DevOps Engineer'].includes(user?.role);

  async function loadDeployments() {
    const data = await getDeployments();
    setDeployments(data);
  }

  useEffect(() => {
    loadDeployments().catch(() => {
      setMessage('Failed to load deployments');
    });
  }, []);

  async function onCheck(deploymentId) {
    setChecking(deploymentId);
    setMessage('');
    try {
      const result = await deploymentCheck(deploymentId);
      setMessage(
        `Deployment ${deploymentId}: risk ${result.failureProbability}% (${result.riskLevel}), decision: ${result.decision}`
      );
      await loadDeployments();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Deployment check failed');
    } finally {
      setChecking('');
    }
  }

  return (
    <div className="space-y-4">
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
      <section className="rounded-xl bg-white p-4 shadow overflow-auto">
        <h3 className="text-base font-semibold text-slate-800">Active Deployments</h3>
        <table className="mt-4 min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">Deployment</th>
              <th className="py-2">Service</th>
              <th className="py-2">Status</th>
              <th className="py-2">Risk</th>
              <th className="py-2">Score</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {deployments.map((item) => (
              <tr key={item._id} className="border-t border-slate-100">
                <td className="py-2">{item.name}</td>
                <td className="py-2">{item.service}</td>
                <td className="py-2">{item.status}</td>
                <td className="py-2">
                  <RiskBadge riskLevel={item.lastRiskLevel || 'LOW'} />
                </td>
                <td className="py-2">{item.lastRiskScore || 0}%</td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => onCheck(item.deploymentId)}
                    disabled={checking === item.deploymentId || !canTriggerCheck}
                    className="rounded-md bg-brand-600 px-3 py-1 text-white hover:bg-brand-700 disabled:opacity-70"
                  >
                    {!canTriggerCheck
                      ? 'Not allowed'
                      : checking === item.deploymentId
                        ? 'Checking...'
                        : 'Run Gate Check'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
