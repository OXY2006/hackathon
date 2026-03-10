import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Dashboard from '../components/Dashboard'
import RiskScoreCard from '../components/RiskScoreCard'
import ConsumptionChart from '../components/ConsumptionChart'
import TheftHeatmap from '../components/TheftHeatmap'
import ReportPanel from '../components/ReportPanel'

function Results({ analysisData, meterReadings }) {
  const [selectedMeter, setSelectedMeter] = useState(null)
  const [filter, setFilter] = useState('all') // all | suspicious | safe
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const meters = analysisData?.meters || []
  const summary = analysisData?.summary || null

  const filteredMeters = useMemo(() => {
    let result = meters
    if (filter === 'suspicious') {
      result = result.filter((m) => m.is_suspicious)
    } else if (filter === 'safe') {
      result = result.filter((m) => !m.is_suspicious)
    }
    if (searchQuery) {
      result = result.filter((m) =>
        m.meter_id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return result.sort((a, b) => b.risk_score - a.risk_score)
  }, [meters, filter, searchQuery])

  if (!analysisData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-700 mb-2">No Analysis Data</h2>
        <p className="text-sm text-slate-500 mb-6">Upload a dataset first to see the analysis results.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          Go to Upload
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Dashboard Stats */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Analysis Dashboard</h2>
        <Dashboard summary={summary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Meter List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Meters</h3>

            {/* Search */}
            <div className="relative mb-3">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search meters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-1 mb-3">
              {[
                { key: 'all', label: 'All' },
                { key: 'suspicious', label: 'Suspicious' },
                { key: 'safe', label: 'Safe' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filter === f.key
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Meter Cards */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {filteredMeters.slice(0, 50).map((meter) => (
                <RiskScoreCard
                  key={meter.meter_id}
                  meter={meter}
                  onSelect={setSelectedMeter}
                  isSelected={selectedMeter?.meter_id === meter.meter_id}
                />
              ))}
              {filteredMeters.length > 50 && (
                <p className="text-xs text-slate-400 text-center py-2">
                  Showing 50 of {filteredMeters.length} meters
                </p>
              )}
              {filteredMeters.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No meters found</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Consumption Chart */}
          {selectedMeter && (
            <ConsumptionChart
              readings={meterReadings}
              meterId={selectedMeter.meter_id}
              riskScore={selectedMeter.risk_score}
            />
          )}

          {/* Heatmap */}
          <TheftHeatmap meters={meters} />

          {/* Report Panel */}
          {selectedMeter && (
            <ReportPanel
              meter={selectedMeter}
              onClose={() => setSelectedMeter(null)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Results
