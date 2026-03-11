import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Check, AlertCircle, Lightbulb, FileText, MapPin, Zap } from 'lucide-react';

export default function InvestigationModal({ meter, allMeters, onClose }) {
  const [loading, setLoading] = useState(true);
  const [investigation, setInvestigation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInvestigation() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.post(
          `http://localhost:5000/investigate/${meter.meter_id}`,
          { meter, all_meters: allMeters || [] }
        );
        
        setInvestigation(response.data.investigation);
      } catch (err) {
        console.error('Investigation failed:', err);
        setError(err.response?.data?.detail || 'Failed to generate investigation report');
      } finally {
        setLoading(false);
      }
    }

    if (meter) {
      fetchInvestigation();
    }
  }, [meter, allMeters]);

  if (!meter) return null;

  const getRiskColor = (prob) => {
    if (prob >= 0.8) return 'text-red-600 bg-red-50 border-red-200';
    if (prob >= 0.6) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (prob >= 0.4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const riskScore = (meter.prediction?.theft_probability || 0) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Deep Investigation Report</h2>
              <p className="text-sm text-slate-500">Meter ID: {meter.meter_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-slate-600">Analyzing patterns with Gemini AI...</p>
              <p className="text-xs text-slate-400 mt-1">This may take a few seconds</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800">Investigation Failed</h3>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                  <p className="text-xs text-red-500 mt-2">
                    Make sure GEMINI_API_KEY is configured and has quota available.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && investigation && (
            <div className="space-y-6">
              {/* Risk Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-medium ${getRiskColor(meter.prediction?.theft_probability || 0)}`}>
                <span className="text-2xl font-bold">{riskScore.toFixed(1)}</span>
                <span className="text-sm uppercase tracking-wide">Risk Score</span>
              </div>

              {/* AI Status */}
              {investigation.available ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">AI-Powered Analysis Active</span>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">Template-based Analysis (Gemini unavailable)</span>
                </div>
              )}

              {/* Hypothesis */}
              {investigation.hypothesis && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-bold text-slate-800">Primary Hypothesis</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{investigation.hypothesis}</p>
                </div>
              )}

              {/* Evidence */}
              {investigation.evidence && investigation.evidence.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-bold text-slate-800">Supporting Evidence</h3>
                  </div>
                  <ul className="space-y-2">
                    {investigation.evidence.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary-500 font-bold mt-1">•</span>
                        <span className="text-slate-700 flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cluster Analysis */}
              {investigation.cluster_analysis && (
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-bold text-amber-800">Geographic Cluster Analysis</h3>
                  </div>
                  <p className="text-amber-900 leading-relaxed">{investigation.cluster_analysis}</p>
                  
                  {investigation.nearby_meters_analyzed > 0 && (
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <p className="text-xs text-amber-700">
                        📍 Analyzed {investigation.nearby_meters_analyzed} meters within 5km radius
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendation */}
              {investigation.recommendation && (
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-5 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5" />
                    <h3 className="text-lg font-bold">Recommended Action</h3>
                  </div>
                  <p className="leading-relaxed">{investigation.recommendation}</p>
                </div>
              )}

              {/* Full Report */}
              {investigation.full_report && (
                <details className="bg-slate-50 rounded-lg border border-slate-200">
                  <summary className="cursor-pointer p-4 font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                    📄 View Full AI Report (Raw)
                  </summary>
                  <div className="p-4 border-t border-slate-200">
                    <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
                      {investigation.full_report}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
