import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, ArrowLeft, ShieldAlert, BadgeCheck, BarChart2, ChevronLeft, ChevronRight, MapPin, Lightbulb, Eye, FileText, ClipboardList } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

function generateAIExplanation(node) {
  if (!node || !node.top_features || node.top_features.length === 0) {
    return {
      primaryHypothesis: "Insufficient telemetry data to form a definitive hypothesis.",
      supportingEvidence: []
    };
  }

  const topFeature = node.top_features[0].feature.toLowerCase();
  let primaryHypothesis = "";
  if (topFeature.includes("variance") || topFeature.includes("std")) {
    primaryHypothesis = "The consumer is likely employing a **manual bypass or \"jumper\" mechanism** used in conjunction with a **shunting device**, allowing them to selectively divert heavy loads around the meter during peak usage hours while maintaining a minimal \"baseline\" presence to avoid detection.";
  } else if (topFeature.includes("zero") || topFeature.includes("min")) {
    primaryHypothesis = "The meter is experiencing periodic complete isolation from the circuit. This is characteristic of a **remote-controlled relay or physical bridge** that completely halts metered consumption during certain periods.";
  } else if (topFeature.includes("max") || topFeature.includes("peak")) {
    primaryHypothesis = "The analysis indicates unusually high peak draws that do not correlate with historical usage profiles or similar consumers, suggesting an unmetered high-draw appliance may be connected via a **partial bypass**.";
  } else {
    primaryHypothesis = "Anomalous telemetry patterns have been detected that deviate significantly from expected baselines. This combination of factors strongly suggests sophisticated tampering to obscure actual consumption.";
  }

  const supportingEvidence = node.top_features.map(tf => {
    let explanation = "";
    const featureNameLower = tf.feature.toLowerCase();
    
    if (featureNameLower.includes("variance") || featureNameLower.includes("std")) {
      explanation = `The extreme volatility in usage suggests that loads are not being naturally cycled, but rather "switched" between metered and unmetered states. This is characteristic of a consumer manually engaging a bypass when high-draw appliances (HVAC, machinery) are active.`;
    } else if (featureNameLower.includes("zero") || featureNameLower.includes("min")) {
      explanation = `These streaks indicate periods where the meter is completely isolated from the circuit. Unlike a vacant property, these streaks appear to be interspersed with high-variance activity, pointing toward a "stop-start" tampering method such as a remote-controlled relay or physical bridge.`;
    } else if (featureNameLower.includes("max") || featureNameLower.includes("peak")) {
      explanation = `Unusually high maximum draws indicate anomalous spikes that trigger risk thresholds. These sudden surges often point to an external, unmetered heavy load.`;
    } else {
      explanation = `This specific metric deviates significantly from the expected baseline, contributing highly to the comprehensive anomaly model.`;
    }

    return {
      title: tf.feature,
      value: tf.original_value.toFixed(3),
      impact: tf.shap_value.toFixed(3),
      explanation: explanation
    };
  });

  // Generate recommended actions based on the dominant anomaly type
  const recommendedActions = [];
  const allFeaturesLower = node.top_features.map(tf => tf.feature.toLowerCase()).join(' ');

  if (allFeaturesLower.includes('variance') || allFeaturesLower.includes('std')) {
    recommendedActions.push('Dispatch a field inspection team to physically examine the meter and wiring for bypass devices or jumper cables.');
    recommendedActions.push('Compare current consumption patterns with historical usage for the same billing period over the past 2–3 years.');
  }
  if (allFeaturesLower.includes('zero') || allFeaturesLower.includes('min')) {
    recommendedActions.push('Inspect the meter seal and casing for evidence of tampering, relay installations, or physical bridges.');
    recommendedActions.push('Cross-reference zero-consumption windows with smart-meter heartbeat logs to confirm the meter was powered on during those intervals.');
  }
  if (allFeaturesLower.includes('max') || allFeaturesLower.includes('peak')) {
    recommendedActions.push('Audit the consumer\'s connected load declaration against the observed peak draw to identify undeclared high-draw appliances.');
    recommendedActions.push('Install a secondary revenue-grade CT meter in parallel for a 30-day audit comparison.');
  }
  // Always include these general actions
  recommendedActions.push('Flag this account for the next billing audit cycle and escalate to the revenue protection unit.');
  recommendedActions.push('If tampering is confirmed, calculate the estimated unbilled units and initiate a recovery assessment.');

  return { primaryHypothesis, supportingEvidence, recommendedActions };
}

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
  const [investigatingNode, setInvestigatingNode] = useState(null);
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
                <th className="px-8 py-5 text-center">Action</th>
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
                  <td className="px-8 py-5 text-center">
                    <button
                      onClick={() => setInvestigatingNode(p)}
                      disabled={!p.top_features || p.top_features.length === 0}
                      className="group inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-[#424B6B] to-[#353D5B] hover:from-[#353D5B] hover:to-[#2A3350] text-white text-[12px] font-bold rounded-xl transition-all duration-300 shadow-md shadow-slate-900/10 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
                    >
                      <Eye className="h-3.5 w-3.5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      Investigate AI
                    </button>
                  </td>
                </tr>
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

      {/* AI Investigation Modal */}
      {investigatingNode && (() => {
        const explanation = generateAIExplanation(investigatingNode);
        const riskPct = investigatingNode.risk_score;
        const isHighRisk = riskPct >= 70;
        const isMedRisk = riskPct >= 40 && riskPct < 70;
        const riskColor = isHighRisk ? '#ef4444' : isMedRisk ? '#f59e0b' : '#10b981';
        const riskLabel = isHighRisk ? 'Critical' : isMedRisk ? 'Elevated' : 'Low';
        const circumference = 2 * Math.PI * 52;
        const strokeOffset = circumference - (riskPct / 100) * circumference;

        return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Animated Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm modal-backdrop-enter" 
            onClick={() => setInvestigatingNode(null)}
          ></div>
          
          {/* Modal Panel */}
          <div className="modal-panel-enter bg-white rounded-[24px] shadow-[0_32px_80px_rgba(0,0,0,0.12),0_0_1px_rgba(0,0,0,0.08)] w-full max-w-[740px] relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* ── Gradient Header ── */}
            <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 border-b border-slate-100/80">
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-100/40 to-transparent rounded-bl-[80px] pointer-events-none"></div>
              
              <div className="relative flex items-start justify-between">
                {/* Left: Node info */}
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                      Node Analysis
                    </span>
                    <span className={`text-[11px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-lg ${
                      isHighRisk ? 'bg-red-50 text-red-600' : isMedRisk ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {riskLabel} Risk
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                    {investigatingNode.id || 'Unknown Node'}
                  </h2>
                  <p className="text-sm text-slate-400 font-medium">
                    Confidence: <span className="text-slate-600 font-bold">{investigatingNode.confidence}</span>
                    <span className="mx-2 text-slate-200">|</span>
                    Status: <span className={`font-bold ${investigatingNode.is_suspicious ? 'text-red-500' : 'text-emerald-500'}`}>
                      {investigatingNode.status}
                    </span>
                  </p>
                </div>
                
                {/* Right: Animated Risk Ring */}
                <div className="flex-shrink-0 risk-badge-pulse">
                  <div className="relative w-[120px] h-[120px]">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="7" />
                      <circle 
                        cx="60" cy="60" r="52" fill="none" 
                        stroke={riskColor}
                        strokeWidth="7" 
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeOffset}
                        className="progress-fill-animate drop-shadow-sm"
                        style={{ '--target-width': `${riskPct}%`, animationName: 'none', transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        ref={(el) => { if (el) setTimeout(() => { el.style.strokeDashoffset = strokeOffset; }, 50); }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black" style={{ color: riskColor }}>{riskPct.toFixed(1)}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Risk Score</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Active Banner */}
              <div className="ai-active-glow mt-5 flex items-center px-4 py-3 bg-emerald-50/60 border border-emerald-200/50 rounded-xl">
                <div className="relative mr-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white"></span>
                </div>
                <span className="text-[13px] font-bold text-emerald-700">AI-Powered Analysis Active</span>
                <div className="ml-auto flex gap-1">
                  <span className="evidence-dot w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="evidence-dot w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="evidence-dot w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
              </div>
            </div>

            {/* ── Scrollable Body ── */}
            <div className="p-8 overflow-y-auto modal-scroll">
              <div className="modal-section-stagger space-y-5">
                
                {/* ─ Primary Hypothesis ─ */}
                <div className="group relative bg-gradient-to-br from-[#F8F9FC] to-[#F3F4F8] border border-slate-200/60 rounded-2xl p-6 hover:border-slate-300/80 transition-all duration-300 hover:shadow-md">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-l-2xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <h3 className="flex items-center text-slate-800 font-bold text-[15px] mb-3 pl-3">
                    <div className="p-1.5 bg-indigo-100 rounded-lg mr-2.5">
                      <Lightbulb className="w-4 h-4 text-indigo-500" />
                    </div>
                    Primary Hypothesis
                  </h3>
                  <p className="text-slate-600 text-[13px] leading-[1.75] pl-3">
                    {explanation.primaryHypothesis}
                  </p>
                </div>
                
                {/* ─ Supporting Evidence ─ */}
                <div className="group relative bg-white border border-slate-200/60 rounded-2xl p-6 hover:border-blue-200/80 transition-all duration-300 hover:shadow-md">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-cyan-500 rounded-l-2xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <h3 className="flex items-center text-slate-800 font-bold text-[15px] mb-5 pl-3">
                    <div className="p-1.5 bg-blue-100 rounded-lg mr-2.5">
                      <FileText className="w-4 h-4 text-blue-500" />
                    </div>
                    Supporting Evidence
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-300 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                      {explanation.supportingEvidence.length} factor{explanation.supportingEvidence.length !== 1 ? 's' : ''}
                    </span>
                  </h3>
                  <div className="space-y-4 pl-3">
                    {explanation.supportingEvidence.map((evidence, i) => (
                      <div key={i} className="group/item flex items-start p-4 bg-slate-50/70 rounded-xl border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300 cursor-default">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-4 mt-0.5 shadow-sm group-hover/item:shadow-md group-hover/item:scale-105 transition-all duration-300">
                          <span className="text-white text-[11px] font-black">{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-bold text-slate-800 text-[13px]">{evidence.title}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">
                              Impact: {evidence.impact}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[12.5px] leading-relaxed">{evidence.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Shimmer divider */}
                <div className="shimmer-bar h-[2px] rounded-full mx-4"></div>
                
                {/* ─ Recommended Actions ─ */}
                <div className="group relative bg-gradient-to-br from-amber-50/40 to-orange-50/30 border border-amber-200/50 rounded-2xl p-6 hover:border-amber-300/70 transition-all duration-300 hover:shadow-md">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-orange-500 rounded-l-2xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <h3 className="flex items-center text-slate-800 font-bold text-[15px] mb-5 pl-3">
                    <div className="p-1.5 bg-amber-100 rounded-lg mr-2.5">
                      <ClipboardList className="w-4 h-4 text-amber-600" />
                    </div>
                    Recommended Actions
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                      Action Plan
                    </span>
                  </h3>
                  <ol className="space-y-3 pl-3">
                    {explanation.recommendedActions.map((action, i) => (
                      <li key={i} className="group/action flex items-start p-3.5 rounded-xl hover:bg-white/80 transition-all duration-300 cursor-default">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[11px] font-black flex items-center justify-center mr-3.5 mt-0.5 shadow-sm group-hover/action:shadow-md group-hover/action:scale-110 transition-all duration-300">
                          {i + 1}
                        </span>
                        <span className="text-slate-600 text-[13px] leading-relaxed pt-1">{action}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
            
            {/* ── Sticky Footer ── */}
            <div className="px-8 py-5 border-t border-slate-100 bg-gradient-to-r from-slate-50/80 to-white flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></div>
                Generated by AI anomaly engine
              </div>
              <button 
                onClick={() => setInvestigatingNode(null)}
                className="group px-7 py-2.5 bg-gradient-to-r from-[#424B6B] to-[#353D5B] hover:from-[#353D5B] hover:to-[#2A3350] text-white text-[13px] font-bold rounded-xl transition-all duration-300 shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
              >
                Close
                <span className="ml-2 inline-block group-hover:translate-x-0.5 transition-transform duration-200">✕</span>
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>

  );
}
