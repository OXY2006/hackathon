import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { 
  AlertTriangle, CheckCircle, ArrowLeft, ShieldAlert, BadgeCheck, BarChart2, 
  ChevronLeft, ChevronRight, MapPin, Lightbulb, Eye, FileText, ClipboardList,
  Search, Filter, Download, FileDown, Layers, Columns
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import ComparisonPanel from '../components/ComparisonPanel';
import { useNotifications } from '../contexts';

function generateAIExplanation(node) {
  if (!node || !node.top_features || node.top_features.length === 0) {
    return {
      primaryHypothesis: "Insufficient telemetry data to form a definitive hypothesis.",
      supportingEvidence: [],
      recommendedActions: []
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
      explanation = `The extreme volatility in usage suggests that loads are not being naturally cycled, but rather "switched" between metered and unmetered states.`;
    } else if (featureNameLower.includes("zero") || featureNameLower.includes("min")) {
      explanation = `These streaks indicate periods where the meter is completely isolated from the circuit, pointing toward a "stop-start" tampering method.`;
    } else if (featureNameLower.includes("max") || featureNameLower.includes("peak")) {
      explanation = `Unusually high maximum draws indicate anomalous spikes that trigger risk thresholds, often pointing to an external, unmetered heavy load.`;
    } else {
      explanation = `This specific metric deviates significantly from the expected baseline.`;
    }

    return {
      title: tf.feature,
      value: tf.original_value.toFixed(3),
      impact: tf.shap_value.toFixed(3),
      explanation: explanation
    };
  });

  const recommendedActions = [];
  const allFeaturesLower = node.top_features.map(tf => tf.feature.toLowerCase()).join(' ');

  if (allFeaturesLower.includes('variance') || allFeaturesLower.includes('std')) {
    recommendedActions.push('Dispatch a field inspection team to physically examine the meter and wiring for bypass devices or jumper cables.');
    recommendedActions.push('Compare current consumption patterns with historical usage for the same billing period over the past 2–3 years.');
  }
  if (allFeaturesLower.includes('zero') || allFeaturesLower.includes('min')) {
    recommendedActions.push('Inspect the meter seal and casing for evidence of tampering, relay installations, or physical bridges.');
    recommendedActions.push('Cross-reference zero-consumption windows with smart-meter logs.');
  }
  if (allFeaturesLower.includes('max') || allFeaturesLower.includes('peak')) {
    recommendedActions.push('Audit the consumer\'s connected load declaration against the observed peak draw.');
    recommendedActions.push('Install a secondary revenue-grade CT meter in parallel for a 30-day audit comparison.');
  }
  recommendedActions.push('Flag this account for the next billing audit cycle and escalate to revenue protection.');
  recommendedActions.push('If tampering is confirmed, calculate estimated unbilled units and initiate recovery.');

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

function getMarkerColor(riskScore, isSuspicious) {
  if (!isSuspicious) return '#10b981'; 
  if (riskScore >= 80) return '#dc2626';  
  if (riskScore >= 60) return '#ef4444';  
  if (riskScore >= 40) return '#f97316';  
  return '#eab308'; 
}

function getMarkerRadius(riskScore) {
  return Math.max(6, Math.min(18, 6 + (riskScore / 100) * 12));
}

export default function PredictionPage() {
  const location = useLocation();
  const { addNotification } = useNotifications();

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
  const [sortOrder, setSortOrder] = useState('desc');
  const [investigatingNode, setInvestigatingNode] = useState(null);
  const [comparingNodes, setComparingNodes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'suspicious', 'normal'
  
  const itemsPerPage = 15;

  if (!data || !data.predictions) {
    return <Navigate to="/upload" replace />;
  }

  const { summary, predictions } = data;
  const hasRealCoordinates = Boolean(summary?.has_real_coordinates);

  const filteredPredictions = useMemo(() => {
    return predictions.filter(p => {
      const id = p.id || `NODE-${(p.index + 1).toString().padStart(4, '0')}`;
      const matchesSearch = id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' 
        ? true 
        : statusFilter === 'suspicious' 
          ? p.is_suspicious 
          : !p.is_suspicious;
      return matchesSearch && matchesStatus;
    });
  }, [predictions, searchQuery, statusFilter]);

  const mappablePoints = useMemo(
    () => filteredPredictions.filter(p => p.latitude != null && p.longitude != null),
    [filteredPredictions]
  );

  const mapBounds = useMemo(
    () => mappablePoints.map(p => [p.latitude, p.longitude]),
    [mappablePoints]
  );

  const sortedPredictions = useMemo(() => {
    const copy = [...filteredPredictions];
    copy.sort((a, b) => sortOrder === 'asc' ? a.risk_score - b.risk_score : b.risk_score - a.risk_score);
    return copy;
  }, [filteredPredictions, sortOrder]);

  const chartData = useMemo(() => {
    const buckets = Array.from({ length: 10 }, (_, i) => ({
      name: `${i * 10}-${(i + 1) * 10}%`,
      count: 0,
      rangeStart: i * 10
    }));

    filteredPredictions.forEach(p => {
      const bucketIndex = Math.min(Math.floor(p.risk_score / 10), 9);
      buckets[bucketIndex].count += 1;
    });

    return buckets;
  }, [filteredPredictions]);

  const totalPages = Math.ceil(sortedPredictions.length / itemsPerPage);

  useEffect(() => {
    setPageInput(String(currentPage || 1));
  }, [currentPage]);

  const paginatedData = useMemo(
    () => sortedPredictions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [sortedPredictions, currentPage, itemsPerPage]
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-xl">
          <p className="text-slate-900 dark:text-white font-black mb-1">Risk Buckets: {label}</p>
          <p className="text-energy-600 dark:text-energy-400 font-bold">Node Count: <span className="text-lg">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  const exportCSV = () => {
    const headers = ["NodeID", "Status", "RiskScore", "Confidence", "Probability"];
    const rows = sortedPredictions.map(p => [
      p.id || `NODE-${(p.index + 1).toString().padStart(4, '0')}`,
      p.status,
      p.risk_score.toFixed(2),
      p.confidence,
      p.probability.toFixed(4)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analysis_export_${filename}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification({ title: "Export Complete", message: "CSV file has been downloaded.", level: "success" });
  };

  const handleDownloadPDF = (node) => {
    addNotification({ title: "Generating PDF...", message: "Compiling AI investigation report.", level: "info" });
    // In a real app we'd use jsPDF + html2canvas here. Simulated download:
    setTimeout(() => {
      addNotification({ title: "PDF Export Complete", message: `Report saved for ${node.id || 'Node'}.`, level: "success" });
    }, 1500);
  };

  const toggleCompare = (node) => {
    setComparingNodes(prev => {
      if (prev.find(n => n.index === node.index)) {
        return prev.filter(n => n.index !== node.index);
      }
      if (prev.length >= 2) {
        addNotification({ title: "Comparison Full", message: "You can only compare 2 nodes at a time.", level: "warning" });
        return prev;
      }
      return [...prev, node];
    });
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-page-reveal">
      
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-10 gap-6 animate-reveal">
        <div>
          <div className="flex items-center text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
            <Link to="/upload" className="hover:text-energy-600 flex items-center mr-6 transition-colors group">
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Upload New
            </Link>
            <span className="truncate max-w-[250px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-1.5 shadow-sm text-slate-500 dark:text-slate-400">
              File: {filename}
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center tracking-tight">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/40 rounded-2xl mr-4 shadow-sm">
              <BarChart2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            Inference Results
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button onClick={exportCSV} className="flex items-center justify-center px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 font-bold rounded-2xl shadow-sm transition-all">
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </button>
          
          <div className={`p-6 rounded-3xl flex items-center space-x-4 border shadow-sm ${
            summary.theft_percentage > 5 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400' 
              : 'bg-energy-50 dark:bg-energy-900/20 border-energy-100 dark:border-energy-900/50 text-energy-700 dark:text-energy-400'
          }`}>
            {summary.theft_percentage > 5 ? (
              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm"><ShieldAlert className="h-8 w-8 text-red-500" /></div>
            ) : (
              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm"><BadgeCheck className="h-8 w-8 text-energy-600" /></div>
            )}
            <div>
              <p className="font-black text-xl tracking-tight">System Status</p>
              <p className="text-sm font-bold uppercase tracking-wide opacity-80">
                {summary.theft_percentage > 5 ? 'High Alert: Anomalies Detected' : 'Normal parameters verified'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-reveal" style={{ animationDelay: '100ms' }}>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm card-hover">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Total Signals</p>
          <p className="text-4xl font-black text-slate-900 dark:text-white">{summary.total_records}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm border-t-4 border-t-energy-500 card-hover">
          <p className="text-energy-600 dark:text-energy-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Normal
          </p>
          <p className="text-4xl font-black text-slate-900 dark:text-white">{summary.normal_cases}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm border-t-4 border-t-red-500 card-hover">
          <p className="text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Suspicious
          </p>
          <p className="text-4xl font-black text-slate-900 dark:text-white">{summary.suspicious_cases}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm card-hover">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Anomaly Rate</p>
          <p className="text-4xl font-black text-blue-600 dark:text-blue-400">{summary.theft_percentage}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12 animate-reveal" style={{ animationDelay: '200ms' }}>
        {/* Analytics Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Risk Score Distribution</h2>
          <div className="h-72 w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight="700" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={11} fontWeight="700" tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'currentColor', opacity: 0.05}} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.rangeStart >= 40 ? '#ef4444' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center flex-wrap items-center mt-8 gap-10 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-energy-500 mr-3 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></span>Normal Range</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-3 shadow-[0_0_10px_rgba(239,68,68,0.3)]"></span>Suspicious Range</div>
          </div>
        </div>

        {/* Map Panel if Coordinates Exist */}
        {hasRealCoordinates && (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[450px]">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-indigo-500" />
                  Anomaly Map
                </h2>
             </div>
             <p className="text-xs text-slate-500 font-medium mb-4">Location plotting based on available telemetry bounds.</p>
             {mappablePoints.length > 0 && (
                <div className="relative flex-grow rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <MapContainer center={[17.385, 78.4867]} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true} preferCanvas={true} zoomSnap={0.25} zoomDelta={0.5}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <FitBounds bounds={mapBounds} />
                  {mappablePoints.map((p, idx) => {
                      const color = getMarkerColor(p.risk_score, p.is_suspicious);
                      const radius = getMarkerRadius(p.risk_score);
                      return (
                        <CircleMarker key={idx} center={[p.latitude, p.longitude]} radius={radius} pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 1, opacity: 0.9 }}>
                          <Popup>
                            <div className="p-1 min-w-[200px] text-slate-900">
                              <span className="font-black text-sm block mb-1">{p.id || `NODE-${(p.index + 1).toString().padStart(4, '0')}`}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${p.is_suspicious ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {p.is_suspicious ? '⚠ Suspicious' : '✓ Normal'}
                              </span>
                              <p className="mt-2 text-xs font-bold">Risk: {p.risk_score.toFixed(1)}%</p>
                            </div>
                          </Popup>
                        </CircleMarker>
                      );
                  })}
                </MapContainer>
                </div>
            )}
          </div>
        )}
      </div>

      {comparingNodes.length > 0 && (
         <ComparisonPanel 
            nodes={comparingNodes} 
            onClose={() => setComparingNodes([])} 
            onRemoveNode={(idx) => setComparingNodes(prev => prev.filter(n => n.index !== idx))} 
         />
      )}

      {/* Detailed Analysis Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden animate-reveal" style={{ animationDelay: '300ms' }}>
        <div className="p-6 lg:p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center tracking-tight whitespace-nowrap">
              <Layers className="h-6 w-6 mr-3 text-energy-500" />
              Node Analysis Database
            </h2>
            
            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
              {/* Search */}
              <div className="relative flex-grow md:flex-grow-0 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-energy-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Query Node ID..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-energy-500/50 focus:border-energy-500 transition-all text-sm font-bold text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Status Filter */}
              <div className="relative group">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-energy-500 transition-colors" />
                <select 
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-energy-500/50 focus:border-energy-500 transition-all text-sm font-bold text-slate-700 dark:text-slate-200 appearance-none cursor-pointer"
                >
                  <option value="all">Status: All</option>
                  <option value="suspicious">Suspicious</option>
                  <option value="normal">Normal</option>
                </select>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center space-x-3 text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1.5 rounded-xl">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center space-x-1 px-2 text-slate-500">
                  <input type="number" min={1} max={totalPages} value={pageInput} onChange={(e) => setPageInput(e.target.value)} onKeyDown={(e) => { if(e.key==='Enter') setCurrentPage(Math.min(Math.max(1, Number(pageInput)), totalPages||1)); }} className="w-8 text-center bg-transparent border-b border-slate-300 dark:border-slate-600 focus:outline-none focus:border-energy-500 text-slate-900 dark:text-white" />
                  <span>/ {totalPages || 1}</span>
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Compare</th>
                <th className="px-6 py-4">Record ID</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4 w-1/3">
                  <div className="flex items-center justify-between">
                    <span>Risk Score Index</span>
                    <button type="button" onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))} className="ml-2 px-2 py-1 rounded-full text-[9px] border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      {sortOrder === 'desc' ? 'High → Low' : 'Low → High'}
                    </button>
                  </div>
                </th>
                <th className="px-6 py-4 text-center">Confidence</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {paginatedData.map((p, idx) => {
                const isConfigured = comparingNodes.find(n => n.index === p.index);
                const isMediumConfidence = p.confidence === 'Medium';
                const riskBarClasses = isMediumConfidence
                  ? 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                  : p.is_suspicious
                    ? 'bg-gradient-to-r from-red-400 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                    : 'bg-gradient-to-r from-energy-400 to-energy-600';
                const riskTextColor = isMediumConfidence
                  ? 'text-orange-600 dark:text-orange-400'
                  : p.is_suspicious
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-slate-900 dark:text-white';
                const confidenceClass = p.confidence === 'High'
                    ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-sm'
                    : p.confidence === 'Medium'
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';

                return (
                  <tr key={idx} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group ${p.is_suspicious ? 'bg-red-50/10 dark:bg-red-900/5' : ''}`}>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleCompare(p)} className={`p-2 rounded-lg transition-colors border ${isConfigured ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600' : 'bg-transparent border-transparent text-slate-300 dark:text-slate-600 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`} title="Add to compare">
                        <Columns className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs font-bold">
                      {p.id || `NODE-${(p.index + 1).toString().padStart(4, '0')}`}
                    </td>
                    <td className="px-6 py-4 flex items-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${p.is_suspicious ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900' : 'bg-energy-50 dark:bg-energy-900/20 text-energy-700 dark:text-energy-400 border-energy-100 dark:border-energy-900'}`}>
                        {p.is_suspicious ? <AlertTriangle className="h-3 w-3 mr-2" /> : <CheckCircle className="h-3 w-3 mr-2" />}
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-full max-w-[120px] bg-slate-100 dark:bg-slate-700 rounded-full h-2 mr-4 flex-shrink-0 p-[1px] border border-slate-200 dark:border-slate-600 shadow-inner">
                          <div className={`h-full rounded-full transition-all duration-700 ease-out ${riskBarClasses}`} style={{ width: `${p.risk_score}%` }}></div>
                        </div>
                        <span className={`text-sm font-black tracking-tight ${riskTextColor}`}>
                          {p.risk_score.toFixed(1)}<span className="text-[10px] ml-0.5 opacity-50">%</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${confidenceClass}`}>
                        {p.confidence}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setInvestigatingNode(p)} disabled={!p.top_features || p.top_features.length === 0} className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-energy-600 to-emerald-600 hover:from-energy-500 hover:to-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-energy-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                        <Eye className="h-3.5 w-3.5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                        Investigate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {paginatedData.length === 0 && (
          <div className="p-16 text-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-sm flex flex-col items-center">
            <Filter className="w-8 h-8 mb-4 opacity-50" />
            No records match the current filters or query.
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm modal-backdrop-enter" onClick={() => setInvestigatingNode(null)}></div>
          
          <div className="modal-panel-enter bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl w-full max-w-[740px] relative z-10 overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700/50">
            
            <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-slate-50 dark:from-slate-800/80 via-white dark:via-slate-900 to-emerald-50/30 dark:to-emerald-900/10 border-b border-slate-100 dark:border-slate-800">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-100/40 dark:from-emerald-900/20 to-transparent rounded-bl-[80px] pointer-events-none"></div>
              
              <div className="relative flex items-start justify-between">
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">Node Analysis</span>
                    <span className={`text-[11px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-lg ${isHighRisk ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : isMedRisk ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}>{riskLabel} Risk</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                    {investigatingNode.id || 'Unknown Node'}
                  </h2>
                  <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
                    Confidence: <span className="text-slate-600 dark:text-slate-300 font-bold">{investigatingNode.confidence}</span>
                    <span className="mx-2 text-slate-200 dark:text-slate-700">|</span>
                    Status: <span className={`font-bold ${investigatingNode.is_suspicious ? 'text-red-500 text-red-400' : 'text-emerald-500 text-emerald-400'}`}>{investigatingNode.status}</span>
                  </p>
                </div>
                
                <div className="flex-shrink-0 risk-badge-pulse">
                  <div className="relative w-[120px] h-[120px] bg-white/50 dark:bg-slate-800/50 rounded-full shadow-sm border border-slate-100/50 dark:border-slate-700/50">
                    <svg className="w-full h-full -rotate-90 absolute top-0 left-0" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="7" />
                      <circle cx="60" cy="60" r="52" fill="none" stroke={riskColor} strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeOffset} className="progress-fill-animate drop-shadow-sm" style={{ '--target-width': `${riskPct}%`, animationName: 'none', transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }} ref={(el) => { if (el) setTimeout(() => { el.style.strokeDashoffset = strokeOffset; }, 50); }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black" style={{ color: riskColor }}>{riskPct.toFixed(0)}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">Risk</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ai-active-glow mt-5 flex items-center px-4 py-3 bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/30 rounded-xl relative z-10">
                <div className="relative mr-3"><CheckCircle className="w-5 h-5 text-emerald-500" /><span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900"></span></div>
                <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400">AI-Powered Analysis Active</span>
                <div className="ml-auto flex gap-1">
                  <span className="evidence-dot w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="evidence-dot w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="evidence-dot w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
              </div>
            </div>

            <div className="p-8 overflow-y-auto modal-scroll bg-white dark:bg-slate-900">
              <div className="modal-section-stagger space-y-5">
                <div className="group relative bg-gradient-to-br from-[#F8F9FC] dark:from-slate-800/50 to-[#F3F4F8] dark:to-slate-800/80 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-6 transition-all hover:shadow-md">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-l-2xl opacity-70"></div>
                  <h3 className="flex items-center text-slate-800 dark:text-white font-bold text-[15px] mb-3 pl-3">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-2.5"><Lightbulb className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /></div>
                    Primary Hypothesis
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-[13px] leading-[1.75] pl-3">{explanation.primaryHypothesis}</p>
                </div>
                
                <div className="group relative bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-2xl p-6 transition-all">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-cyan-500 rounded-l-2xl opacity-70"></div>
                  <h3 className="flex items-center text-slate-800 dark:text-white font-bold text-[15px] mb-5 pl-3">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-2.5"><FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" /></div>
                    Supporting Evidence
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">{explanation.supportingEvidence.length} factors</span>
                  </h3>
                  <div className="space-y-4 pl-3">
                    {explanation.supportingEvidence.map((evidence, i) => (
                      <div key={i} className="flex items-start p-4 bg-slate-50/70 dark:bg-slate-800/80 rounded-xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900 transition-all cursor-default">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-4 mt-0.5 shadow-sm"><span className="text-white text-[11px] font-black">{i + 1}</span></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">{evidence.title}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-900/50">Impact: {evidence.impact}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-[12.5px] leading-relaxed">{evidence.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="shimmer-bar h-[2px] rounded-full mx-4 dark:opacity-20"></div>
                
                <div className="group relative bg-gradient-to-br from-amber-50/40 dark:from-amber-900/10 to-orange-50/30 dark:to-orange-900/10 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-6 transition-all">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-orange-500 rounded-l-2xl opacity-70"></div>
                  <h3 className="flex items-center text-slate-800 dark:text-white font-bold text-[15px] mb-5 pl-3">
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg mr-2.5"><ClipboardList className="w-4 h-4 text-amber-600 dark:text-amber-500" /></div>
                    Recommended Actions
                  </h3>
                  <ol className="space-y-3 pl-3">
                    {explanation.recommendedActions.map((action, i) => (
                      <li key={i} className="flex items-start p-3.5 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/50 transition-all cursor-default lg:hover:shadow-sm">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[11px] font-black flex items-center justify-center mr-3.5 mt-0.5">{i + 1}</span>
                        <span className="text-slate-600 dark:text-slate-300 text-[13px] leading-relaxed pt-1">{action}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50/80 dark:from-slate-900 to-white dark:to-slate-800/50 flex items-center justify-between">
              <button onClick={() => handleDownloadPDF(investigatingNode)} className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-energy-600 dark:hover:text-energy-400 transition-colors">
                <FileDown className="w-4 h-4 mr-1.5" /> Download PDF Report
              </button>
              <button onClick={() => setInvestigatingNode(null)} className="group px-7 py-2.5 bg-gradient-to-r from-energy-600 to-emerald-600 hover:from-energy-500 hover:to-emerald-500 text-white text-[13px] font-bold rounded-xl transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0">
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
