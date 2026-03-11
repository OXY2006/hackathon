import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, ArrowLeft, ShieldAlert, BadgeCheck, BarChart2, ChevronLeft, ChevronRight, MapPin, Lightbulb } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

// Auto-fit bounds to all markers
function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [map, bounds]);
  return null;
}

// Color mapping based on risk score
function getMarkerColor(riskScore, isSuspicious) {
  if (!isSuspicious) return '#10b981'; // green
  if (riskScore >= 80) return '#dc2626';  // dark red
  if (riskScore >= 60) return '#ef4444';  // red
  if (riskScore >= 40) return '#f97316';  // orange
  return '#eab308'; // yellow-ish for borderline
}

function getMarkerRadius(riskScore) {
  return Math.max(6, Math.min(18, 6 + (riskScore / 100) * 12));
}

export default function PredictionPage() {
  const location = useLocation();

  // Prefer router state, but fall back to sessionStorage so refresh / direct nav still works
  let data = location.state?.results;
  let filename = location.state?.filename;

  if (!data || !data.predictions) {
    const stored = sessionStorage.getItem('latestResults');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        data = parsed.results;
        filename = parsed.filename;
      } catch (e) {
        console.warn('Failed to parse latestResults from sessionStorage', e);
      }
    }
  }

  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = highest risk first, 'asc' = lowest risk first
  const [expandedNode, setExpandedNode] = useState(null);
  const itemsPerPage = 15;

  if (!data || !data.predictions) {
    return <Navigate to="/upload" replace />;
  }

  const { summary, predictions } = data;
  const hasRealCoordinates = Boolean(summary?.has_real_coordinates);

  // Precompute mappable points and their bounds for Leaflet to avoid recomputing on every render
  const mappablePoints = useMemo(
    () => predictions.filter(p => p.latitude != null && p.longitude != null),
    [predictions]
  );

  const mapBounds = useMemo(
    () => mappablePoints.map(p => [p.latitude, p.longitude]),
    [mappablePoints]
  );

  // Sort predictions by risk score based on selected sort order
  const sortedPredictions = useMemo(() => {
    const copy = [...predictions];
    copy.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.risk_score - b.risk_score;
      }
      return b.risk_score - a.risk_score;
    });
    return copy;
  }, [predictions, sortOrder]);

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

  // Keep the input field in sync when currentPage changes programmatically
  useEffect(() => {
    setPageInput(String(currentPage || 1));
  }, [currentPage]);

  const paginatedData = useMemo(
    () =>
      sortedPredictions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [sortedPredictions, currentPage, itemsPerPage]
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

      {/* Geospatial Anomaly Map (only when real latitude/longitude is present in the dataset) */}
      {hasRealCoordinates && (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <MapPin className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Anomaly Map</h2>
              <p className="text-slate-500 text-sm font-medium">
                Each node is plotted on a simulated grid around Hyderabad – color and size indicate theft risk.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-xs font-bold uppercase tracking-widest text-slate-500">
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              Normal
            </span>
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
              Suspicious
            </span>
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-2 shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
              Borderline
            </span>
          </div>
        </div>

        {mappablePoints.length > 0 && (
          <div className="relative">
            <div style={{ height: '60vh', width: '100%' }}>
                <MapContainer
                  center={[17.385, 78.4867]}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                  preferCanvas={true}
                  zoomSnap={0.25}
                  zoomDelta={0.5}
                  wheelDebounceTime={40}
                  wheelPxPerZoomLevel={80}
                >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds bounds={mapBounds} />

                {mappablePoints.map((p, idx) => {
                    const color = getMarkerColor(p.risk_score, p.is_suspicious);
                    const radius = getMarkerRadius(p.risk_score);
                    return (
                      <CircleMarker
                        key={idx}
                        center={[p.latitude, p.longitude]}
                        radius={radius}
                        pathOptions={{
                          color,
                          fillColor: color,
                          fillOpacity: 0.6,
                          weight: 2,
                          opacity: 0.9,
                        }}
                      >
                        <Popup>
                          <div className="min-w-[200px] p-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-black text-slate-900 text-sm">
                                {p.id || `NODE-${(p.index + 1).toString().padStart(4, '0')}`}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                p.is_suspicious
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {p.is_suspicious ? '⚠ Suspicious' : '✓ Normal'}
                              </span>
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-semibold">Risk Score</span>
                                <span className={`font-black ${p.is_suspicious ? 'text-red-600' : 'text-green-600'}`}>
                                  {p.risk_score.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${p.risk_score}%`, backgroundColor: color }}
                                />
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-semibold">Confidence</span>
                                <span className="font-bold text-slate-700">{p.confidence}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-semibold">Coordinates</span>
                                <span className="font-mono text-slate-600 text-[10px]">
                                  {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
              </MapContainer>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Detailed Analysis Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center tracking-tight">
            Detailed Node Analysis 
            <span className="ml-4 text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white text-slate-400 rounded-full border border-slate-200 shadow-sm">
              Sorted by Risk ({sortOrder === 'desc' ? 'High → Low' : 'Low → High'})
            </span>
          </h2>
          
          {/* Pagination Controls */}
          <div className="flex items-center space-x-3 text-sm font-bold">
            <div className="flex items-center mr-4 space-x-2 text-slate-400">
              <span>Page</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={(e) => {
                  setPageInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const raw = Number(pageInput);
                    if (Number.isNaN(raw)) return;
                    const clamped = Math.min(Math.max(1, raw), totalPages || 1);
                    setCurrentPage(clamped);
                  }
                }}
                className="w-14 px-2 py-1 text-center text-slate-900 font-black bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-energy-400 focus:border-energy-400"
              />
              <span className="text-slate-400">
                of <span className="text-slate-900 font-black">{totalPages}</span>
              </span>
            </div>
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
                <th className="px-8 py-5 w-1/3">
                  <div className="flex items-center justify-between">
                    <span>Risk Score Index</span>
                    <button
                      type="button"
                      onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
                      className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                    >
                      {sortOrder === 'desc' ? 'High → Low' : 'Low → High'}
                    </button>
                  </div>
                </th>
                <th className="px-8 py-5 text-right">Model Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedData.map((p, idx) => {
                const isMediumConfidence = p.confidence === 'Medium';
                const riskBarClasses = isMediumConfidence
                  ? 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                  : p.is_suspicious
                    ? 'bg-gradient-to-r from-red-400 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                    : 'bg-gradient-to-r from-energy-400 to-energy-600';
                const riskTextColor = isMediumConfidence
                  ? 'text-orange-600'
                  : p.is_suspicious
                    ? 'text-red-700'
                    : 'text-slate-900';
                const confidenceClass =
                  p.confidence === 'High'
                    ? 'bg-slate-900 text-white shadow-md'
                    : p.confidence === 'Medium'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-slate-100 text-slate-500';

                return (
                  <React.Fragment key={idx}>
                <tr className={`hover:bg-slate-50/50 transition-colors group ${p.is_suspicious ? 'bg-red-50/30' : ''}`}>
                  <td className="px-8 py-5 text-slate-600 font-mono text-xs font-bold">
                    {p.id || `NODE-${(p.index + 1).toString().padStart(4, '0')}`}
                  </td>
                  <td className="px-8 py-5 flex items-center">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                      p.is_suspicious 
                        ? 'bg-red-50 text-red-600 border-red-100' 
                        : 'bg-energy-50 text-energy-700 border-energy-100'
                    }`}>
                      {p.is_suspicious && <AlertTriangle className="h-3 w-3 mr-2" />}
                      {!p.is_suspicious && <CheckCircle className="h-3 w-3 mr-2" />}
                      {p.status}
                    </span>
                    {p.top_features && (
                      <button 
                        onClick={() => setExpandedNode(expandedNode === idx ? null : idx)}
                        className="ml-3 p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-amber-600 transition-colors shadow-sm bg-white border border-slate-200"
                        title="View AI Explanation"
                      >
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                      </button>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="w-32 bg-slate-100 rounded-full h-2 mr-4 flex-shrink-0 p-[1px] border border-slate-200 shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ease-out ${riskBarClasses}`} 
                          style={{ width: `${p.risk_score}%` }}
                        ></div>
                      </div>
                      <span className={`text-lg font-black tracking-tight ${riskTextColor}`}>
                        {p.risk_score.toFixed(1)}<span className="text-[10px] ml-0.5 opacity-50">%</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg ${confidenceClass}`}>
                      {p.confidence}
                    </span>
                  </td>
                </tr>
                {expandedNode === idx && p.top_features && (
                  <tr className="bg-slate-50/80 border-t border-b border-slate-100 shadow-inner">
                    <td colSpan="4" className="px-8 py-6">
                      <div className="flex items-start">
                        <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mr-5 shadow-sm border border-amber-200">
                          <Lightbulb className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-black text-slate-900 mb-1 flex items-center tracking-tight">
                            AI Explanation <span className="ml-3 text-[10px] px-2 py-0.5 rounded-full bg-slate-200 uppercase text-slate-600 font-black tracking-widest">Top Risk Factors</span>
                          </h4>
                          <p className="text-sm text-slate-500 mb-5 font-medium max-w-2xl leading-relaxed">
                            The anomaly detection model flagged this node primarily due to the following anomalous telemetry patterns compared to expected baselines:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {p.top_features.map((tf, i) => (
                              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-colors">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-400 opacity-80"></div>
                                <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-3 truncate pr-2" title={tf.feature}>{tf.feature}</p>
                                <div className="flex justify-between items-end">
                                  <div>
                                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-0.5">Value</p>
                                    <p className="text-lg font-black text-slate-900">{tf.original_value.toFixed(2)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] uppercase text-red-400 font-bold tracking-widest mb-0.5">Risk Impact</p>
                                    <p className="text-lg font-black text-red-600">+{tf.shap_value.toFixed(3)}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
                );
              })}
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
