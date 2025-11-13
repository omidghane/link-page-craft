// VRPMap.tsx
// @ts-nocheck
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
  timeout: 120000, // increased timeout to reduce false timeouts; adjust as needed
});

// --- import the shared hook ---
import { useSeedData } from "../hooks/useSeedData";

// --- Utils (ported) -------------------------------------------------

function safeMinToHHMM(value: any) {
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

function getRouteKey(route: number[]) {
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
function stopIndexIcon(color: string, text: string) {
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
  // --- use the shared hook instead of local API call ---
  const {
    rows: df,
    vehs: vehicles,
    loading: seedLoading,
    error: seedError,
  } = useSeedData();

  const [geoms, setGeoms] = useState<any[]>([]);
  const [loadingGeoms, setLoadingGeoms] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

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
    const assignedSet = new Set<number>();
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
      try {
        setErrors([]);
        setLoadingGeoms(true);
        // --- skip seed fetch, use hook values ---
        if (!df || !Array.isArray(df) || df.length === 0 || !vehicles) {
            console.warn("df or vehicles are not ready yet");
            return;
        }
        console.log("Starting to fetch route geometries...");

        // helper: poll a Celery task until finished (expects GET /api/task/:taskId)
        interface TaskResult {
          points?: number[][];
          distance_m?: number | string;
        }

        interface TaskStatusResponse {
          status?: "pending" | "started" | "success" | "failure" | string;
          result?: TaskResult | null;
          error?: string | null;
        }

        interface PollResult {
          points: number[][];
          distance_m: number;
          error?: string;
        }

        interface PollTaskOptions {
          interval?: number;
          timeout?: number;
          // support both AbortSignal and a simple { aborted: boolean } used in this file
          signal?: AbortSignal | { aborted: boolean };
        }

        async function pollTask(
          taskId: string | number,
          { interval = 10000, timeout = 200000, signal }: PollTaskOptions = {}
        ): Promise<PollResult> {
          const deadline = Date.now() + timeout;
          console.log(
            `pollTask ${taskId} started (interval=${interval}ms timeout=${timeout}ms)`,
            { deadline }
          );

          while (true) {
            if ((signal as { aborted: boolean })?.aborted) {
              console.log(`pollTask ${taskId} aborted by signal`);
              throw new Error("cancelled");
            }

            try {
              console.log(`pollTask ${taskId}: requesting status`);
              const res = await API.get<TaskStatusResponse>(
                `/api/task-status/${taskId}`
              );
              const status = res.data?.status;
              console.log(`pollTask ${taskId}: got status`, {
                status,
                data: res.data,
              });

              if (status === "success" && res.data?.result) {
                // Increment enqueueSuccess and log the success
                enqueueSuccess += 1;
                console.log(
                  `Enqueued ${enqueueSuccess}/${enqueueTotal} /api/route-geometry requests succeeded so far`
                );

                console.log(`pollTask ${taskId}: success`, {
                  pointsCount: res.data.result.points?.length ?? 0,
                  distance_m: res.data.result.distance_m,
                });
                return {
                  points: res.data.result.points || [],
                  distance_m: Number(res.data.result.distance_m || 0),
                };
              }

              if (status === "failure" || res.data?.error) {
                console.error(
                  `pollTask ${taskId}: task failed`,
                  res.data?.error ?? res.data
                );
                return {
                  points: [],
                  distance_m: 0,
                  error: res.data?.error || "task failed",
                };
              }

              // otherwise still queued/started -> continue polling
              console.log(
                `pollTask ${taskId}: still pending/started, will retry`
              );
            } catch (err: any) {
              // network error while polling — treat as transient and continue until timeout
              console.warn(
                `pollTask ${taskId} network error:`,
                err?.message || err
              );
            }

            if (Date.now() > deadline) {
              console.error(`pollTask ${taskId}: deadline reached`);
              return {
                points: [],
                distance_m: 0,
                error: `timeout waiting for task ${taskId}`,
              };
            }

            console.log(
              `pollTask ${taskId}: sleeping ${interval}ms before next check`
            );
            await new Promise((r) => setTimeout(r, interval));
          }
        }

        // helper to request all route geometries via Celery: enqueue then poll all tasks
        const fetchAllGeoms = async () => {
        let enqSuccessCount = 0;
        const enqTotal = (vehicles || []).length;

        const results = [];

        for (const route of vehicles || []) {
            try {
            console.log(`Sending request for route: ${route}`);
            const response = await API.post("/api/route-geometry", {
                route,
                routeKey: getRouteKey(route),
            });

            const { points, distance_m, error } = response.data || {};

            if (error) {
                console.error(`Error for route ${route}: ${error}`);
                results.push({
                points: [],
                distance_m: 0,
                error,
                });
            } else {
                enqSuccessCount += 1;
                console.log(
                `Processed ${enqSuccessCount}/${enqTotal} /api/route-geometry requests successfully`
                );
                results.push({
                points: points || [],
                distance_m: Number(distance_m || 0),
                });
            }
            } catch (e) {
            console.error(`Request failed for route ${route}:`, e?.message || e);
            results.push({
                points: [],
                distance_m: 0,
                error: e?.message || "request error",
            });
            }
        }

        return results;
        };

        // --- enqueue tasks once (do not re-enqueue on retry) ---
        // track how many POSTs to /api/route-geometry have succeeded so far
        let enqueueSuccess = 0;
        const enqueueTotal = (vehicles || []).length;
        const starts = await Promise.all(
          (vehicles || []).map((route) => {
            console.log(`Enqueuing task for route: ${route}`);
            return API.post("/api/route-geometry", {
              route,
              routeKey: getRouteKey(route),
            })
              .then((r) => {
                const taskId = r.data?.task_id || r.data?.task?.id;
                return {
                  taskId,
                  error: r.data?.error,
                };
              })
              .catch((e) => ({
                taskId: null,
                error: e?.message || "enqueue error",
              }));
          })
        );

        if (cancelled) return;
        console.log("All tasks enqueued. Starting polling process.");

        // retry polling only; do not POST again
        const maxAttempts = 3;
        let attempt = 0;
        let results: PollResult[] = [];
        let hadFailure = false;

        while (attempt < maxAttempts && !cancelled) {
          attempt += 1;
          console.log(`Polling route geometries (attempt ${attempt})...`);

          // poll all tasks concurrently (or return immediate error if enqueue failed)
          const pollPromises = starts.map((s) => {
            if (!s.taskId) {
              return Promise.resolve({
                points: [],
                distance_m: 0,
                error: s.error || "no task id",
              });
            }
            return pollTask(s.taskId, {
              interval: 10000,
              timeout: 200000,
              signal: { aborted: cancelled },
            }).catch((e) => ({
              points: [],
              distance_m: 0,
              error: e?.message || "poll error",
            }));
          });

          results = await Promise.all(pollPromises);
          console.log(
            `Polling attempt ${attempt} completed. Results:`,
            results
          );
          if (cancelled) return;

          const failures = results
            .map((r, i) => ({
              idx: i,
              ok: !!r && Array.isArray(r.points) && !r.error,
              r,
            }))
            .filter((x) => !x.ok);

          if (failures.length === 0) {
            console.log(`Polling attempt ${attempt}: All tasks successful.`);
            hadFailure = false;
            break; // all good
          }

          hadFailure = true;
          console.warn(
            `Polling attempt ${attempt} had ${failures.length} failures:`,
            failures.map((f) => ({
              idx: f.idx,
              err: f.r?.error ?? "null/invalid",
            }))
          );

          if (attempt < maxAttempts) {
            // backoff before next poll attempt (do NOT re-enqueue)
            console.log(
              `Polling attempt ${attempt}: Retrying in ${800 * attempt}ms...`
            );
            await new Promise((res) => setTimeout(res, 800 * attempt));
            continue;
          } else {
            break; // exhausted retries
            console.log(`Polling attempt ${attempt}: Max retries reached.`);
          }
        }

        setGeoms(results);

        if (hadFailure) {
          // surface aggregated message
          const failures = results
            .map((r, i) => ({
              idx: i,
              err: r?.error ?? (r ? null : "null result"),
            }))
            .filter((f) => f.err);
          const msgs = failures.length
            ? failures.map((f) => `veh ${f.idx + 1}: ${f.err}`).join(" | ")
            : "Some routes returned invalid geometry";
          console.error("Route geometry failures after retries:", msgs);
          if (!cancelled)
            setErrors((prev) => [...prev, `Route geometry failed: ${msgs}`]);
          // keep loadingGeoms false and do NOT mark ready — prevents map rendering
          setLoadingGeoms(false);
          return;
        }

        // all good
        setLoadingGeoms(false);
        setIsReady(true); // only mark ready when no route errors
      } catch (e) {
        console.error("VRPMap load error:", e);
        if (!cancelled)
          setErrors((prev) => [...prev, e?.message || "load error"]);
      } finally {
        if (!cancelled) setLoadingGeoms(false);
      }
    }
    load();
    
    return () => {
      cancelled = true;
    };
  }, [df, vehicles]); // depend on hook values

  if (seedLoading || loadingGeoms) {
    return (
      <div>
        <div>Loading map (fetching routes)...</div>
        {!!errors.length && (
          <div style={{ color: "crimson", marginTop: 8 }}>
            {errors.join(" | ")}
          </div>
        )}
      </div>
    );
  }

  if (seedError) {
    return (
      <div>
        <div>Error loading seed data: {seedError}</div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div>
        <div>Initializing map...</div>
        {!!errors.length && (
          <div style={{ color: "crimson", marginTop: 8 }}>
            {errors.join(" | ")}
          </div>
        )}
      </div>
    ); // Optional: placeholder while initializing
  }

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
        {(seedLoading || loadingGeoms) && <span>loading…</span>}
        {!!errors.length && (
            <span style={{ color: "crimson" }}>{errors.join(" | ")}</span>
        )}
      </header>
      {Array.isArray(df) && df.length > 0 ? (
        <MapContainer
          center={depotLatLng as L.LatLngExpression}
          zoom={12}
          style={{ height: "75vh", width: "100%", borderRadius: 8 }}
        >
          <TileLayer
            attribution={"&copy; OpenStreetMap" as any}
            url={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" as any}
          />

          <LayersControl position={"topright" as any}>
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
                          position={[Number(row.y), Number(row.x)] as L.LatLngExpression}
                          icon={stopIndexIcon(color, String(stopIdx)) as any}
                        >
                          <Popup maxWidth={300 as any}>
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
                      position={[Number(row.y), Number(row.x)] as L.LatLngExpression}
                      icon={unassignedIcon as any}
                    >
                      <Popup maxWidth={260 as any}>
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
          <span>{loadingGeoms ? "Loading map data…" : "No map data available"}</span>
        </div>
      )}

      {/* Simple distances log like your Python printout */}
      <DistanceLog geoms={geoms} />
    </div>
  );
}

// POST to backend to assign a customer (stub; implement server-side)
async function assignCustomer(customerId: any) {
  try {
    await API.post("/api/assign-customer", { customerId });
    alert(`Customer ${customerId} assignment requested`);
    // optionally trigger a refetch sequence
  } catch (e: any) {
    alert(`Failed to assign customer ${customerId}: ${e?.message || "error"}`);
  }
}

function DistanceLog({ geoms }: { geoms: any[] }) {
  if (!geoms?.length) return null;
  return (
    <div style={{ fontFamily: "monospace", fontSize: 13 }}>
      {geoms.map((geom, idx) => (
        <div key={idx}>
          🚚 Vehicle {idx + 1}: {(geom.distance_m / 1000).toFixed(2)} km
        </div>
      ))}
    </div>
  );
}
