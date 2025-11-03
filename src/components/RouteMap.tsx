import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface RoutePoint {
  id: string;
  lat: number;
  lng: number;
  sequence: number;
  time: string;
}

interface VehicleRoute {
  id: number;
  color: string;
  driver: string;
  points: RoutePoint[];
}

const vehicleRoutes: VehicleRoute[] = [
  {
    id: 1,
    color: "#3B82F6",
    driver: "driver1",
    points: [
      { id: "583926", lat: 35.7219, lng: 51.4058, sequence: 1, time: "08:06 → 08:16" },
      { id: "584048", lat: 35.7339, lng: 51.4189, sequence: 2, time: "08:18 → 08:28" },
      { id: "583718", lat: 35.7459, lng: 51.4320, sequence: 3, time: "08:38 → 08:48" },
      { id: "583701", lat: 35.7579, lng: 51.4451, sequence: 4, time: "08:49 → 08:59" },
      { id: "583700", lat: 35.7699, lng: 51.4582, sequence: 5, time: "09:04 → 09:14" },
      { id: "583905", lat: 35.7819, lng: 51.4713, sequence: 6, time: "09:18 → 09:28" },
      { id: "584480", lat: 35.7939, lng: 51.4844, sequence: 7, time: "09:33 → 09:43" },
      { id: "584321", lat: 35.8059, lng: 51.4975, sequence: 8, time: "09:47 → 09:57" },
    ],
  },
  {
    id: 2,
    color: "#93C5FD",
    driver: "driver2",
    points: [
      { id: "583925", lat: 35.7300, lng: 51.4200, sequence: 1, time: "08:08 → 08:18" },
      { id: "584307", lat: 35.7420, lng: 51.4331, sequence: 2, time: "08:25 → 08:35" },
      { id: "584058", lat: 35.7540, lng: 51.4462, sequence: 3, time: "08:48 → 08:58" },
      { id: "584318", lat: 35.7660, lng: 51.4593, sequence: 4, time: "09:00 → 09:10" },
      { id: "584343", lat: 35.7780, lng: 51.4724, sequence: 5, time: "09:15 → 09:25" },
      { id: "583986", lat: 35.7900, lng: 51.4855, sequence: 6, time: "09:45 → 09:55" },
      { id: "583960", lat: 35.8020, lng: 51.4986, sequence: 7, time: "09:57 → 10:07" },
      { id: "582882", lat: 35.8140, lng: 51.5117, sequence: 8, time: "10:09 → 10:19" },
    ],
  },
  {
    id: 3,
    color: "#F97316",
    driver: "driver3",
    points: [
      { id: "583717", lat: 35.7250, lng: 51.4100, sequence: 1, time: "08:26 → 08:36" },
      { id: "584479", lat: 35.7370, lng: 51.4231, sequence: 2, time: "08:41 → 08:51" },
      { id: "584386", lat: 35.7490, lng: 51.4362, sequence: 3, time: "08:53 → 09:03" },
      { id: "583423", lat: 35.7610, lng: 51.4493, sequence: 4, time: "09:08 → 09:18" },
      { id: "583242", lat: 35.7730, lng: 51.4624, sequence: 5, time: "09:28 → 09:38" },
      { id: "583417", lat: 35.7850, lng: 51.4755, sequence: 6, time: "09:50 → 10:00" },
      { id: "584100", lat: 35.7970, lng: 51.4886, sequence: 7, time: "10:00 → 10:10" },
      { id: "583413", lat: 35.8090, lng: 51.5017, sequence: 8, time: "10:12 → 10:22" },
    ],
  },
];

const MapController = () => {
  const map = useMap();
  
  useEffect(() => {
    // Fit bounds to show all markers
    const allPoints = vehicleRoutes.flatMap(route => route.points);
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map]);

  return null;
};

export const RouteMap = () => {
  const createNumberedIcon = (number: number, color: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          ${number}
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <MapContainer
        center={[35.7619, 51.4494]}
        zoom={12}
        style={{ height: "600px", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController />
        
        {vehicleRoutes.map((route) => (
          <>
            {/* Draw route line */}
            <Polyline
              key={`line-${route.id}`}
              positions={route.points.map(p => [p.lat, p.lng] as [number, number])}
              color={route.color}
              weight={4}
              opacity={0.7}
            />
            
            {/* Add numbered markers */}
            {route.points.map((point) => (
              <Marker
                key={point.id}
                position={[point.lat, point.lng]}
                icon={createNumberedIcon(point.sequence, route.color)}
              >
                <Popup>
                  <div className="text-right" dir="rtl">
                    <strong>راننده {route.driver}</strong>
                    <br />
                    <span>شناسه: {point.id}</span>
                    <br />
                    <span>توالی: {point.sequence}</span>
                    <br />
                    <span>زمان: {point.time}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        ))}

        {/* Legend */}
        <div className="leaflet-top leaflet-left" style={{ marginTop: '80px', marginLeft: '10px' }}>
          <div className="bg-white p-4 rounded-lg shadow-lg" style={{ minWidth: '200px' }}>
            <h3 className="font-bold mb-3 text-right">وسایل نقلیه</h3>
            {vehicleRoutes.slice(0, 10).map((route) => (
              <div key={route.id} className="flex items-center gap-2 mb-2 justify-end">
                <span className="text-sm">خودرو {route.id}</span>
                <div
                  style={{ backgroundColor: route.color }}
                  className="w-6 h-6 rounded-full border-2 border-white shadow"
                />
              </div>
            ))}
          </div>
        </div>
      </MapContainer>
    </div>
  );
};
