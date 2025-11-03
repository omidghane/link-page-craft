import { useEffect, useRef } from "react";
import leaflet from "leaflet";
import useLocalStorage from "../hooks/useLocalStorage";
// import useGeolocation from "../hooks/useGeolocation";


export default function Map() {
  const mapRef = useRef();
  const userMarkerRef = useRef();

  const [userPosition, setUserPosition] = useLocalStorage("USER_MARKER", {
    latitude: 0,
    longitude: 0,
  });

  const [nearbyMarkers, setNearbyMarkers] = useLocalStorage(
    "NEARBY_MARKERS",
    []
  );

  const [depotLocation] = useLocalStorage("depotLocation", {
    latitude: 35.6892, // Default to Tehran
    longitude: 51.3890,
  });
//   const location = {
//     latitude: depotLocation.latitude,
//     longitude: depotLocation.longitude,
//   };
  const depotLat = depotLocation.latitude;
  const depotLng = depotLocation.longitude;

  useEffect(() => {
    mapRef.current = leaflet
      .map("map")
      .setView([depotLat, depotLng], 13);

    leaflet
      .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
      .addTo(mapRef.current);

    nearbyMarkers.forEach(({ latitude, longitude }) => {
      leaflet
        .marker([latitude, longitude])
        .addTo(mapRef.current)
        .bindPopup(
          `lat: ${latitude.toFixed(2)}, long: ${longitude.toFixed(2)}`
        );
    });

    mapRef.current.addEventListener("click", (e) => {
      const { lat: latitude, lng: longitude } = e.latlng;
      leaflet
        .marker([latitude, longitude])
        .addTo(mapRef.current)
        .bindPopup(
          `lat: ${latitude.toFixed(2)}, long: ${longitude.toFixed(2)}`
        );

      setNearbyMarkers((prevMarkers) => [
        ...prevMarkers,
        { latitude, longitude },
      ]);
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
  
    setUserPosition((prev) => {
      if (prev.latitude === depotLat && prev.longitude === depotLng) return prev;
      return { latitude: depotLat, longitude: depotLng };
    });
  
    if (userMarkerRef.current) {
      mapRef.current.removeLayer(userMarkerRef.current);
    }
  
    userMarkerRef.current = leaflet
      .marker([depotLat, depotLng])
      .addTo(mapRef.current)
      .bindPopup("User");
  
    const el = userMarkerRef.current.getElement();
    if (el) el.style.filter = "hue-rotate(120deg)";
  
    mapRef.current.setView([depotLat, depotLng]);
  }, [depotLat, depotLng, setUserPosition]);
  
  return <div id="map" ref={mapRef}></div>;
}