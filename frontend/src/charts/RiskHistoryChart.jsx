import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function RiskHistoryChart({ deployments = [] }) {
  const items = [...deployments].slice(0, 20).reverse();
  const data = {
    labels: items.map((item) => item.service),
    datasets: [
      {
        label: 'Risk Score',
        data: items.map((item) => item.lastRiskScore || 0),
        borderColor: '#0a67df',
        backgroundColor: 'rgba(10, 103, 223, 0.2)',
        fill: true,
        tension: 0.35
      }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      y: { min: 0, max: 100 }
    }
  };

  return (
    <section className="rounded-xl bg-white p-4 shadow">
      <h3 className="text-base font-semibold text-slate-800">Risk History</h3>
      <div className="mt-4 h-64">
        <Line data={data} options={options} />
      </div>
    </section>
  );
}
