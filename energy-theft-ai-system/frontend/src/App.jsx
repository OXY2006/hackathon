import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Results from './pages/Results'
import ModelPerformance from './pages/ModelPerformance'
import { useState } from 'react'

function App() {
  const [analysisData, setAnalysisData] = useState(null)
  const [meterReadings, setMeterReadings] = useState([])

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  setAnalysisData={setAnalysisData}
                  setMeterReadings={setMeterReadings}
                />
              }
            />
            <Route
              path="/results"
              element={
                <Results
                  analysisData={analysisData}
                  meterReadings={meterReadings}
                />
              }
            />
            <Route
              path="/model-performance"
              element={<ModelPerformance />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

