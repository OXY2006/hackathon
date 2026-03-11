import { X } from 'lucide-react';

export default function ComparisonPanel({ nodeA, nodeB, onClose, generateExplanation }) {
  if (!nodeA || !nodeB) return null;

  const explA = generateExplanation(nodeA);
  const explB = generateExplanation(nodeB);

  const riskColor = (score) =>
    score >= 80 ? 'text-red-600 dark:text-red-400' :
    score >= 50 ? 'text-amber-600 dark:text-amber-400' :
    'text-energy-600 dark:text-energy-400';

  const riskBg = (score) =>
    score >= 80 ? 'from-red-500 to-rose-600' :
    score >= 50 ? 'from-amber-500 to-orange-600' :
    'from-energy-500 to-emerald-600';

  const renderNode = (node, expl, label) => (
    <div className="flex-1 min-w-0">
      <div className="text-center mb-5">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
          Node {node.id || node.index}
        </h3>
      </div>

      {/* Risk Score */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${riskBg(node.risk_score)} shadow-lg`}>
          <span className="text-2xl font-black text-white">{Math.round(node.risk_score)}</span>
        </div>
        <p className={`text-xs font-bold mt-2 ${riskColor(node.risk_score)}`}>
          {node.risk_score >= 80 ? 'Critical Risk' : node.risk_score >= 50 ? 'Elevated Risk' : 'Low Risk'}
        </p>
      </div>

      {/* Info */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
          <span className={`font-bold ${node.is_suspicious ? 'text-red-600 dark:text-red-400' : 'text-energy-600 dark:text-energy-400'}`}>
            {node.is_suspicious ? 'Suspicious' : 'Normal'}
          </span>
        </div>
        <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Confidence</span>
          <span className="font-bold text-slate-900 dark:text-white">{node.confidence}</span>
        </div>
      </div>

      {/* Top features */}
      {node.top_features && node.top_features.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Top Anomaly Factors</p>
          <div className="space-y-2">
            {node.top_features.map((f, i) => (
              <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mr-2">{f.feature}</span>
                  <span className="text-[10px] font-black text-red-500 shrink-0">+{Number(f.shap_value).toFixed(3)}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-red-400 to-red-600 h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.abs(f.shap_value) * 200)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hypothesis */}
      <div className="mt-4 p-3 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-1">Hypothesis</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4"
           dangerouslySetInnerHTML={{ __html: expl.primaryHypothesis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center modal-backdrop-enter">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden modal-panel-enter">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Node Comparison</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/60 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] modal-scroll">
          <div className="flex gap-6">
            {renderNode(nodeA, explA, 'Node A')}
            <div className="w-px bg-slate-200 dark:bg-slate-700 shrink-0 self-stretch" />
            {renderNode(nodeB, explB, 'Node B')}
          </div>
        </div>
      </div>
    </div>
  );
}
