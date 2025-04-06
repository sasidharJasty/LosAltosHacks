import { MapContainer, TileLayer, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import L from 'leaflet';
import { AppSidebar } from "./components/sidebar";

// Fix Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const NDVIMap = () => {
  const mapCenter = [37.0, -119.0];
  const initialZoom = 7.5;

  useEffect(() => {
    (L.Icon.Default as any).mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });
  }, []);

  return (
    <SidebarProvider>
      <div className="h-screen w-full flex relative">
        {/* Sidebar */}
        <div className="h-full w-64 z-[1000] bg-white shadow-lg">
          <AppSidebar />
        </div>

        {/* Main Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            center={mapCenter}
            zoom={initialZoom}
            className="h-full w-full"
            preferCanvas={false}
          >
            <LayersControl position="topright" collapsed={true}>
              <LayersControl.BaseLayer checked name="OpenStreetMap">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  maxZoom={19}
                  minZoom={0}
                  subdomains={['a', 'b', 'c']}
                  detectRetina={false}
                />
              </LayersControl.BaseLayer>

              <LayersControl.Overlay checked name="NDVI (Agricultural Index)">
                <TileLayer
                  url="https://earthengine.googleapis.com/v1/projects/glogin-333701/maps/1ddac755d672ea336da49965459e5d3c-9f1d0947b87b245ce043149670788db3/tiles/{z}/{x}/{y}"
                  attribution="Google Earth Engine"
                  maxZoom={18}
                  minZoom={0}
                  opacity={0.75}
                  subdomains={['a', 'b', 'c']}
                  detectRetina={false}
                />
              </LayersControl.Overlay>
            </LayersControl>
          </MapContainer>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-8 bg-white p-4 rounded-lg shadow-md z-[500]">
            <h3 className="font-semibold mb-2 text-gray-700">Map Legend</h3>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-4 bg-green-600 opacity-75" />
              <span className="text-sm text-gray-600">High Vegetation</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-6 h-4 bg-yellow-500 opacity-75" />
              <span className="text-sm text-gray-600">Moderate Vegetation</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-6 h-4 bg-white border opacity-75" />
              <span className="text-sm text-gray-600">Low Vegetation</span>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default NDVIMap;