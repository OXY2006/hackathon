import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function TheftHeatmap({ meters }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current).setView([40.5, -87.5], 7)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    mapInstanceRef.current = map

    // Fix leaflet icon paths
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !meters || meters.length === 0) return

    const map = mapInstanceRef.current

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Add markers
    const bounds = []
    meters.forEach((meter) => {
      if (!meter.latitude || !meter.longitude) return

      const lat = meter.latitude
      const lng = meter.longitude
      bounds.push([lat, lng])

      const color = meter.risk_score >= 60
        ? '#ef4444'
        : meter.risk_score >= 40
        ? '#f59e0b'
        : '#22c55e'

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 14px;
          height: 14px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })

      const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;font-size:12px">
            <strong>${meter.meter_id}</strong><br/>
            Risk Score: <strong style="color:${color}">${meter.risk_score.toFixed(1)}</strong><br/>
            Status: ${meter.is_suspicious ? '⚠️ Suspicious' : '✅ Safe'}
          </div>`
        )

      markersRef.current.push(marker)
    })

    // Fit bounds
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] })
    }
  }, [meters])

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">Geographic Theft Heatmap</h3>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-danger-500" />
            <span className="text-xs text-slate-500">High Risk</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-warning-500" />
            <span className="text-xs text-slate-500">Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-success-500" />
            <span className="text-xs text-slate-500">Safe</span>
          </div>
        </div>
      </div>
      <div ref={mapRef} style={{ height: '320px', width: '100%' }} />
    </div>
  )
}

export default TheftHeatmap
