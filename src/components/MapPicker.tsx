import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AlertCircle } from "lucide-react";

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function DraggableMarker({
  latitude,
  longitude,
  onLocationChange,
}: MapPickerProps) {
  const [position, setPosition] = React.useState<L.LatLngExpression>([
    latitude,
    longitude,
  ]);

  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker
      draggable
      position={position}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();

          setPosition(pos);
          onLocationChange(pos.lat, pos.lng);
        },
      }}
    />
  );
}

const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
}) => {
  return (
    <div className="w-full">
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-dark-800">

        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          style={{
            height: "400px",
            width: "100%",
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <DraggableMarker
            latitude={latitude}
            longitude={longitude}
            onLocationChange={onLocationChange}
          />
        </MapContainer>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1">
            Latitude
          </label>

          <input
            type="number"
            step="0.000001"
            value={latitude}
            onChange={(e) =>
              onLocationChange(
                parseFloat(e.target.value),
                longitude
              )
            }
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            Longitude
          </label>

          <input
            type="number"
            step="0.000001"
            value={longitude}
            onChange={(e) =>
              onLocationChange(
                latitude,
                parseFloat(e.target.value)
              )
            }
            className="input-field"
          />
        </div>
      </div>

      <p className="text-slate-400 text-xs mt-3 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Click anywhere on the map or drag the marker to choose the pollution
        location.
      </p>
    </div>
  );
};

export default MapPicker;