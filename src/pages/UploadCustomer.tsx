import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import delinexLogo from "@/assets/delinex-logo.png";
import '@/hooks/leaflet-icons.ts'; 

// Import Leaflet components
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Center the map and allow clicks to update coordinates
const LocationMarker = ({ setLatLng }: { setLatLng: (latLng: { lat: number, lng: number }) => void }) => {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;
      setLatLng({ lat, lng });
    },
  });

  return null;
};

const UploadCustomer = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    depotLatitude: "",
    depotLongitude: "",
    startTime: "08:00",
    finishTime: "20:00",
    maxCapacity: "",
    numVehicles: "",
  });
  
  const [latLng, setLatLng] = useState<{ lat: number, lng: number } | null>(null); // For Leaflet map

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      {/* Leaflet Map */}
      <div style={{ height: '400px', marginBottom: '20px' }}>
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker setLatLng={setLatLng} />
          {latLng && (
            <Marker position={[latLng.lat, latLng.lng]}>
              <Popup>
                Latitude: {latLng.lat} <br /> Longitude: {latLng.lng}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Form Fields */}
      <form>
        <Label htmlFor="file">Upload File</Label>
        <Input type="file" id="file" onChange={handleFileChange} />
        
        <Label htmlFor="depotLatitude">Latitude</Label>
        <Input
          type="text"
          id="depotLatitude"
          name="depotLatitude"
          value={formData.depotLatitude}
          onChange={handleInputChange}
        />
        
        <Label htmlFor="depotLongitude">Longitude</Label>
        <Input
          type="text"
          id="depotLongitude"
          name="depotLongitude"
          value={formData.depotLongitude}
          onChange={handleInputChange}
        />
        
        {/* Add other form fields as necessary */}
        
        <Button onClick={() => toast.success("File uploaded successfully!")}>
          <Upload /> Upload
        </Button>
      </form>
    </div>
  );
};

export default UploadCustomer;
