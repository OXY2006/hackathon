import { useEffect, useState, useRef } from 'react'

function CircularGauge({ value, label, color, size = 120, delay = 0 }) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const circumference = 2 * Math.PI * ((size - 12) / 2)
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0
      const step = value / 60
      const interval = setInterval(() => {
        start += step
        if (start >= value) {
          setAnimatedValue(value)
          clearInterval(interval)
        } else {
          setAnimatedValue(parseFloat(start.toFixed(2)))
        }
      }, 16)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  const colors = {
    blue: { stroke: '#3b82f6', bg: 'rgba(59,130,246,0.1)', text: 'text-blue-600', glow: 'rgba(59,130,246,0.3)' },
    emerald: { stroke: '#10b981', bg: 'rgba(16,185,129,0.1)', text: 'text-emerald-600', glow: 'rgba(16,185,129,0.3)' },
    violet: { stroke: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', text: 'text-violet-600', glow: 'rgba(139,92,246,0.3)' },
    amber: { stroke: '#f59e0b', bg: 'rgba(245,158,11,0.1)', text: 'text-amber-600', glow: 'rgba(245,158,11,0.3)' },
  }
  const c = colors[color] || colors.blue

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={(size - 12) / 2}
            fill="none" stroke={c.bg} strokeWidth="8"
          />
          <circle
            cx={size / 2} cy={size / 2} r={(size - 12) / 2}
            fill="none" stroke={c.stroke} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.05s ease-out',
              filter: `drop-shadow(0 0 6px ${c.glow})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${c.text}`}>{animatedValue.toFixed(1)}%</span>
        </div>
      </div>
      <span className="text-sm font-medium text-slate-600 mt-2">{label}</span>
    </div>
  )
}

function EnsembleOverview({ ensemble }) {
  if (!ensemble) return null

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Decorative glow effects */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Ensemble Model Performance</h2>
            <p className="text-sm text-slate-400">Random Forest + Gradient Boosting + Logistic Regression</p>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-8 max-w-2xl">
          Three independently trained classifiers combined via probability averaging to achieve robust electricity theft detection with optimized decision threshold.
        </p>

        {/* Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <CircularGauge value={ensemble.accuracy} label="Accuracy" color="blue" delay={0} />
          <CircularGauge value={ensemble.f1_score} label="F1 Score (Theft)" color="emerald" delay={200} />
          <CircularGauge value={ensemble.auc_roc} label="AUC-ROC" color="violet" delay={400} />
        </div>

        {/* Threshold badge */}
        <div className="mt-6 flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-slate-300">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Optimal Threshold: <span className="font-semibold text-white">{ensemble.threshold}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default EnsembleOverview
