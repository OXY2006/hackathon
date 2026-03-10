import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-slate-800">
              Energy Theft <span className="text-primary-600">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-primary-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Home
            </Link>
            <Link
              to="/results"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/results'
                  ? 'text-primary-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/model-performance"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/model-performance'
                  ? 'text-primary-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Model Performance
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
