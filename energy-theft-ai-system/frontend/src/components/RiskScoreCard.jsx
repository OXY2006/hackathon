function RiskScoreCard({ meter, onSelect, isSelected }) {
  const getStatusConfig = (score, isSuspicious) => {
    if (isSuspicious || score >= 60) {
      return {
        label: 'Suspicious',
        bgColor: 'bg-danger-50',
        borderColor: 'border-danger-200',
        badgeColor: 'bg-danger-100 text-danger-700',
        scoreColor: 'text-danger-600',
      }
    }
    if (score >= 40) {
      return {
        label: 'Monitor',
        bgColor: 'bg-warning-50',
        borderColor: 'border-warning-200',
        badgeColor: 'bg-warning-100 text-warning-700',
        scoreColor: 'text-warning-600',
      }
    }
    return {
      label: 'Safe',
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200',
      badgeColor: 'bg-success-100 text-success-700',
      scoreColor: 'text-success-600',
    }
  }

  const config = getStatusConfig(meter.risk_score, meter.is_suspicious)

  return (
    <button
      onClick={() => onSelect(meter)}
      className={`w-full text-left rounded-xl border p-4 transition-all hover:shadow-md ${
        isSelected
          ? 'border-primary-500 ring-2 ring-primary-200 bg-white'
          : `${config.borderColor} bg-white hover:border-primary-300`
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-700">{meter.meter_id}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.badgeColor}`}>
          {config.label}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-500">Risk Score</p>
          <p className={`text-2xl font-bold ${config.scoreColor}`}>
            {meter.risk_score.toFixed(1)}
          </p>
        </div>
        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              meter.risk_score >= 60
                ? 'bg-danger-500'
                : meter.risk_score >= 40
                ? 'bg-warning-500'
                : 'bg-success-500'
            }`}
            style={{ width: `${meter.risk_score}%` }}
          />
        </div>
      </div>
    </button>
  )
}

export default RiskScoreCard
