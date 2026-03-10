import { useState, useRef } from 'react'

function UploadMeterData({ onUpload, isLoading }) {
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState('')
  const inputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file')
      return
    }
    setFileName(file.name)
    onUpload(file)
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer
        ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-slate-300 bg-white hover:border-primary-400 hover:bg-slate-50'}
        ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleChange}
        className="hidden"
        id="csv-upload"
      />

      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <div>
            <p className="text-sm font-medium text-slate-700">Analyzing data with AI...</p>
            <p className="text-xs text-slate-500 mt-1">This may take a moment for large datasets</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">
              {fileName ? fileName : 'Drop your CSV file here or click to browse'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports smart meter data with columns: meter_id, timestamp, consumption_kwh, latitude, longitude
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadMeterData
