import { useState, useMemo } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, ArrowLeft, ShieldAlert, BadgeCheck, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export default function PredictionPage() {
  const location = useLocation();
  const data = location.state?.results;
  const filename = location.state?.filename;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  if (!data || !data.predictions) {
    return <Navigate to="/upload" replace />;
  }

  const { summary, predictions } = data;

  // Sort predictions by risk score descending so highest risk is first
  const sortedPredictions = useMemo(() => {
    return [...predictions].sort((a, b) => b.risk_score - a.risk_score);
  }, [predictions]);

  // Calculate histogram data
  const chartData = useMemo(() => {
    const buckets = Array.from({ length: 10 }, (_, i) => ({
      name: `${i * 10}-${(i + 1) * 10}%`,
      count: 0,
      rangeStart: i * 10
    }));

    predictions.forEach(p => {
      const bucketIndex = Math.min(Math.floor(p.risk_score / 10), 9);
      buckets[bucketIndex].count += 1;
    });

    return buckets;
  }, [predictions]);

  // General Pagination
  const totalPages = Math.ceil(sortedPredictions.length / itemsPerPage);
  const paginatedData = sortedPredictions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-900 border border-dark-700 p-3 rounded-lg shadow-xl">
          <p className="text-white font-medium mb-1">Risk: {label}</p>
          <p className="text-energy-400">Nodes: <span className="font-bold">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center text-sm text-dark-400 mb-2">
            <Link to="/upload" className="hover:text-energy-500 flex items-center mr-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Upload
            </Link>
            <span className="truncate max-w-[200px] border border-dark-800 bg-dark-900 rounded px-2 py-1">
              File: {filename}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <BarChart2 className="mr-3 h-8 w-8 text-blue-400" />
            Inference Results
          </h1>
        </div>
        
        <div className={`p-4 rounded-lg flex items-center space-x-3 border ${
          summary.theft_percentage > 5 
            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
            : 'bg-energy-500/10 border-energy-500/30 text-energy-400'
        }`}>
          {summary.theft_percentage > 5 ? (
            <ShieldAlert className="h-8 w-8 text-red-500" />
          ) : (
            <BadgeCheck className="h-8 w-8 text-energy-500" />
          )}
          <div>
            <p className="font-bold text-lg">System Status</p>
            <p className="text-sm">
              {summary.theft_percentage > 5 ? 'High Alert: Anomalies Detected' : 'Normal parameters'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5">
          <p className="text-dark-400 text-sm font-medium mb-1">Total Signals</p>
          <p className="text-3xl font-bold text-white">{summary.total_records}</p>
        </div>
        <div className="glass-card p-5 border-t-2 border-energy-500">
          <p className="text-dark-400 text-sm font-medium mb-1 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1 text-energy-500" />
            Normal
          </p>
          <p className="text-3xl font-bold text-white">{summary.normal_cases}</p>
        </div>
        <div className="glass-card p-5 border-t-2 border-red-500">
          <p className="text-dark-400 text-sm font-medium mb-1 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
            Suspicious
          </p>
          <p className="text-3xl font-bold text-white">{summary.suspicious_cases}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-dark-400 text-sm font-medium mb-1">Anomaly Rate</p>
          <p className="text-3xl font-bold text-blue-400">{summary.theft_percentage}%</p>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Risk Score Distribution</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#1e293b'}} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.rangeStart >= 40 ? '#ef4444' : '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center items-center mt-4 space-x-6 text-sm">
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-energy-500 mr-2"></span><span className="text-dark-300">Normal Range</span></div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span><span className="text-dark-300">Suspicious Range</span></div>
        </div>
      </div>

      {/* Detailed Analysis Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-dark-800 bg-dark-900/80 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center">
            Detailed Node Analysis 
            <span className="ml-3 text-xs font-medium px-2.5 py-1 bg-dark-800 text-dark-300 rounded-full border border-dark-700">Sorted by Risk</span>
          </h2>
          
          {/* Pagination Controls */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-dark-400 mr-2">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md bg-dark-800 hover:bg-dark-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md bg-dark-800 hover:bg-dark-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark-900 border-b border-dark-800 text-dark-300 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Record ID</th>
                <th className="px-6 py-4 font-medium">Status / Classification</th>
                <th className="px-6 py-4 font-medium w-1/3">Risk Score</th>
                <th className="px-6 py-4 font-medium">Model Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {paginatedData.map((p, idx) => (
                <tr key={idx} className={`hover:bg-dark-800/50 transition-colors ${p.is_suspicious ? 'bg-red-500/5 hover:bg-red-500/10' : ''}`}>
                  <td className="px-6 py-4 text-dark-300 font-mono text-sm">
                    {p.id || `NODE-${(p.index + 1).toString().padStart(4, '0')}`}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      p.is_suspicious 
                        ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                        : 'bg-energy-500/20 text-energy-400 border-energy-500/30'
                    }`}>
                      {p.is_suspicious && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {!p.is_suspicious && <CheckCircle className="h-3 w-3 mr-1" />}
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-24 bg-dark-800 rounded-full h-2 mr-3 flex-shrink-0">
                        <div 
                          className={`h-2 rounded-full ${p.is_suspicious ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-energy-500'}`} 
                          style={{ width: `${p.risk_score}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${p.is_suspicious ? 'text-white' : 'text-dark-300'}`}>
                        {p.risk_score.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${p.confidence === 'High' ? 'text-white font-medium' : 'text-dark-400'}`}>
                      {p.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {predictions.length === 0 && (
          <div className="p-8 text-center text-dark-400">
            No analysis results available.
          </div>
        )}
      </div>
    </div>
  );
}
