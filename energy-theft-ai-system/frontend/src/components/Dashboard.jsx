function Dashboard({ summary, metrics }) {
  if (!summary) return null

  const stats = [
    {
      label: 'Total Meters',
      value: summary.total_meters,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'bg-primary-100 text-primary-600',
    },
    {
      label: 'Suspicious',
      value: summary.suspicious_meters,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      color: 'bg-danger-100 text-danger-600',
    },
    {
      label: 'Safe Meters',
      value: summary.safe_meters,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'bg-success-100 text-success-600',
    },
    {
      label: 'Avg Risk Score',
      value: summary.avg_risk_score,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'bg-warning-100 text-warning-600',
    },
  ]

  const metricItems = metrics ? [
    { label: 'Accuracy', value: `${metrics.accuracy}%`, color: 'text-primary-600' },
    { label: 'Precision', value: `${metrics.precision}%`, color: 'text-emerald-600' },
    { label: 'Recall', value: `${metrics.recall}%`, color: 'text-amber-600' },
    { label: 'F1 Score', value: `${metrics.f1_score}%`, color: 'text-violet-600' },
  ] : []

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ML Model Metrics */}
      {metrics && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-sm font-semibold text-slate-700">
              ML Model Performance — {metrics.model}
            </h3>
            <span className="text-xs text-slate-400 ml-auto">
              Train: {metrics.train_size} | Test: {metrics.test_size}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {metricItems.map((item) => (
              <div key={item.label} className="text-center">
                <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-slate-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Confusion Matrix */}
          {metrics.confusion_matrix && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-2">Confusion Matrix</p>
              <div className="grid grid-cols-2 gap-2 max-w-xs">
                <div className="bg-success-50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-success-700">{metrics.confusion_matrix.true_negatives}</p>
                  <p className="text-[10px] text-success-600">True Neg</p>
                </div>
                <div className="bg-danger-50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-danger-700">{metrics.confusion_matrix.false_positives}</p>
                  <p className="text-[10px] text-danger-600">False Pos</p>
                </div>
                <div className="bg-warning-50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-warning-700">{metrics.confusion_matrix.false_negatives}</p>
                  <p className="text-[10px] text-warning-600">False Neg</p>
                </div>
                <div className="bg-primary-50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-primary-700">{metrics.confusion_matrix.true_positives}</p>
                  <p className="text-[10px] text-primary-600">True Pos</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard
