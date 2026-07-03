import React from "react";

const MapDashboard: React.FC = () => {
  return (
    <div className="w-full p-6 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
        Map Dashboard
      </h2>

      <p className="text-slate-400 text-sm mt-2">
        Google Maps has been removed. The app now uses OpenStreetMap (Leaflet)
        inside the Report Hotspot section.
      </p>

      <div className="mt-4 p-4 rounded-lg bg-emerald-50 dark:bg-dark-800 text-sm text-slate-600 dark:text-slate-300">
        👉 Use “Report Hotspot” to select location on the interactive map.
      </div>
    </div>
  );
};

export default MapDashboard;