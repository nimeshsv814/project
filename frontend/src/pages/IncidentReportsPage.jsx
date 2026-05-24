import { useEffect, useState } from 'react';

import { getIncidents } from '../services/platformService';

export default function IncidentReportsPage() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    getIncidents()
      .then((data) => setIncidents(data))
      .catch(() => null);
  }, []);

  return (
    <section className="rounded-xl bg-white p-4 shadow overflow-auto">
      <h3 className="text-base font-semibold text-slate-800">Incident Intelligence Reports</h3>
      <table className="mt-3 min-w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            <th className="py-2">Deployment</th>
            <th className="py-2">Service</th>
            <th className="py-2">Severity</th>
            <th className="py-2">Summary</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((item) => (
            <tr key={item._id} className="border-t border-slate-100 align-top">
              <td className="py-2">{item.deploymentId}</td>
              <td className="py-2">{item.service}</td>
              <td className="py-2">{item.severity}</td>
              <td className="py-2">{item.summary}</td>
              <td className="py-2">{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
