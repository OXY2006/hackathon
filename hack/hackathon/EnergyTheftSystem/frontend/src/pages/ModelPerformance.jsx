import { BarChart3, Info } from 'lucide-react';

export default function ModelPerformance() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 bg-white">
      <div className="mb-12 border-b border-slate-100 pb-10">
        <h1 className="text-4xl font-black text-slate-900 flex items-center tracking-tight">
          <div className="p-3 bg-indigo-50 rounded-2xl mr-4">
            <BarChart3 className="h-8 w-8 text-indigo-600" />
          </div>
          Explainable AI (XAI) & Performance
        </h1>
        <p className="text-slate-500 mt-4 max-w-3xl text-lg font-medium">
          Detailed metrics and visual explanations for the ensemble machine learning model.
          Understanding why the AI makes certain predictions is critical in energy grid analytics.
        </p>
      </div>

      <div className="space-y-16">
        {/* Model Evaluation & Confusion Matrix */}
        <section>
          <div className="flex items-center space-x-3 mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Model Evaluation</h2>
            <div className="group relative">
              <div className="p-1 bg-slate-50 rounded-full border border-slate-100"><Info className="h-5 w-5 text-slate-400 cursor-help" /></div>
              <div className="absolute hidden group-hover:block w-72 p-4 bg-slate-900 text-xs text-slate-100 rounded-2xl -top-2 left-10 z-10 shadow-2xl font-bold leading-relaxed">
                Displays the Confusion Matrix, ROC Curve, and Precision-Recall Curve. Key indicators of model reliability.
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification Metrics Array</h3>
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 rounded-full bg-energy-400"></div>
              </div>
            </div>
            <div className="p-10 flex justify-center bg-white">
              <img 
                src="/model_evaluation.png" 
                alt="Model Evaluation Metrics including Confusion Matrix and ROC" 
                className="max-w-full h-auto rounded-2xl shadow-sm border border-slate-100 max-h-[600px] object-contain group-hover:scale-[1.01] transition-transform duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='200' viewBox='0 0 800 200'%3E%3Crect fill='%23f1f5f9' width='800' height='200'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EModel metrics cache not found. Deploy ML service to generate visuals.%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
        </section>

        {/* Feature Importance */}
        <section>
          <div className="flex items-center space-x-3 mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Global Feature Importance</h2>
            <div className="group relative">
              <div className="p-1 bg-slate-50 rounded-full border border-slate-100"><Info className="h-5 w-5 text-slate-400 cursor-help" /></div>
              <div className="absolute hidden group-hover:block w-72 p-4 bg-slate-900 text-xs text-slate-100 rounded-2xl -top-2 left-10 z-10 shadow-2xl font-bold leading-relaxed">
                Ranking of the most influential statistical variables across all tree-based estimators in the ensemble.
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
             <div className="p-10 flex justify-center bg-white">
              <img 
                src="/feature_importance.png" 
                alt="Feature Importance Chart" 
                className="max-w-full h-auto rounded-2xl shadow-sm border border-slate-100 max-h-[600px] object-contain group-hover:scale-[1.01] transition-transform duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='200' viewBox='0 0 800 200'%3E%3Crect fill='%23f1f5f9' width='800' height='200'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EFeature importance weight buffer empty.%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
        </section>

        {/* SHAP Values / Explainable AI */}
        <section>
          <div className="flex items-center space-x-3 mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">SHAP Explanations (Local XAI)</h2>
            <div className="group relative">
              <div className="p-1 bg-slate-50 rounded-full border border-slate-100"><Info className="h-5 w-5 text-slate-400 cursor-help" /></div>
              <div className="absolute hidden group-hover:block w-72 p-4 bg-slate-900 text-xs text-slate-100 rounded-2xl -top-2 left-10 z-10 shadow-2xl font-bold leading-relaxed">
                SHapley Additive exPlanations summary plot showing how high/low values of specific features impact the prediction outcome.
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
             <div className="p-10 flex justify-center bg-white">
              <img 
                src="/shap_importance.png" 
                alt="SHAP Values Explanation" 
                className="max-w-full h-auto rounded-2xl shadow-sm border border-slate-100 max-h-[600px] object-contain"
                style={{ backgroundColor: 'white' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='200' viewBox='0 0 800 200'%3E%3Crect fill='%23f1f5f9' width='800' height='200'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EXAI Explainer visuals not generated.%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
        </section>

        {/* Threshold Optimization */}
        <section className="pb-16">
          <div className="flex items-center space-x-3 mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Threshold Optimization</h2>
          </div>
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
             <div className="p-10 flex justify-center bg-white">
              <img 
                src="/threshold_optimisation.png" 
                alt="Threshold Optimization Chart" 
                className="max-w-full h-auto rounded-2xl shadow-sm border border-slate-100 max-h-[600px] object-contain group-hover:scale-[1.01] transition-transform duration-500"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='200' viewBox='0 0 800 200'%3E%3Crect fill='%23f1f5f9' width='800' height='200'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='18' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EOptimization curves buffer empty.%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>

  );
}
