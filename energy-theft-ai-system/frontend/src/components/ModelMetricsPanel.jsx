import { useEffect, useState } from 'react'

function AnimatedBar({ value, color, delay = 0 }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  const colors = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    cyan: 'bg-cyan-500',
  }

  return (
    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${colors[color] || colors.blue}`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

function ModelCard({ model, color, delay = 0 }) {
  const colorMap = {
    blue: {
      badge: 'bg-blue-100 text-blue-700',
      icon: 'bg-blue-50 text-blue-600',
      border: 'hover:border-blue-300',
    },
    emerald: {
      badge: 'bg-emerald-100 text-emerald-700',
      icon: 'bg-emerald-50 text-emerald-600',
      border: 'hover:border-emerald-300',
    },
    violet: {
      badge: 'bg-violet-100 text-violet-700',
      icon: 'bg-violet-50 text-violet-600',
      border: 'hover:border-violet-300',
    },
  }
  const c = colorMap[color] || colorMap.blue

  const metrics = [
    { label: 'Accuracy', value: model.accuracy, color },
    { label: 'F1 Score', value: model.f1_score, color },
    { label: 'AUC-ROC', value: model.auc_roc, color },
  ]

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 transition-all duration-300 hover:shadow-lg ${c.border}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.icon}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800">{model.name}</h3>
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>
            {model.short}
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-5 leading-relaxed">{model.description}</p>

      {/* Metrics */}
      <div className="space-y-4">
        {metrics.map((metric, i) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-slate-600">{metric.label}</span>
              <span className="text-sm font-bold text-slate-800">{metric.value}%</span>
            </div>
            <AnimatedBar value={metric.value} color={metric.color} delay={delay + i * 150} />
          </div>
        ))}
      </div>
    </div>
  )
}

function ModelMetricsPanel({ models }) {
  if (!models) return null

  const modelEntries = [
    { key: 'rf', color: 'blue', delay: 100 },
    { key: 'gb', color: 'emerald', delay: 300 },
    { key: 'lr', color: 'violet', delay: 500 },
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h2 className="text-lg font-semibold text-slate-800">Individual Model Comparison</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modelEntries.map(({ key, color, delay }) => (
          models[key] && (
            <ModelCard
              key={key}
              model={models[key]}
              color={color}
              delay={delay}
            />
          )
        ))}
      </div>
    </div>
  )
}

export default ModelMetricsPanel
