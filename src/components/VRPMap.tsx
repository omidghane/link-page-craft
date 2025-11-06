// VRPMap.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import L from "leaflet";

// --- Config your backend base URL here ---
const API = axios.create({
  baseURL: "http://localhost:3000", // <- change to your backend
  timeout: 60000,
});

// --- Utils (ported) -------------------------------------------------

function safeMinToHHMM(value) {
  try {
    if (value === null || value === undefined) return "--:--";
    const hours = Math.floor(value / 60);
    const minutes = Math.floor(value % 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  } catch {
    return "--:--";
  }
}

function getRouteKey(route) {
  return route.join("-");
}

const TAB20 = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
  "#aec7e8",
  "#ffbb78",
  "#98df8a",
  "#ff9896",
  "#c5b0d5",
  "#c49c94",
  "#f7b6d2",
  "#c7c7c7",
  "#dbdb8d",
  "#9edae5",
];

// Small, unobtrusive circle number marker for stops
function stopIndexIcon(color, text) {
  return L.divIcon({
    className: "stop-index-icon",
    html: `
      <div style="
        font-size:12px;font-weight:700;text-align:center;
        border-radius:50%;background:${color};
        width:22px;height:22px;line-height:22px;color:#fff;
        border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,.35);
      ">${text}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

// Red cross icon for unassigned customers
const unassignedIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", // replace with your own if you want a red pin
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -28],
});

// --------------------------------------------------------------------

/**
 * Expected backend contracts:
 *
 * GET /api/map/seed
 * -> { df: Array<Row>, vehicles: Array<Array<number>> }
 *    Row has at least: { id:number, x:number, y:number, ...optional times... }
 *
 * POST /api/route-geometry
 * body: { route: number[], routeKey?: string }
 * -> { points: [ [lat,lon], ... ], distance_m: number }
 *
 * You will implement these in Python.
 */

export default function VRPMap() {
  const [df, setDf] = useState([]); // dataframe rows from backend
  const [vehicles, setVehicles] = useState([]); // [[0, ..., 0], ...]
  const [geoms, setGeoms] = useState([]); // [{points, distance_m}, ...] aligned to vehicles
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  // center on depot (id === 0)
  const depotLatLng = useMemo(() => {
    console.log("df loaded:", df);
    if (!df || !Array.isArray(df) || df.length === 0) {
      console.warn("df is either empty or not an array");
      return [12.70322432699803, 51.21798869467282]; // fallback
    }

    const sample = df[0];
    console.log("sample row keys:", sample ? Object.keys(sample) : "no sample");
    console.log("sample row:", sample);

    // find depot row (id === 0) or fallback to the first row
    const depot = df.find((r) => Number(r?.id) === 0) || sample;

    // support both x/y and Latitude/Longitude naming
    const lat = Number(
      depot?.y ?? depot?.Latitude ?? depot?.Lat ?? depot?.latitude
    );
    const lon = Number(
      depot?.x ?? depot?.Longitude ?? depot?.Lon ?? depot?.longitude
    );

    if (Number.isFinite(lat) && Number.isFinite(lon)) return [lat, lon];

    console.warn("depot coords missing or invalid, using fallback", depot);
    return [12.70322432699803, 51.21798869467282];
  }, [df]);

  // assigned & unassigned customers
  const { assigned, unassigned } = useMemo(() => {
    const assignedSet = new Set();
    (vehicles || []).forEach((route) =>
      route.forEach((id) => assignedSet.add(id))
    );
    assignedSet.delete(0);
    const all = new Set(df.map((r) => r.id));
    const unassignedIds = [...all].filter(
      (id) => id !== 0 && !assignedSet.has(id)
    );
    return { assigned: assignedSet, unassigned: unassignedIds };
  }, [df, vehicles]);

  // initial load: df + vehicles, then fetch geometries (points/dist) per vehicle
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrors([]);
      try {
        // 1) seed
        const seed = await API.get("/api/map/seed");
        if (cancelled) return;

        const rows = seed.data?.df || [];
        const vehs = seed.data?.vehicles || [];
        setDf(rows);
        setVehicles(vehs);

        // 2) fetch geometry for each route from backend (your cached ORS logic)
        const promises = vehs.map((route) =>
          API.post("/api/route-geometry", {
            route,
            routeKey: getRouteKey(route),
          })
            .then((r) => ({
              points: r.data?.points || [],
              distance_m: Number(r.data?.distance_m || 0),
            }))
            .catch((e) => {
              return { points: [], distance_m: 0, error: e?.message || "route error" };
            })
        );
        const results = await Promise.all(promises);
        if (cancelled) return;

        // Default values for testing without API
        // const results = vehs.map((route, idx) => ({
        //   points: route.map((_, i) => [51.5 + idx * 0.01, -0.09 + i * 0.01]),
        //   distance_m: route.length * 1000,
        // }));
        // if (cancelled) return;
        setGeoms(results);
      } catch (e) {
        if (!cancelled)
          setErrors((prev) => [...prev, e?.message || "load error"]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>VRP Map</h2>
        {loading && <span>loading…</span>}
        {!!errors.length && (
          <span style={{ color: "crimson" }}>{errors.join(" | ")}</span>
        )}
      </header>
      {Array.isArray(df) && df.length > 0 ? (
        <MapContainer
          center={depotLatLng}
          zoom={12}
          style={{ height: "75vh", width: "100%", borderRadius: 8 }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LayersControl position="topright">
            {/* One visible layer per vehicle */}
            {vehicles.map((route, idx) => {
              const color = TAB20[idx % TAB20.length];
              const geom = geoms[idx] || { points: [], distance_m: 0 };

              return (
                <LayersControl.Overlay
                  key={`veh-${idx}`}
                  name={`🚚 Vehicle ${idx + 1} — ${(
                    geom.distance_m / 1000
                  ).toFixed(2)} km`}
                  checked
                >
                  <LayerGroup>
                    {/* Polyline for the route */}
                    {geom.points.length > 1 && (
                      <Polyline
                        positions={geom.points}
                        pathOptions={{ color, weight: 5, opacity: 1 }}
                      />
                    )}

                    {/* Stop markers & popups */}
                    {route.map((cid, stopIdx) => {
                      if (cid === 0) return null; // skip depot marker here; add your own if you like
                      const row = df.find((r) => Number(r.id) === Number(cid));
                      if (!row) return null;

                      const arrival = safeMinToHHMM(row.arrival_time);
                      const startSvc = safeMinToHHMM(row.start_service);
                      const finishSvc = safeMinToHHMM(row.finish_service);
                      const rt = safeMinToHHMM(row.ready_time);
                      const dt = safeMinToHHMM(row.due_time);
                      const cluster = row.cluster ?? "N/A";

                      return (
                        <Marker
                          key={`veh-${idx}-stop-${cid}`}
                          position={[Number(row.y), Number(row.x)]}
                          icon={stopIndexIcon(color, String(stopIdx))}
                        >
                          <Popup maxWidth={300}>
                            <div style={{ fontSize: 13 }}>
                              <b>🚚 Vehicle:</b> {idx + 1}
                              <br />
                              <b>📍 Stop #{stopIdx} — ID:</b> {cid}
                              <br />
                              <b>🕒 Arrival:</b> {arrival}
                              <br />
                              <b>⏳ Service Start:</b> {startSvc}
                              <br />
                              <b>✅ Finish:</b> {finishSvc}
                              <br />
                              <b>⏱ Time Window:</b> {rt} - {dt}
                              <br />
                              <b>📌 Cluster:</b> {cluster}
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </LayerGroup>
                </LayersControl.Overlay>
              );
            })}

            {/* Unassigned customers */}
            <LayersControl.Overlay name="❌ Unassigned customers" checked>
              <LayerGroup>
                {unassigned.map((cid) => {
                  const row = df.find((r) => Number(r.id) === Number(cid));
                  if (!row) return null;

                  return (
                    <Marker
                      key={`unassigned-${cid}`}
                      position={[Number(row.y), Number(row.x)]}
                      icon={unassignedIcon}
                    >
                      <Popup maxWidth={260}>
                        <div style={{ fontSize: 13 }}>
                          <b>❌ Unassigned Customer</b>
                          <br />
                          <b>ID:</b> {cid}
                          <br />
                          {/* You can wire this to a POST /api/assign-customer if needed */}
                          <button
                            style={{
                              marginTop: 8,
                              background: "#27ae60",
                              color: "white",
                              border: "none",
                              fontWeight: "bold",
                              cursor: "pointer",
                              borderRadius: 4,
                              padding: "6px 10px",
                            }}
                            onClick={() => assignCustomer(cid)}
                          >
                            Add to vehicle
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
      ) : (
        <div
          style={{
            height: "75vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span>{loading ? "Loading map data…" : "No map data available"}</span>
        </div>
      )}

      {/* Simple distances log like your Python printout */}
      <DistanceLog geoms={geoms} />
    </div>
  );
}

// POST to backend to assign a customer (stub; implement server-side)
async function assignCustomer(customerId) {
  try {
    await API.post("/api/assign-customer", { customerId });
    alert(`Customer ${customerId} assignment requested`);
    // optionally trigger a refetch sequence
  } catch (e) {
    alert(`Failed to assign customer ${customerId}: ${e?.message || "error"}`);
  }
}

function DistanceLog({ geoms }) {
  if (!geoms?.length) return null;
  return (
    <div style={{ fontFamily: "monospace", fontSize: 13 }}>
      <div>📏 Total Distance Traveled by Each Vehicle:</div>
      {geoms.map((g, i) => (
        <div key={`d-${i}`}>
          🚚 Vehicle {i + 1}: {(Number(g.distance_m || 0) / 1000).toFixed(2)} km
        </div>
      ))}
    </div>
  );
}
