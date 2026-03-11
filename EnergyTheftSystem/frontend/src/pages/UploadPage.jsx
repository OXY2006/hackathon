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
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4 flex items-center justify-center">
          <UploadCloud className="mr-3 h-8 w-8 text-blue-400" />
          Data Telemetry Upload
        </h1>
        <p className="text-dark-300">Upload smart meter CSV readings for AI anomaly detection and theft analysis.</p>
      </div>

      <div className="glass-card p-8">
        {!file ? (
          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              dragActive ? 'border-energy-500 bg-energy-500/10' : 'border-dark-700 bg-dark-800/50 hover:border-dark-600'
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
            
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-dark-800 rounded-full">
                <FileType className="h-10 w-10 text-dark-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-white">Drag and drop your CSV here</p>
                <p className="text-sm text-dark-400 mt-1">or click to browse from your computer</p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-outline mt-4"
              >
                Browse Files
              </button>
            </div>
            
            <div className="mt-8 text-xs text-dark-500 flex flex-col items-center gap-2">
              <p>Supported formats: CSV</p>
              <p>File must contain telemetry columns matching model configuration.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-full flex items-center justify-between bg-dark-800 p-4 rounded-lg border border-dark-700 mb-6">
              <div className="flex items-center space-x-3">
                <FileType className="h-8 w-8 text-energy-500" />
                <div className="text-left">
                  <p className="font-medium text-white truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                  <p className="text-xs text-dark-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={removeFile}
                disabled={uploading}
                className="p-2 text-dark-400 hover:text-white transition-colors"
                title="Remove file"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <button 
              onClick={handleUpload} 
              disabled={uploading}
              className={`btn-primary w-full flex items-center justify-center space-x-2 py-4 text-lg ${uploading ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Processing Analysis...</span>
                </>
              ) : (
                <>
                  <Zap className="h-6 w-6" />
                  <span>Run AI Inference</span>
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start">
            <X className="h-5 w-5 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
