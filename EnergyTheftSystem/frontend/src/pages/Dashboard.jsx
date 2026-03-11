import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Target, Activity, CheckCircle, AlertTriangle, ShieldCheck, Cpu, Layers, Hash, Gauge } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function AnimatedNumber({ target, suffix = '', prefix = '' }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span ref={ref}>{prefix}{typeof target === 'number' && target < 1 ? value.toFixed(1) : Math.round(value)}{suffix}</span>;
}

export default function Dashboard() {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastAnalysis, setLastAnalysis] = useState(null);

  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        const response = await axios.get('http://localhost:5000/model-info');
        setModelInfo(response.data);
      } catch (err) {
        console.error('Failed to fetch model info:', err);
        setError('Failed to connect to backend server. Make sure it is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchModelInfo();

    // Load last analysis summary
    try {
      const stored = sessionStorage.getItem('latestResults');
      if (stored) {
        const { results, filename } = JSON.parse(stored);
        if (results?.summary) setLastAnalysis({ ...results.summary, filename });
      }
    } catch {}
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-14 w-14 border-[3px] border-slate-100 dark:border-slate-700 border-t-energy-500"></div>
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 animate-pulse">Loading system data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-red-200 dark:border-red-800 flex flex-col items-center animate-reveal">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Connection Error</h2>
          <p className="text-red-500/80 dark:text-red-400/80 text-center font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const formatPercent = (val) => `${(val * 100).toFixed(1)}%`;

  const metricConfig = [
    { label: "Accuracy", value: modelInfo.test_accuracy, icon: Target, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-900/30", borderColor: "border-t-blue-500" },
    { label: "Precision", value: modelInfo.test_precision, icon: CheckCircle, color: "text-energy-600 dark:text-energy-400", bgColor: "bg-green-50 dark:bg-green-900/30", borderColor: "border-t-energy-500" },
    { label: "Recall", value: modelInfo.test_recall, icon: Activity, color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-50 dark:bg-indigo-900/30", borderColor: "border-t-indigo-500" },
    { label: "ROC AUC", value: modelInfo.roc_auc, icon: Gauge, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-900/30", borderColor: "border-t-purple-500" },
  ];

  const donutData = lastAnalysis ? [
    { name: 'Suspicious', value: lastAnalysis.suspicious_cases, color: '#ef4444' },
    { name: 'Normal', value: lastAnalysis.normal_cases, color: '#10b981' },
  ] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-page-reveal">
      {/* Header */}
      <div className="mb-12 animate-reveal">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-gradient-to-br from-energy-500 to-emerald-600 rounded-2xl shadow-lg shadow-energy-500/20">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">System Dashboard</h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Active Intelligence Monitoring</p>
          </div>
        </div>
      </div>

      {modelInfo && (
        <div className="space-y-10">
          {/* Main metrics with animated numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricConfig.map((metric, i) => (
              <div key={i} className={`metric-animate bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-xl transition-all duration-500 card-hover border-t-4 ${metric.borderColor}`}>
                <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                  <metric.icon className={`h-28 w-28 ${metric.color}`} />
                </div>
                <div className="flex items-center space-x-3 mb-5">
                  <div className={`p-2.5 rounded-xl ${metric.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">{metric.label}</h3>
                </div>
                <p className="text-4xl font-black text-slate-900 dark:text-white">
                  <AnimatedNumber target={metric.value * 100} suffix="%" />
                </p>
              </div>
            ))}
          </div>

          {/* Analysis Overview (if available) + Donut Chart */}
          {lastAnalysis && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 animate-reveal card-hover" style={{ animationDelay: '150ms' }}>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight flex items-center">
                <Activity className="h-5 w-5 mr-3 text-energy-500" />
                Last Analysis Overview
                <span className="ml-auto text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 px-3 py-1 rounded-full">{lastAnalysis.filename}</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Nodes', value: lastAnalysis.total_records, color: 'text-slate-900 dark:text-white', bg: 'bg-slate-50 dark:bg-slate-700/50' },
                    { label: 'Suspicious', value: lastAnalysis.suspicious_cases, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                    { label: 'Normal', value: lastAnalysis.normal_cases, color: 'text-energy-600 dark:text-energy-400', bg: 'bg-energy-50 dark:bg-energy-900/20' },
                    { label: 'Theft Rate', value: `${lastAnalysis.theft_percentage}%`, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                  ].map((item, i) => (
                    <div key={i} className={`${item.bg} rounded-2xl p-5 text-center`}>
                      <p className="text-3xl font-black mb-1">
                        <span className={item.color}>
                          {typeof item.value === 'number' ? <AnimatedNumber target={item.value} /> : item.value}
                        </span>
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{item.label}</p>
                    </div>
                  ))}
                </div>
                {/* Donut chart */}
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={90}
                        dataKey="value"
                        stroke="none"
                        paddingAngle={4}
                      >
                        {donutData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-6 mt-2">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-xs font-bold text-slate-500 dark:text-slate-400">Suspicious</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-energy-500" /><span className="text-xs font-bold text-slate-500 dark:text-slate-400">Normal</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Engine Config */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm animate-reveal card-hover relative overflow-hidden" style={{ animationDelay: '200ms' }}>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-energy-400 to-emerald-500 rounded-l-3xl"></div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 border-b border-slate-100 dark:border-slate-700 pb-5 tracking-tight flex items-center">
                <Cpu className="h-5 w-5 mr-3 text-energy-500" />
                Engine Config
              </h2>
              <ul className="space-y-6">
                {[
                  { label: "Architecture", value: modelInfo.best_model, isTag: true },
                  { label: "Feature Count", value: modelInfo.n_features, icon: Hash },
                  { label: "Threshold", value: modelInfo.optimal_threshold, icon: Gauge },
                  { label: "F1 Score", value: formatPercent(modelInfo.test_f1), icon: Target },
                ].map((item, i) => (
                  <li key={i} className="flex justify-between items-center group/item hover:bg-slate-50 dark:hover:bg-slate-700/50 -mx-3 px-3 py-2 rounded-xl transition-colors duration-300">
                    <span className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase flex items-center">
                      {item.icon && <item.icon className="h-3.5 w-3.5 mr-2 text-slate-400 dark:text-slate-500" />}
                      {item.label}
                    </span>
                    {item.isTag ? (
                      <span className="text-energy-700 dark:text-energy-400 font-black bg-energy-50 dark:bg-energy-900/30 px-3 py-1 rounded-lg text-sm border border-energy-100 dark:border-energy-800">{item.value}</span>
                    ) : (
                      <span className="text-slate-900 dark:text-white font-black text-lg">{item.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-2 animate-reveal card-hover relative overflow-hidden" style={{ animationDelay: '300ms' }}>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500 rounded-l-3xl"></div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 border-b border-slate-100 dark:border-slate-700 pb-5 tracking-tight flex items-center">
                <Layers className="h-5 w-5 mr-3 text-blue-500" />
                Analyzed Telemetry Vectors
                <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-600">
                  {modelInfo.feature_names.length} features
                </span>
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {modelInfo.feature_names.slice(0, 30).map((feature, i) => (
                  <span key={i} className="tag-hover px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 rounded-xl text-xs text-slate-600 dark:text-slate-400 font-bold tracking-tight shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-300 cursor-default">
                    {feature}
                  </span>
                ))}
                {modelInfo.feature_names.length > 30 && (
                  <span className="px-4 py-2 bg-energy-50 dark:bg-energy-900/30 border border-energy-100 dark:border-energy-800 rounded-xl text-xs text-energy-700 dark:text-energy-400 font-black shadow-sm">
                    + {modelInfo.feature_names.length - 30} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
