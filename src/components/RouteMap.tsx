import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const vehicleRoutes = [
  {
    id: 1,
    name: "Vehicle 1",
    color: "#0ea5e9",
    positions: [
      [35.6892, 51.3890],
      [35.7010, 51.4010],
      [35.7128, 51.4130],
      [35.7246, 51.4250],
    ] as [number, number][],
    stops: [
      { lat: 35.6892, lng: 51.3890, name: "محل شروع 1" },
      { lat: 35.7246, lng: 51.4250, name: "محل پایان 1" },
    ],
  },
  {
    id: 2,
    name: "Vehicle 2",
    color: "#a855f7",
    positions: [
      [35.6950, 51.4000],
      [35.7050, 51.4100],
      [35.7150, 51.4200],
      [35.7250, 51.4300],
    ] as [number, number][],
    stops: [
      { lat: 35.6950, lng: 51.4000, name: "محل شروع 2" },
      { lat: 35.7250, lng: 51.4300, name: "محل پایان 2" },
    ],
  },
  {
    id: 3,
    name: "Vehicle 3",
    color: "#f97316",
    positions: [
      [35.7000, 51.3800],
      [35.7100, 51.3900],
      [35.7200, 51.4000],
      [35.7300, 51.4100],
    ] as [number, number][],
    stops: [
      { lat: 35.7000, lng: 51.3800, name: "محل شروع 3" },
      { lat: 35.7300, lng: 51.4100, name: "محل پایان 3" },
    ],
  },
  {
    id: 4,
    name: "Vehicle 4",
    color: "#facc15",
    positions: [
      [35.6800, 51.4100],
      [35.6900, 51.4200],
      [35.7000, 51.4300],
      [35.7100, 51.4400],
    ] as [number, number][],
    stops: [
      { lat: 35.6800, lng: 51.4100, name: "محل شروع 4" },
      { lat: 35.7100, lng: 51.4400, name: "محل پایان 4" },
    ],
  },
  {
    id: 5,
    name: "Vehicle 5",
    color: "#22c55e",
    positions: [
      [35.6850, 51.3900],
      [35.6950, 51.4000],
      [35.7050, 51.4100],
      [35.7150, 51.4200],
    ] as [number, number][],
    stops: [
      { lat: 35.6850, lng: 51.3900, name: "محل شروع 5" },
      { lat: 35.7150, lng: 51.4200, name: "محل پایان 5" },
    ],
  },
];

const createNumberedIcon = (number: number, color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${number}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export const RouteMap = () => {
  const [visibleRoutes, setVisibleRoutes] = useState<number[]>(vehicleRoutes.map(r => r.id));

  const toggleRoute = (id: number) => {
    setVisibleRoutes(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={[35.7000, 51.4000]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {vehicleRoutes.map((route) => (
          visibleRoutes.includes(route.id) && (
            <div key={route.id}>
              <Polyline positions={route.positions} color={route.color} weight={4} opacity={0.7} />
              {route.stops.map((stop, idx) => (
                <Marker
                  key={`${route.id}-${idx}`}
                  position={[stop.lat, stop.lng]}
                  icon={createNumberedIcon(idx + 1, route.color)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{route.name}</p>
                      <p>{stop.name}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </div>
          )
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-h-[450px] overflow-y-auto z-[1000]">
        <h3 className="font-semibold mb-3 text-sm">وسایل نقلیه</h3>
        <div className="space-y-2">
          {vehicleRoutes.map((route) => (
            <div key={route.id} className="flex items-center gap-2">
              <Checkbox
                id={`vehicle-${route.id}`}
                checked={visibleRoutes.includes(route.id)}
                onCheckedChange={() => toggleRoute(route.id)}
              />
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: route.color }}
              />
              <label
                htmlFor={`vehicle-${route.id}`}
                className="text-sm cursor-pointer"
              >
                {route.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
