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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <ShieldCheck className="mr-3 h-8 w-8 text-energy-500" />
          System Dashboard
        </h1>
        <p className="text-dark-300 mt-2">Active intelligence monitoring system capabilities and model architecture.</p>
      </div>

      {modelInfo && (
        <div className="space-y-8">
          {/* Main metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Accuracy", value: formatPercent(modelInfo.test_accuracy), icon: Target, color: "text-blue-400" },
              { label: "Precision", value: formatPercent(modelInfo.test_precision), icon: CheckCircle, color: "text-energy-400" },
              { label: "Recall", value: formatPercent(modelInfo.test_recall), icon: Activity, color: "text-indigo-400" },
              { label: "ROC AUC", value: formatPercent(modelInfo.roc_auc), icon: Activity, color: "text-purple-400" },
            ].map((metric, i) => (
              <div key={i} className="glass-card p-6 flex flex-col relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <metric.icon className={`h-24 w-24 ${metric.color}`} />
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 rounded-lg bg-dark-800 ${metric.color}`}>
                    <metric.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-dark-300 font-medium">{metric.label}</h3>
                </div>
                <p className="text-3xl font-bold text-white">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Engine Config */}
            <div className="glass-card p-6 lg:col-span-1">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-dark-800 pb-4">Engine Configuration</h2>
              <ul className="space-y-4">
                <li className="flex justify-between items-center">
                  <span className="text-dark-300">Architecture</span>
                  <span className="text-energy-400 font-medium">{modelInfo.best_model}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-dark-300">Feature Count</span>
                  <span className="text-white font-medium">{modelInfo.n_features}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-dark-300">Decision Threshold</span>
                  <span className="text-white font-medium">{modelInfo.optimal_threshold}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-dark-300">F1 Score</span>
                  <span className="text-white font-medium">{formatPercent(modelInfo.test_f1)}</span>
                </li>
              </ul>
            </div>

            {/* Included Features */}
            <div className="glass-card p-6 lg:col-span-2">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-dark-800 pb-4">Analyzed Telemetry Vectors</h2>
              <div className="flex flex-wrap gap-2">
                {modelInfo.feature_names.slice(0, 25).map((feature, i) => (
                  <span key={i} className="px-3 py-1 bg-dark-800 border border-dark-700 rounded-md text-xs text-dark-300 font-mono">
                    {feature}
                  </span>
                ))}
                {modelInfo.feature_names.length > 25 && (
                  <span className="px-3 py-1 bg-dark-800 border border-dark-700 rounded-md text-xs text-energy-500 font-mono">
                    + {modelInfo.feature_names.length - 25} more features
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
