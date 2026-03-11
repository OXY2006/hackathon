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
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xl">
          <p className="text-slate-900 font-black mb-1">Risk Buckets: {label}</p>
          <p className="text-energy-600 font-bold">Node Count: <span className="text-lg">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
            <Link to="/upload" className="hover:text-energy-600 flex items-center mr-6 transition-colors group">
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Upload
            </Link>
            <span className="truncate max-w-[250px] border border-slate-100 bg-slate-50 rounded-xl px-4 py-1.5 shadow-sm text-slate-500">
              File: {filename}
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center tracking-tight">
            <div className="p-3 bg-blue-50 rounded-2xl mr-4">
              <BarChart2 className="h-8 w-8 text-blue-600" />
            </div>
            Inference Results
          </h1>
        </div>
        
        <div className={`p-6 rounded-3xl flex items-center space-x-4 border shadow-sm ${
          summary.theft_percentage > 5 
            ? 'bg-red-50 border-red-100 text-red-700' 
            : 'bg-energy-50 border-energy-100 text-energy-700'
        }`}>
          {summary.theft_percentage > 5 ? (
            <div className="p-3 bg-white rounded-2xl shadow-sm"><ShieldAlert className="h-8 w-8 text-red-500" /></div>
          ) : (
            <div className="p-3 bg-white rounded-2xl shadow-sm"><BadgeCheck className="h-8 w-8 text-energy-600" /></div>
          )}
          <div>
            <p className="font-black text-xl tracking-tight">System Status</p>
            <p className="text-sm font-bold uppercase tracking-wide opacity-80">
              {summary.theft_percentage > 5 ? 'High Alert: Anomalies Detected' : 'Normal parameters verified'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Total Signals</p>
          <p className="text-4xl font-black text-slate-900">{summary.total_records}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-t-4 border-t-energy-500">
          <p className="text-energy-600 text-xs font-black uppercase tracking-widest mb-2 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Normal
          </p>
          <p className="text-4xl font-black text-slate-900">{summary.normal_cases}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-t-4 border-t-red-500">
          <p className="text-red-600 text-xs font-black uppercase tracking-widest mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Suspicious
          </p>
          <p className="text-4xl font-black text-slate-900">{summary.suspicious_cases}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Anomaly Rate</p>
          <p className="text-4xl font-black text-blue-600">{summary.theft_percentage}%</p>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-12">
        <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Risk Score Distribution</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight="700" tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#94a3b8" fontSize={11} fontWeight="700" tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.rangeStart >= 40 ? '#ef4444' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center items-center mt-8 space-x-10 text-sm font-bold uppercase tracking-widest text-slate-500">
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-energy-500 mr-3 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></span>Normal Range</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]"></span>Suspicious Range</div>
        </div>
      </div>

      {/* Detailed Analysis Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center tracking-tight">
            Detailed Node Analysis 
            <span className="ml-4 text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white text-slate-400 rounded-full border border-slate-200 shadow-sm">Sorted by Risk</span>
          </h2>
          
          {/* Pagination Controls */}
          <div className="flex items-center space-x-3 text-sm font-bold">
            <span className="text-slate-400 mr-4">
              Page <span className="text-slate-900 font-black">{currentPage}</span> of <span className="text-slate-900 font-black">{totalPages}</span>
            </span>
            <div className="flex items-center p-1 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl hover:bg-slate-50 text-slate-900 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div className="w-px h-6 bg-slate-100 mx-1"></div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl hover:bg-slate-50 text-slate-900 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Record ID</th>
                <th className="px-8 py-5">Status classification</th>
                <th className="px-8 py-5 w-1/3">Risk Score Index</th>
                <th className="px-8 py-5 text-right">Model Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedData.map((p, idx) => (
                <tr key={idx} className={`hover:bg-slate-50/50 transition-colors group ${p.is_suspicious ? 'bg-red-50/30' : ''}`}>
                  <td className="px-8 py-5 text-slate-600 font-mono text-xs font-bold">
                    {p.id || `NODE-${(p.index + 1).toString().padStart(4, '0')}`}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                      p.is_suspicious 
                        ? 'bg-red-50 text-red-600 border-red-100' 
                        : 'bg-energy-50 text-energy-700 border-energy-100'
                    }`}>
                      {p.is_suspicious && <AlertTriangle className="h-3 w-3 mr-2" />}
                      {!p.is_suspicious && <CheckCircle className="h-3 w-3 mr-2" />}
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="w-32 bg-slate-100 rounded-full h-2 mr-4 flex-shrink-0 p-[1px] border border-slate-200 shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ease-out ${p.is_suspicious ? 'bg-gradient-to-r from-red-400 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-gradient-to-r from-energy-400 to-energy-600'}`} 
                          style={{ width: `${p.risk_score}%` }}
                        ></div>
                      </div>
                      <span className={`text-lg font-black tracking-tight ${p.is_suspicious ? 'text-red-700' : 'text-slate-900'}`}>
                        {p.risk_score.toFixed(1)}<span className="text-[10px] ml-0.5 opacity-50">%</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg ${p.confidence === 'High' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>
                      {p.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {predictions.length === 0 && (
          <div className="p-16 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
            No analysis results available in telemetry buffer.
          </div>
        )}
      </div>
    </div>

  );
}
