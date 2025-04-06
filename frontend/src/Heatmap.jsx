import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import {HeatmapLayer} from 'react-leaflet-heatmap-layer-v3';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

// ✅ NASA GIBS: MODIS Terra True Color (daily satellite imagery)
const nasaTileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2024-04-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;

const heatmapData = [
  { lat: 37.7749, lng: -122.4194, intensity: 0.9 }, // SF
  { lat: 34.0522, lng: -118.2437, intensity: 0.8 }, // LA
  { lat: 36.7783, lng: -119.4179, intensity: 0.85 }, // Central CA
  { lat: 32.7157, lng: -117.1611, intensity: 0.6 }, // San Diego
  { lat: 38.5816, lng: -121.4944, intensity: 0.7 }, // Sacramento
];

const NasaHeatmap = () => {
  return (
    <MapContainer
      center={[36.7783, -119.4179]}
      zoom={6}
      scrollWheelZoom={true}
      style={{ height: '100vh', width: '100vw' }}
    >
      <TileLayer
        url={nasaTileUrl}
        attribution='Imagery courtesy NASA EOSDIS GIBS, https://earthdata.nasa.gov'
      />

      <HeatmapLayer
        fitBoundsOnLoad
        fitBoundsOnUpdate
        points={heatmapData}
        longitudeExtractor={(m) => m.lng}
        latitudeExtractor={(m) => m.lat}
        intensityExtractor={(m) => m.intensity}
        radius={30}
        blur={20}
        max={1.0}
      />
    </MapContainer>
  );
};

export default NasaHeatmap;
