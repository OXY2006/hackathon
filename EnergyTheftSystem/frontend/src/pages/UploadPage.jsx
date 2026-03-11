import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, FileType, X, Loader2, Zap } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      checkAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      checkAndSetFile(e.target.files[0]);
    }
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

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Navigate to prediction page with the data
      navigate('/prediction', { state: { results: response.data, filename: file.name } });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to process file. Ensure backend and ML services are running.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 bg-white">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-slate-900 mb-6 flex items-center justify-center tracking-tight">
          <div className="p-3 bg-blue-50 rounded-2xl mr-4">
            <UploadCloud className="h-8 w-8 text-blue-600" />
          </div>
          Data Telemetry Upload
        </h1>
        <p className="text-slate-500 text-lg font-medium">Upload smart meter CSV readings for AI anomaly detection and theft analysis.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
        {!file ? (
          <div 
            className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 ${
              dragActive ? 'border-energy-500 bg-energy-50/50' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleChange}
              className="hidden"
            />
            
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
                <FileType className="h-12 w-12 text-slate-400" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-black text-slate-900 tracking-tight">Drag and drop your CSV here</p>
                <p className="text-slate-500 font-medium">or click to browse from your computer</p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-outline mt-6 px-10 py-3 rounded-2xl border-slate-200 text-slate-700 hover:bg-white shadow-sm"
              >
                Browse Files
              </button>
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-100 text-xs font-bold text-slate-400 flex flex-col items-center gap-3 uppercase tracking-widest">
              <p>Supported formats: CSV</p>
              <p>File must contain telemetry columns matching model configuration.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-full flex items-center justify-between bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-energy-100 rounded-xl">
                  <FileType className="h-8 w-8 text-energy-600" />
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-900 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                  <p className="text-sm text-slate-500 font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={removeFile}
                disabled={uploading}
                className="p-3 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-100 transition-all shadow-sm"
                title="Remove file"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <button 
              onClick={handleUpload} 
              disabled={uploading}
              className={`btn-primary w-full flex items-center justify-center space-x-3 py-5 text-xl rounded-2xl shadow-xl shadow-energy-500/20 active:scale-95 ${uploading ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
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
          <div className="mt-8 p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center shadow-sm">
            <X className="h-6 w-6 mr-3 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>

  );
}
