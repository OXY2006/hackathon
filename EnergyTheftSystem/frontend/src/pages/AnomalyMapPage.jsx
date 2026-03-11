import { useMemo } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { ArrowLeft, MapPin, ShieldAlert, BadgeCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Auto-fit bounds to all markers
function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [map, bounds]);
  return null;
}

// Color mapping based on risk score
function getMarkerColor(riskScore, isSuspicious) {
  if (!isSuspicious) return '#10b981'; // green
  if (riskScore >= 80) return '#dc2626';  // dark red
  if (riskScore >= 60) return '#ef4444';  // red
  if (riskScore >= 40) return '#f97316';  // orange
  return '#eab308'; // yellow-ish for borderline
}

function getMarkerRadius(riskScore) {
  return Math.max(6, Math.min(18, 6 + (riskScore / 100) * 12));
}

export default function AnomalyMapPage() {
  const location = useLocation();

  // Prefer router state, but fall back to sessionStorage so navbar link / refresh still works
  let data = location.state?.results;
  let filename = location.state?.filename;

  if (!data || !data.predictions) {
    const stored = sessionStorage.getItem('latestResults');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        data = parsed.results;
        filename = parsed.filename;
      } catch (e) {
        console.warn('Failed to parse latestResults from sessionStorage', e);
      }
    }
  }

  if (!data || !data.predictions) {
    return <Navigate to="/upload" replace />;
  }

  const { summary, predictions } = data;

  // Filter predictions that have lat/lng
  const mappablePoints = useMemo(() => {
    return predictions.filter(p => p.latitude != null && p.longitude != null);
  }, [predictions]);

  // Calculate bounds for auto-fit
  const bounds = useMemo(() => {
    if (mappablePoints.length === 0) return null;
    return mappablePoints.map(p => [p.latitude, p.longitude]);
  }, [mappablePoints]);

  // Stats
  const suspiciousOnMap = mappablePoints.filter(p => p.is_suspicious).length;
  const normalOnMap = mappablePoints.length - suspiciousOnMap;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">
              <Link to="/prediction" state={{ results: data, filename }} className="hover:text-energy-600 flex items-center mr-6 transition-colors group">
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Results
              </Link>
              <span className="truncate max-w-[250px] border border-slate-100 bg-white rounded-xl px-4 py-1.5 shadow-sm text-slate-500">
                File: {filename}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center tracking-tight">
              <div className="p-3 bg-indigo-50 rounded-2xl mr-4">
                <MapPin className="h-7 w-7 text-indigo-600" />
              </div>
              Anomaly Detection Map
            </h1>
          </div>

          {/* Summary chips */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3">
              <div className="p-1.5 bg-slate-50 rounded-lg">
                <MapPin className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nodes</p>
                <p className="text-xl font-black text-slate-900">{mappablePoints.length}</p>
              </div>
            </div>

            <div className="bg-white border border-energy-100 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3">
              <div className="p-1.5 bg-energy-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-energy-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-energy-600">Normal</p>
                <p className="text-xl font-black text-slate-900">{normalOnMap}</p>
              </div>
            </div>

            <div className="bg-white border border-red-100 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3">
              <div className="p-1.5 bg-red-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Suspicious</p>
                <p className="text-xl font-black text-slate-900">{suspiciousOnMap}</p>
              </div>
            </div>

            <div className={`rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3 border ${
              summary.theft_percentage > 5
                ? 'bg-red-50 border-red-200'
                : 'bg-energy-50 border-energy-200'
            }`}>
              {summary.theft_percentage > 5
                ? <div className="p-1.5 bg-white rounded-lg"><ShieldAlert className="h-4 w-4 text-red-500" /></div>
                : <div className="p-1.5 bg-white rounded-lg"><BadgeCheck className="h-4 w-4 text-energy-600" /></div>
              }
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Anomaly Rate</p>
                <p className="text-xl font-black">{summary.theft_percentage}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden relative">
          {mappablePoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
              <MapPin className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-bold">No location data available</p>
              <p className="text-sm mt-1">Prediction results do not contain geographic coordinates.</p>
            </div>
          ) : (
            <div className="relative">
              <div style={{ height: '70vh', width: '100%' }}>
                <MapContainer
                  center={[17.385, 78.4867]}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                  preferCanvas={true}
                  zoomSnap={0.25}
                  zoomDelta={0.5}
                  wheelDebounceTime={40}
                  wheelPxPerZoomLevel={80}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FitBounds bounds={bounds} />

                  {mappablePoints.map((p, idx) => {
                    const color = getMarkerColor(p.risk_score, p.is_suspicious);
                    const radius = getMarkerRadius(p.risk_score);
                    return (
                      <CircleMarker
                        key={idx}
                        center={[p.latitude, p.longitude]}
                        radius={radius}
                        pathOptions={{
                          color: color,
                          fillColor: color,
                          fillOpacity: 0.6,
                          weight: 2,
                          opacity: 0.9,
                        }}
                      >
                        <Popup>
                          <div className="min-w-[200px] p-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-black text-slate-900 text-sm">
                                {p.id || `NODE-${(p.index + 1).toString().padStart(4, '0')}`}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                p.is_suspicious
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {p.is_suspicious ? '⚠ Suspicious' : '✓ Normal'}
                              </span>
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-semibold">Risk Score</span>
                                <span className={`font-black ${p.is_suspicious ? 'text-red-600' : 'text-green-600'}`}>
                                  {p.risk_score.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${p.risk_score}%`, backgroundColor: color }}
                                />
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-semibold">Confidence</span>
                                <span className="font-bold text-slate-700">{p.confidence}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-semibold">Coordinates</span>
                                <span className="font-mono text-slate-600 text-[10px]">
                                  {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>

              {/* Legend overlay */}
              <div className="absolute bottom-6 right-6 z-[1000] bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl p-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Risk Legend</h3>
                <div className="space-y-2">
                  {[
                    { color: '#10b981', label: 'Normal (0-40%)' },
                    { color: '#eab308', label: 'Low Risk (40-50%)' },
                    { color: '#f97316', label: 'Medium Risk (50-70%)' },
                    { color: '#ef4444', label: 'High Risk (70-85%)' },
                    { color: '#dc2626', label: 'Critical (85%+)' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0"
                        style={{ backgroundColor: item.color, borderColor: item.color, opacity: 0.8 }}
                      />
                      <span className="text-xs font-bold text-slate-600">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
