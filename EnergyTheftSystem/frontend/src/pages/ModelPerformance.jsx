import { BarChart3, Info } from 'lucide-react';

export default function ModelPerformance() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 border-b border-dark-800 pb-6">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <BarChart3 className="mr-3 h-8 w-8 text-indigo-400" />
          Explainable AI (XAI) & Performance
        </h1>
        <p className="text-dark-300 mt-2 max-w-3xl">
          Detailed metrics and visual explanations for the ensemble machine learning model.
          Understanding why the AI makes certain predictions is critical in energy grid analytics.
        </p>
      </div>

      <div className="space-y-12">
        {/* Model Evaluation & Confusion Matrix */}
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <h2 className="text-2xl font-bold text-white">Model Evaluation</h2>
            <div className="group relative">
              <Info className="h-5 w-5 text-dark-400 cursor-help" />
              <div className="absolute hidden group-hover:block w-64 p-3 bg-dark-800 text-xs text-dark-200 rounded-lg -top-2 left-8 z-10 border border-dark-700 shadow-xl">
                Displays the Confusion Matrix, ROC Curve, and Precision-Recall Curve. Key indicators of model reliability.
              </div>
            </div>
          </div>
          <div className="glass-card overflow-hidden">
            <div className="bg-dark-900 border-b border-dark-800 p-4">
              <h3 className="text-sm font-medium text-dark-300 uppercase tracking-wider">Classification Metrics Array</h3>
            </div>
            <div className="p-8 flex justify-center bg-white/5">
              <img 
                src="/model_evaluation.png" 
                alt="Model Evaluation Metrics including Confusion Matrix and ROC" 
                className="max-w-full h-auto rounded shadow-lg border border-dark-700 max-h-[600px] object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='200' viewBox='0 0 800 200'%3E%3Crect fill='%231e293b' width='800' height='200'/%3E%3Ctext fill='%2364748b' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImage file context not found. Ensure model_evaluation.png is in the public folder.%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
        </section>

        {/* Feature Importance */}
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <h2 className="text-2xl font-bold text-white">Global Feature Importance</h2>
            <div className="group relative">
              <Info className="h-5 w-5 text-dark-400 cursor-help" />
              <div className="absolute hidden group-hover:block w-64 p-3 bg-dark-800 text-xs text-dark-200 rounded-lg -top-2 left-8 z-10 border border-dark-700 shadow-xl">
                Ranking of the most influential statistical variables across all tree-based estimators in the ensemble.
              </div>
            </div>
          </div>
          <div className="glass-card overflow-hidden">
             <div className="p-8 flex justify-center bg-white/5">
              <img 
                src="/feature_importance.png" 
                alt="Feature Importance Chart" 
                className="max-w-full h-auto rounded shadow-lg border border-dark-700 max-h-[600px] object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='200' viewBox='0 0 800 200'%3E%3Crect fill='%231e293b' width='800' height='200'/%3E%3Ctext fill='%2364748b' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImage file context not found. Ensure feature_importance.png is in the public folder.%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
        </section>

        {/* SHAP Values / Explainable AI */}
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <h2 className="text-2xl font-bold text-white">SHAP Explanations (Local XAI)</h2>
            <div className="group relative">
              <Info className="h-5 w-5 text-dark-400 cursor-help" />
              <div className="absolute hidden group-hover:block w-64 p-3 bg-dark-800 text-xs text-dark-200 rounded-lg -top-2 left-8 z-10 border border-dark-700 shadow-xl">
                SHapley Additive exPlanations summary plot showing how high/low values of specific features impact the prediction outcome.
              </div>
            </div>
          </div>
          <div className="glass-card overflow-hidden">
             <div className="p-8 flex justify-center bg-white/5 bg-opacity-90">
              <img 
                src="/shap_importance.png" 
                alt="SHAP Values Explanation" 
                className="max-w-full h-auto rounded shadow-lg border border-dark-700 max-h-[600px] object-contain"
                style={{ backgroundColor: 'white' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='200' viewBox='0 0 800 200'%3E%3Crect fill='%231e293b' width='800' height='200'/%3E%3Ctext fill='%2364748b' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImage file context not found. Ensure shap_importance.png is in the public folder.%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
        </section>

        {/* Threshold Optimization */}
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <h2 className="text-2xl font-bold text-white">Threshold Optimization</h2>
          </div>
          <div className="glass-card overflow-hidden">
             <div className="p-8 flex justify-center bg-white/5">
              <img 
                src="/threshold_optimisation.png" 
                alt="Threshold Optimization Chart" 
                className="max-w-full h-auto rounded shadow-lg border border-dark-700 max-h-[600px] object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='200' viewBox='0 0 800 200'%3E%3Crect fill='%231e293b' width='800' height='200'/%3E%3Ctext fill='%2364748b' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImage file context not found. Ensure threshold_optimisation.png is in the public folder.%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
