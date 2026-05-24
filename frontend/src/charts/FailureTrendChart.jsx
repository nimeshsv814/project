import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, BarElement);

export default function FailureTrendChart({ predictions = [] }) {
  const sorted = [...predictions].reverse().slice(0, 20);
  const data = {
    labels: sorted.map((item) => new Date(item.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: 'Failure Probability',
        data: sorted.map((item) => item.failureProbability),
        borderColor: '#e11d48',
        backgroundColor: 'rgba(225, 29, 72, 0.25)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    },
    scales: {
      y: { min: 0, max: 100 }
    }
  };

  return (
    <section className="rounded-xl bg-white p-4 shadow">
      <h3 className="text-base font-semibold text-slate-800">Failure Trends</h3>
      <div className="mt-4 h-64">
        <Line data={data} options={options} />
      </div>
    </section>
  );
}
