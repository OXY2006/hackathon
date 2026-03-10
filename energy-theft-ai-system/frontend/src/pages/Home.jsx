import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadMeterData from '../components/UploadMeterData'
import { uploadCSV, detectAnomalies } from '../services/api'

function Home({ setAnalysisData, setMeterReadings }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleUpload = async (file) => {
    setIsLoading(true)
    setError('')

    try {
      // Step 1: Upload CSV
      const uploadResult = await uploadCSV(file)
      setMeterReadings(uploadResult.data)

      // Step 2: Detect anomalies
      const analysisResult = await detectAnomalies(uploadResult.data)
      setAnalysisData(analysisResult)

      // Navigate to results
      navigate('/results')
    } catch (err) {
      const msg = err.response?.data?.error || err.message
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSimulation = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Generate demo data on the client
      const demoData = generateDemoData()
      setMeterReadings(demoData)

      // Send directly to detect
      const analysisResult = await detectAnomalies(demoData)
      setAnalysisData(analysisResult)

      navigate('/results')
    } catch (err) {
      const msg = err.response?.data?.error || err.message
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium mb-4">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI-Powered Detection
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-3">
          Energy Theft & Anomaly Detection
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Upload smart meter data to detect suspicious electricity consumption patterns 
          using Isolation Forest anomaly detection and SHAP explainability.
        </p>
      </div>

      {/* Upload */}
      <div className="mb-6">
        <UploadMeterData onUpload={handleUpload} isLoading={isLoading} />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-xl">
          <p className="text-sm text-danger-700">{error}</p>
        </div>
      )}

      {/* Simulate Button */}
      <div className="text-center">
        <button
          onClick={handleSimulation}
          disabled={isLoading}
          className="px-5 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg 
            hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🎭 Simulate Fraud Demo
        </button>
        <p className="text-xs text-slate-400 mt-2">
          Generate and analyze synthetic data with injected anomalies
        </p>
      </div>

      {/* How it works */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            step: '01',
            title: 'Upload Data',
            desc: 'Upload smart meter CSV data with consumption readings, timestamps, and GPS coordinates.',
          },
          {
            step: '02',
            title: 'AI Analysis',
            desc: 'Isolation Forest detects anomalies. SHAP explains why each meter is flagged.',
          },
          {
            step: '03',
            title: 'View Results',
            desc: 'Interactive dashboard with risk scores, consumption charts, maps, and investigation reports.',
          },
        ].map((item) => (
          <div key={item.step} className="bg-white rounded-xl border border-slate-200 p-5">
            <span className="text-xs font-bold text-primary-600">{item.step}</span>
            <h3 className="text-sm font-semibold text-slate-800 mt-2 mb-1">{item.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Generate synthetic demo data with intentional anomalies.
 */
function generateDemoData() {
  const meters = []
  const numMeters = 50  // smaller for demo speed
  const numDays = 14

  for (let m = 0; m < numMeters; m++) {
    const meterId = `MTR-${String(m + 1).padStart(4, '0')}`
    const lat = 39.5 + Math.random() * 2.5
    const lng = -89 + Math.random() * 4
    const isAnomaly = Math.random() < 0.2
    const anomalyType = ['sudden_drop', 'flatline', 'night_usage'][Math.floor(Math.random() * 3)]

    for (let d = 0; d < numDays; d++) {
      for (let h = 0; h < 24; h++) {
        const date = new Date(2025, 0, 1 + d, h)
        let consumption = 1.5

        // Normal pattern
        if (h >= 7 && h <= 9) consumption += 2 + Math.random()
        else if (h >= 17 && h <= 21) consumption += 3 + Math.random() * 1.5
        else if (h >= 0 && h <= 5) consumption += 0.3 + Math.random() * 0.2
        else consumption += 1 + Math.random() * 0.5

        consumption += (Math.random() - 0.5) * 0.4

        // Inject anomalies
        if (isAnomaly) {
          if (anomalyType === 'sudden_drop' && d >= 7 && d <= 11) {
            consumption *= 0.1
          } else if (anomalyType === 'flatline' && d >= 5) {
            consumption = 1.0 + Math.random() * 0.02
          } else if (anomalyType === 'night_usage' && h >= 0 && h <= 5) {
            consumption = 5 + Math.random() * 3
          }
        }

        meters.push({
          meter_id: meterId,
          timestamp: date.toISOString().replace('T', ' ').substring(0, 19),
          consumption_kwh: Math.max(0.05, parseFloat(consumption.toFixed(4))),
          latitude: parseFloat(lat.toFixed(6)),
          longitude: parseFloat(lng.toFixed(6)),
        })
      }
    }
  }

  return meters
}

export default Home
