function ReportPanel({ meter, onClose }) {
  if (!meter) return null

  const getStatusBadge = () => {
    if (meter.risk_score >= 60) {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-danger-100 text-danger-700">
          ⚠️ Suspicious — Inspection Recommended
        </span>
      )
    }
    if (meter.risk_score >= 40) {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-warning-100 text-warning-700">
          🔍 Monitor — Review Suggested
        </span>
      )
    }
    return (
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-700">
        ✅ Safe — No Action Needed
      </span>
    )
  }

  const getRecommendationText = () => {
    const map = {
      inspection_recommended: 'Immediate physical inspection is recommended. Dispatch a field technician to verify meter integrity.',
      monitoring_recommended: 'Add this meter to the active monitoring list. Schedule a review within 30 days.',
      periodic_monitoring: 'Standard periodic monitoring is sufficient. No immediate action required.',
      no_action_needed: 'This meter is operating within normal parameters. No action needed.',
    }
    return map[meter.recommendation] || meter.recommendation
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            Investigation Report
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">{meter.meter_id}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Status and Score */}
        <div className="flex items-center justify-between">
          {getStatusBadge()}
          <div className="text-right">
            <p className="text-xs text-slate-500">Risk Score</p>
            <p className={`text-3xl font-bold ${
              meter.risk_score >= 60 ? 'text-danger-600' :
              meter.risk_score >= 40 ? 'text-warning-600' :
              'text-success-600'
            }`}>
              {meter.risk_score.toFixed(1)}
            </p>
          </div>
        </div>

        {/* AI Explanation */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Analysis
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {meter.explanation}
          </p>
        </div>

        {/* SHAP Features */}
        {meter.shap_features && meter.shap_features.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Key Contributing Factors</h4>
            <div className="space-y-2">
              {meter.shap_features.map((sf, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-slate-600">
                    {sf.feature.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    sf.direction === 'increases risk'
                      ? 'bg-danger-100 text-danger-700'
                      : 'bg-success-100 text-success-700'
                  }`}>
                    {sf.direction}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
          <h4 className="text-sm font-semibold text-primary-800 mb-1">Recommendation</h4>
          <p className="text-sm text-primary-700">{getRecommendationText()}</p>
        </div>
      </div>
    </div>
  )
}

export default ReportPanel
