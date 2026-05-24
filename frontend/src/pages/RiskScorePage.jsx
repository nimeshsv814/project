import { useEffect, useState } from 'react';

import RiskBadge from '../components/RiskBadge';
import RecommendationPanel from '../components/RecommendationPanel';
import { getPredictions, recommend } from '../services/platformService';
import { useAuth } from '../hooks/useAuth';

export default function RiskScorePage() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState('');
  const canRecommend = ['Admin', 'DevOps Engineer'].includes(user?.role);

  useEffect(() => {
    getPredictions()
      .then((data) => setPredictions(data))
      .catch(() => setMessage('Unable to load prediction history'));
  }, []);

  async function onRecommend(prediction) {
    setMessage('');
    try {
      const response = await recommend({
        deployment_id: prediction.deploymentId,
        service: prediction.service,
        riskLevel: prediction.riskLevel,
        reasons: prediction.reasons || []
      });
      setRecommendations(response.recommendations || []);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not generate recommendation');
    }
  }

  return (
    <div className="space-y-4">
      {message ? <p className="text-sm text-red-600">{message}</p> : null}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="xl:col-span-2 rounded-xl bg-white p-4 shadow overflow-auto">
          <h3 className="text-base font-semibold text-slate-800">Deployment Risk Score</h3>
          <table className="mt-3 min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2">Deployment</th>
                <th className="py-2">Service</th>
                <th className="py-2">Probability</th>
                <th className="py-2">Risk</th>
                <th className="py-2">Reason</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {predictions.slice(0, 25).map((item) => (
                <tr key={item._id} className="border-t border-slate-100 align-top">
                  <td className="py-2">{item.deploymentId}</td>
                  <td className="py-2">{item.service}</td>
                  <td className="py-2">{item.failureProbability}%</td>
                  <td className="py-2">
                    <RiskBadge riskLevel={item.riskLevel} />
                  </td>
                  <td className="py-2">{(item.reasons || []).join(', ')}</td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => onRecommend(item)}
                      disabled={!canRecommend}
                      className="rounded-md bg-slate-900 px-3 py-1 text-white hover:bg-slate-700 disabled:opacity-70"
                    >
                      {canRecommend ? 'Recommend' : 'Not allowed'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <RecommendationPanel recommendations={recommendations} />
      </div>
    </div>
  );
}
