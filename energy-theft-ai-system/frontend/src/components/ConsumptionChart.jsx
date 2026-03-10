import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function ConsumptionChart({ readings, meterId, riskScore }) {
  if (!readings || readings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-sm text-slate-500 text-center">No consumption data available</p>
      </div>
    )
  }

  // Get readings for this meter
  const meterReadings = readings
    .filter((r) => r.meter_id === meterId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  if (meterReadings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-sm text-slate-500 text-center">No data for meter {meterId}</p>
      </div>
    )
  }

  // Sample every 6th reading for readability
  const sampled = meterReadings.filter((_, i) => i % 6 === 0)
  const labels = sampled.map((r) => {
    const d = new Date(r.timestamp)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`
  })
  const values = sampled.map((r) => r.consumption_kwh)

  // Compute a simple rolling average for anomaly threshold line
  const avgConsumption = values.reduce((a, b) => a + b, 0) / values.length
  const threshold = values.map(() => avgConsumption)

  // Color anomalous points
  const pointColors = values.map((v) =>
    v < avgConsumption * 0.3 || v > avgConsumption * 2.5
      ? 'rgba(239, 68, 68, 1)'
      : 'rgba(59, 130, 246, 0.6)'
  )
  const pointRadius = values.map((v) =>
    v < avgConsumption * 0.3 || v > avgConsumption * 2.5 ? 4 : 0
  )

  const data = {
    labels,
    datasets: [
      {
        label: 'Consumption (kWh)',
        data: values,
        borderColor: 'rgba(59, 130, 246, 0.8)',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: pointColors,
        pointRadius,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
      {
        label: 'Average',
        data: threshold,
        borderColor: 'rgba(148, 163, 184, 0.5)',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          font: { size: 11, family: 'Inter' },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'Inter', size: 12 },
        bodyFont: { family: 'Inter', size: 11 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        display: true,
        ticks: {
          maxTicksLimit: 12,
          font: { size: 10, family: 'Inter' },
          color: '#94a3b8',
        },
        grid: { display: false },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'kWh',
          font: { size: 11, family: 'Inter' },
          color: '#64748b',
        },
        ticks: {
          font: { size: 10, family: 'Inter' },
          color: '#94a3b8',
        },
        grid: { color: 'rgba(241, 245, 249, 1)' },
      },
    },
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">
          Consumption Over Time — {meterId}
        </h3>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            riskScore >= 60
              ? 'bg-danger-100 text-danger-700'
              : riskScore >= 40
              ? 'bg-warning-100 text-warning-700'
              : 'bg-success-100 text-success-700'
          }`}
        >
          Risk: {riskScore?.toFixed(1)}
        </span>
      </div>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}

export default ConsumptionChart
