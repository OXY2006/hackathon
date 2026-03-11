import { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Activity, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Dashboard() {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-energy-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="glass-card p-8 border-red-500/30 flex flex-col items-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-dark-300 text-center">{error}</p>
        </div>
      </div>
    );
  }

  const formatPercent = (val) => `${(val * 100).toFixed(1)}%`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 flex items-center tracking-tight">
          <div className="p-3 bg-energy-100 rounded-2xl mr-4">
            <ShieldCheck className="h-8 w-8 text-energy-600" />
          </div>
          System Dashboard
        </h1>
        <p className="text-slate-500 mt-3 text-lg font-medium">Active intelligence monitoring system capabilities and model architecture.</p>
      </div>

      {modelInfo && (
        <div className="space-y-10">
          {/* Main metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Accuracy", value: formatPercent(modelInfo.test_accuracy), icon: Target, color: "text-blue-600", bgColor: "bg-blue-50" },
              { label: "Precision", value: formatPercent(modelInfo.test_precision), icon: CheckCircle, color: "text-energy-600", bgColor: "bg-green-50" },
              { label: "Recall", value: formatPercent(modelInfo.test_recall), icon: Activity, color: "text-indigo-600", bgColor: "bg-indigo-50" },
              { label: "ROC AUC", value: formatPercent(modelInfo.roc_auc), icon: Activity, color: "text-purple-600", bgColor: "bg-purple-50" },
            ].map((metric, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <metric.icon className={`h-28 w-28 ${metric.color}`} />
                </div>
                <div className="flex items-center space-x-3 mb-5">
                  <div className={`p-2.5 rounded-xl ${metric.bgColor}`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs">{metric.label}</h3>
                </div>
                <p className="text-4xl font-black text-slate-900">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Engine Config */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-5 tracking-tight">Engine Config</h2>
              <ul className="space-y-6">
                <li className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold text-sm uppercase">Architecture</span>
                  <span className="text-energy-700 font-black bg-energy-50 px-3 py-1 rounded-lg text-sm">{modelInfo.best_model}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold text-sm uppercase">Feature Count</span>
                  <span className="text-slate-900 font-black text-lg">{modelInfo.n_features}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold text-sm uppercase">Threshold</span>
                  <span className="text-slate-900 font-black text-lg">{modelInfo.optimal_threshold}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold text-sm uppercase">F1 Score</span>
                  <span className="text-slate-900 font-black text-lg">{formatPercent(modelInfo.test_f1)}</span>
                </li>
              </ul>
            </div>

            {/* Included Features */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm lg:col-span-2">
              <h2 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-5 tracking-tight">Analyzed Telemetry Vectors</h2>
              <div className="flex flex-wrap gap-3">
                {modelInfo.feature_names.slice(0, 30).map((feature, i) => (
                  <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 font-bold tracking-tight shadow-sm">
                    {feature}
                  </span>
                ))}
                {modelInfo.feature_names.length > 30 && (
                  <span className="px-4 py-2 bg-energy-50 border border-energy-100 rounded-xl text-xs text-energy-700 font-black shadow-sm">
                    + {modelInfo.feature_names.length - 30} more features
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
