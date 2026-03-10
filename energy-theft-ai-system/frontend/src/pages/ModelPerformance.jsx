import { useState, useEffect } from 'react'
import { getModelResults } from '../services/api'
import EnsembleOverview from '../components/EnsembleOverview'
import ModelMetricsPanel from '../components/ModelMetricsPanel'

function ModelPerformance() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getModelResults()
        setData(result)
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load model results')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading model performance data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-700 mb-2">Failed to Load</h2>
        <p className="text-sm text-slate-500 mb-1">{error}</p>
        <p className="text-xs text-slate-400">Make sure the backend is running and the model has been trained.</p>
      </div>
    )
  }

  const cv = data?.cross_validation

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium mb-3">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Trained ML Models
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Model Performance Dashboard</h1>
        <p className="text-slate-500 text-sm max-w-2xl">
          Pre-trained ensemble model results for electricity theft detection. Models trained on historical meter data using 
          Random Forest, Gradient Boosting, and Logistic Regression classifiers.
        </p>
      </div>

      {/* Ensemble Overview Hero */}
      <div className="mb-8">
        <EnsembleOverview ensemble={data?.ensemble} />
      </div>

      {/* Individual Model Comparison */}
      <div className="mb-8">
        <ModelMetricsPanel models={data?.models} />
      </div>

      {/* Cross-Validation Results */}
      {cv && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <h2 className="text-lg font-semibold text-slate-800">Cross-Validation Stability</h2>
            <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
              {cv.folds}-Fold Stratified CV
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: 'CV Accuracy',
                mean: cv.accuracy_mean,
                std: cv.accuracy_std,
                color: 'blue',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                label: 'CV F1 Score',
                mean: cv.f1_mean,
                std: cv.f1_std,
                color: 'emerald',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
              },
              {
                label: 'CV AUC-ROC',
                mean: cv.auc_mean,
                std: cv.auc_std,
                color: 'violet',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                ),
              },
            ].map((item) => {
              const colorClasses = {
                blue: { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' },
                emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
                violet: { bg: 'bg-violet-50', text: 'text-violet-600', badge: 'bg-violet-100 text-violet-700', bar: 'bg-violet-500' },
              }
              const cc = colorClasses[item.color]

              return (
                <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cc.bg} ${cc.text}`}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </div>

                  <div className="mb-3">
                    <span className={`text-3xl font-bold ${cc.text}`}>{item.mean}%</span>
                    <span className={`text-xs font-medium ml-2 px-2 py-0.5 rounded-full ${cc.badge}`}>
                      ± {item.std}%
                    </span>
                  </div>

                  {/* Mini confidence bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="relative h-full rounded-full overflow-hidden" style={{ width: `${item.mean}%` }}>
                      <div className={`absolute inset-0 ${cc.bar}`} />
                      {/* Shimmer animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    Range: {(item.mean - item.std).toFixed(2)}% – {(item.mean + item.std).toFixed(2)}%
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Technical Details */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <h2 className="text-lg font-semibold text-slate-800">Technical Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Architecture</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">●</span>
                <span><strong>Random Forest</strong> — 300 estimators, balanced weights, sqrt features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">●</span>
                <span><strong>Gradient Boosting</strong> — 200 estimators, 0.05 LR, depth 5</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-0.5">●</span>
                <span><strong>Logistic Regression</strong> — C=1.0, balanced weights, 1000 iters</span>
              </li>
            </ul>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Pipeline</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="text-amber-500 font-bold text-xs">1</span>
                <span>Feature engineering with derived anomaly signals</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500 font-bold text-xs">2</span>
                <span>StandardScaler normalization for Logistic Regression</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500 font-bold text-xs">3</span>
                <span>Probability averaging across 3 classifiers</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500 font-bold text-xs">4</span>
                <span>Optimized threshold search (F1-maximizing)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelPerformance
