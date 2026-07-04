import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

export interface SafeReport {
  id: string;
  reporterName?: string;
  imageUrl?: string;
  address?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  aiAnalysis?: {
    category?: string;
    severity?: 'Low' | 'Medium' | 'High' | 'Critical';
    confidenceScore?: number;
  };
}

interface MapDashboardProps {
  reports: SafeReport[];
}

// Custom styled Leaflet DivIcon based on severity levels
const createSeverityIcon = (severity: string = 'Low') => {
  let color = '#3b82f6'; // Blue default
  if (severity === 'Low') color = '#10b981'; // Green
  else if (severity === 'Medium') color = '#f59e0b'; // Amber
  else if (severity === 'High') color = '#f97316'; // Orange
  else if (severity === 'Critical') color = '#ef4444'; // Red

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full opacity-40" style="background-color: ${color};"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 border-2 border-white shadow-md" style="background-color: ${color};"></span>
      </div>
    `,
    className: 'custom-leaflet-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -10]
  });
};

const MapDashboard: React.FC<MapDashboardProps> = ({ reports }) => {
  // Find a valid coordinate to center the map on
  const validReports = reports.filter(r => r.location?.latitude && r.location?.longitude);
  const centerPosition: [number, number] = validReports.length > 0 
    ? [validReports[0].location!.latitude, validReports[0].location!.longitude]
    : [37.7749, -122.4194]; // Default San Francisco

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-inner relative z-0 border border-slate-100 dark:border-dark-800">
      <MapContainer 
        center={centerPosition} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validReports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.location!.latitude, report.location!.longitude]}
            icon={createSeverityIcon(report.aiAnalysis?.severity)}
          >
            <Popup className="custom-popup">
              <div className="w-64 p-1 font-sans">
                {report.imageUrl && (
                  <div className="w-full h-28 rounded-lg overflow-hidden mb-2 bg-slate-100">
                    <img 
                      src={report.imageUrl} 
                      alt="Pollution hazard" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=300&auto=format&fit=crop&q=60";
                      }}
                    />
                  </div>
                )}
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm m-0 leading-tight">
                    {report.aiAnalysis?.category || 'Pollution Hazard'}
                  </h4>
                  <span 
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold text-white shrink-0 ml-2`}
                    style={{
                      backgroundColor: 
                        report.aiAnalysis?.severity === 'Critical' ? '#ef4444' :
                        report.aiAnalysis?.severity === 'High' ? '#f97316' :
                        report.aiAnalysis?.severity === 'Medium' ? '#f59e0b' : '#10b981'
                    }}
                  >
                    {report.aiAnalysis?.severity || 'Low'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2 line-clamp-2 leading-relaxed">
                  {report.description || 'No description provided.'}
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 dark:border-dark-800 pt-1.5 mt-1.5">
                  <span className="font-medium">Status: <span className="uppercase text-slate-600 dark:text-slate-300 font-semibold">{report.status}</span></span>
                  <span>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ''}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapDashboard;