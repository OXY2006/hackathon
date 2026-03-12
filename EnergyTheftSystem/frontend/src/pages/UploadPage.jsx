import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, FileType, X, Loader2, Zap, CheckCircle, HardDrive, FileSpreadsheet, History, Trash2, ArrowRight } from 'lucide-react';
import { useNotifications, saveAnalysis, getAnalysisHistory } from '../contexts';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  useEffect(() => {
    setHistory(getAnalysisHistory());
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) checkAndSetFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) checkAndSetFile(e.target.files[0]);
  };

  const checkAndSetFile = (selectedFile) => {
    setError(null);
    if (!selectedFile.name.endsWith('.csv')) {
      setError("Please select a valid CSV file.");
      return;
    }
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadHistoryItem = (item) => {
    try {
      const stored = sessionStorage.getItem('latestResults');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.filename === item.filename) {
          navigate('/prediction', { state: parsed });
          return;
        }
      }
      // If we don't have it in current session storage, we can't reliably load full results
      // without storing everything in history (too big). Show a toast.
      addNotification({
        title: "Analysis expired",
        message: "Full data for this analysis is no longer in memory. Please re-upload.",
        level: "warning"
      });
    } catch {}
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const payload = { results: response.data, filename: file.name };
      
      try {
        sessionStorage.setItem('latestResults', JSON.stringify(payload));
      } catch (e) {
        console.warn('Session storage quota exceeded. Storing truncated results for performance.');
        // Storage full - Store only summary and top 500 suspicious nodes to keep the UI functional
        const litePredictions = response.data.predictions
          ? response.data.predictions
              .filter(p => p.is_suspicious)
              .slice(0, 500)
          : [];
        
        const litePayload = {
          results: {
            ...response.data,
            predictions: litePredictions,
            is_truncated: true,
            original_count: response.data.predictions?.length || 0
          },
          filename: file.name
        };
        try {
          sessionStorage.setItem('latestResults', JSON.stringify(litePayload));
        } catch (innerE) {
          // Even lite payload failed? Store ONLY summary
          sessionStorage.setItem('latestResults', JSON.stringify({
            results: { summary: response.data.summary, predictions: [], is_truncated: true },
            filename: file.name
          }));
        }
      }
      
      // Save to history & trigger notifications
      if (response.data.summary) {
        saveAnalysis(file.name, response.data.summary);
        
        if (response.data.summary.suspicious_cases > 0) {
          addNotification({
            title: "Anomalies Detected",
            message: `Identified ${response.data.summary.suspicious_cases} suspicious nodes requiring investigation.`,
            level: "critical"
          });
        } else {
          addNotification({
            title: "Analysis Complete",
            message: "All nodes returned normal consumption patterns.",
            level: "success"
          });
        }
      }

      navigate('/prediction', { state: payload });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to process file. Ensure backend and ML services are running.');
      addNotification({ title: "Upload Failed", message: "Error communicating with intelligence engine.", level: "critical" });
    } finally {
      setUploading(false);
    }
  };

  const clearHistory = () => {
    sessionStorage.removeItem('analysisHistory');
    setHistory([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-page-reveal">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Upload Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="text-center animate-reveal">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-6">
              <HardDrive className="h-3.5 w-3.5 mr-2" />
              Data Pipeline
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 flex items-center justify-center tracking-tight">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mr-4 shadow-lg shadow-blue-500/20">
                <UploadCloud className="h-8 w-8 text-white" />
              </div>
              Data Telemetry Upload
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-xl mx-auto">
              Upload smart meter CSV readings for AI anomaly detection and theft analysis.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-10 shadow-sm animate-reveal" style={{ animationDelay: '200ms' }}>
            {!file ? (
              <div 
                className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-500 relative overflow-hidden ${
                  dragActive ? 'border-energy-500 dark:border-energy-400 bg-energy-50/50 dark:bg-energy-900/10 dropzone-active' : 'border-slate-200 dark:border-slate-600 bg-gradient-to-br from-slate-50/80 dark:from-slate-800/80 to-white dark:to-slate-800 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              >
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleChange} className="hidden" />
                
                <div className="flex flex-col items-center justify-center space-y-6 relative">
                  <div className="upload-icon-float p-6 bg-white dark:bg-slate-700 rounded-3xl shadow-md border border-slate-100 dark:border-slate-600 group-hover:shadow-lg transition-shadow">
                    <FileSpreadsheet className="h-14 w-14 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Drag and drop your CSV here</p>
                    <p className="text-slate-400 font-medium">or click to browse from your computer</p>
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="mt-6 px-10 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:border-energy-400 dark:hover:border-energy-500 hover:text-energy-700 dark:hover:text-energy-400 hover:bg-energy-50/50 dark:hover:bg-energy-900/20 hover:-translate-y-0.5 shadow-sm transition-all duration-300 text-sm uppercase tracking-wider">
                    Browse Files
                  </button>
                </div>
                
                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-400 flex flex-col items-center gap-2 uppercase tracking-widest">
                  <p className="flex items-center"><FileType className="h-3.5 w-3.5 mr-1.5" /> Supported formats: CSV</p>
                  <p>File must contain telemetry columns matching model configuration.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col animate-reveal">
                <div className="w-full flex items-center justify-between bg-gradient-to-r from-energy-50/50 dark:from-energy-900/20 to-emerald-50/30 dark:to-emerald-900/10 p-6 rounded-2xl border border-energy-100 dark:border-energy-800 mb-8 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-energy-100 dark:bg-energy-900/50 rounded-xl">
                      <CheckCircle className="h-8 w-8 text-energy-600 dark:text-energy-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                      <p className="text-sm text-slate-500 font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB — Ready for analysis</p>
                    </div>
                  </div>
                  <button onClick={removeFile} disabled={uploading} className="p-3 bg-white dark:bg-slate-700 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-slate-100 dark:border-slate-600 transition-all shadow-sm hover:scale-105 active:scale-95" title="Remove file">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <button onClick={handleUpload} disabled={uploading} className={`btn-primary w-full flex items-center justify-center space-x-3 py-5 text-lg rounded-2xl shadow-xl shadow-energy-500/20 hover:shadow-2xl hover:shadow-energy-500/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 ${uploading ? 'opacity-80 cursor-not-allowed' : ''}`}>
                  {uploading ? (
                    <>
                      <Loader2 className="h-7 w-7 animate-spin" />
                      <span className="font-black">Processing Analysis...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-7 w-7" />
                      <span className="font-black uppercase tracking-tight">Run AI Inference</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-8 p-5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center shadow-sm animate-reveal">
                <X className="h-6 w-6 mr-3 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Analysis History Sidebar */}
        <div className="bg-slate-100/50 dark:bg-slate-800/30 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-700/60 animate-reveal" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center">
              <History className="h-4 w-4 mr-2" />
              History Log
            </h3>
            {history.length > 0 && (
              <button onClick={clearHistory} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Clear history">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-10 opacity-60">
              <History className="h-10 w-10 mx-auto text-slate-400 mb-3" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">No past analyses</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scroll">
              {history.map((item) => (
                <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-energy-300 dark:hover:border-energy-700 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-2 max-w-[150px]">{item.filename}</span>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md">
                        {item.suspicious_cases} suspicious
                      </span>
                    </div>
                    <button 
                      onClick={() => loadHistoryItem(item)}
                      className="opacity-0 group-hover:opacity-100 text-energy-600 dark:text-energy-400 hover:text-energy-700 transition-all flex items-center text-[10px] font-bold uppercase tracking-wider"
                    >
                      View <ArrowRight className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
