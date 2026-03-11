import { BarChart3, Info, Brain, TrendingUp, Layers } from 'lucide-react';

export default function ModelPerformance() {
  const sections = [
    {
      title: "Model Evaluation",
      tooltip: "Displays the Confusion Matrix, ROC Curve, and Precision-Recall Curve. Key indicators of model reliability.",
      barTitle: "Classification Metrics Array",
      src: "/model_evaluation.png",
      alt: "Model Evaluation Metrics including Confusion Matrix and ROC",
      fallbackText: "Model metrics cache not found. Deploy ML service to generate visuals.",
      icon: TrendingUp,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
      accentColor: "from-blue-400 to-indigo-500"
    },
    {
      title: "Global Feature Importance",
      tooltip: "Ranking of the most influential statistical variables across all tree-based estimators in the ensemble.",
      barTitle: "Ensemble Weight Distribution",
      src: "/feature_importance.png",
      alt: "Feature Importance Chart",
      fallbackText: "Feature importance weight buffer empty.",
      icon: Layers,
      iconColor: "text-indigo-500",
      iconBg: "bg-indigo-50",
      accentColor: "from-indigo-400 to-purple-500"
    },
    {
      title: "SHAP Explanations (Local XAI)",
      tooltip: "SHapley Additive exPlanations summary plot showing how high/low values of specific features impact the prediction outcome.",
      barTitle: "SHAP Value Distribution",
      src: "/shap_importance.png",
      alt: "SHAP Values Explanation",
      fallbackText: "XAI Explainer visuals not generated.",
      icon: Brain,
      iconColor: "text-energy-500",
      iconBg: "bg-green-50",
      accentColor: "from-energy-400 to-emerald-500"
    },
    {
      title: "Threshold Optimization",
      tooltip: null,
      barTitle: "Optimization Curves",
      src: "/threshold_optimisation.png",
      alt: "Threshold Optimization Chart",
      fallbackText: "Optimization curves buffer empty.",
      icon: TrendingUp,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-50",
      accentColor: "from-amber-400 to-orange-500"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 bg-white animate-page-reveal">
      {/* Header */}
      <div className="mb-12 border-b border-slate-100 pb-10 animate-reveal">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Explainable AI (XAI) & Performance
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mt-1">Model Intelligence Report</p>
          </div>
        </div>
        <p className="text-slate-500 mt-4 max-w-3xl text-lg font-medium">
          Detailed metrics and visual explanations for the ensemble machine learning model.
          Understanding why the AI makes certain predictions is critical in energy grid analytics.
        </p>
      </div>

      <div className="space-y-16">
        {sections.map((section, i) => (
          <section key={i} className="animate-reveal" style={{ animationDelay: `${i * 150}ms` }}>
            <div className="flex items-center space-x-3 mb-8">
              <div className={`p-2 ${section.iconBg} rounded-xl`}>
                <section.icon className={`h-5 w-5 ${section.iconColor}`} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{section.title}</h2>
              {section.tooltip && (
                <div className="group relative">
                  <div className="p-1.5 bg-slate-50 rounded-full border border-slate-100 hover:bg-slate-100 transition-colors cursor-help">
                    <Info className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="absolute hidden group-hover:block w-72 p-4 bg-slate-900 text-xs text-slate-100 rounded-2xl -top-2 left-10 z-10 shadow-2xl font-bold leading-relaxed border border-slate-700">
                    {section.tooltip}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-500 card-hover relative">
              {/* Gradient accent strip */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${section.accentColor}`}></div>
              
              <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 px-8 py-5 flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{section.barTitle}</h3>
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-energy-400 shadow-sm"></div>
                </div>
              </div>
              <div className="p-10 flex justify-center bg-white">
                <img 
                  src={section.src}
                  alt={section.alt}
                  className="img-reveal max-w-full h-auto rounded-2xl shadow-sm border border-slate-100 max-h-[600px] object-contain group-hover:scale-[1.01] transition-transform duration-500"
                  style={section.src.includes('shap') ? { backgroundColor: 'white' } : {}}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='200' viewBox='0 0 800 200'%3E%3Crect fill='%23f1f5f9' width='800' height='200'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3E${encodeURIComponent(section.fallbackText)}%3C/text%3E%3C/svg%3E`;
                  }}
                />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>

  );
}
