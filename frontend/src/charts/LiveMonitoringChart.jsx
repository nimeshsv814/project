import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function LiveMonitoringChart({ metrics = [] }) {
  const recent = [...metrics].slice(0, 12).reverse();
  const labels = recent.map((item) => item.service);

  const data = {
    labels,
    datasets: [
      {
        label: 'CPU',
        data: recent.map((item) => Number(item.cpu || 0)),
        backgroundColor: '#0a67df'
      },
      {
        label: 'Memory',
        data: recent.map((item) => Number(item.memory || 0)),
        backgroundColor: '#16a34a'
      },
      {
        label: 'Pod Restarts',
        data: recent.map((item) => Number(item.podRestarts || 0)),
        backgroundColor: '#e11d48'
      }
    ]
  };

  return (
    <section className="rounded-xl bg-white p-4 shadow">
      <h3 className="text-base font-semibold text-slate-800">Live Monitoring</h3>
      <div className="mt-4 h-72">
        <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </section>
  );
}
