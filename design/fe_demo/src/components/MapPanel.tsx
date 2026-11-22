import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Stop } from '../types';
import { Navigation, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface MapPanelProps {
  stops: Stop[];
  activeStopId: string;
  setActiveStopId: (id: string) => void;
}

export const MapPanel: React.FC<MapPanelProps> = ({ stops, activeStopId, setActiveStopId }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  const activeStop = stops.find(s => s.id === activeStopId) || stops[0];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [15.8801, 108.3380], // Hoi An Ancient Town
        zoom: 13,
        zoomControl: false
      });

      // OpenStreetMap standard tiles - 100% Free, No API Key, No Watermark
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers & polyline
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};
    if (polylineRef.current) {
      polylineRef.current.remove();
    }

    // Add markers for all stops with valid lat/lng
    const latlngs: L.LatLngExpression[] = [];

    stops.forEach((stop, index) => {
      if (stop.lat && stop.lng) {
        latlngs.push([stop.lat, stop.lng]);

        const isActive = stop.id === activeStopId;
        const pinBg = isActive ? '#bf5431' : '#0e2238';
        const pinScale = isActive ? 'scale(1.2)' : 'scale(1)';

        const customIcon = L.divIcon({
          className: 'custom-leaflet-pin',
          html: `
            <div style="
              width: 28px;
              height: 28px;
              background-color: ${pinBg};
              color: #ffffff;
              border-radius: 50%;
              border: 2px solid #ffffff;
              box-shadow: 0 4px 10px rgba(14,34,56,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: 'JetBrains Mono', monospace;
              font-size: 11px;
              font-weight: 700;
              transform: ${pinScale};
              transition: all 0.25s ease;
              cursor: pointer;
            ">
              ${index + 1}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([stop.lat, stop.lng], { icon: customIcon })
          .addTo(map)
          .on('click', () => {
            setActiveStopId(stop.id);
          });

        marker.bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 200px;">
            <div style="font-size: 10px; font-weight: 700; color: #d99726; text-transform: uppercase;">Trạm ${index + 1} • ${stop.time.split('—')[0]}</div>
            <div style="font-size: 12px; font-weight: 700; color: #182230; margin-top: 2px;">${stop.name}</div>
            <div style="font-size: 10px; color: #6b7a88; margin-top: 2px;">${stop.address}</div>
          </div>
        `);

        markersRef.current[stop.id] = marker;
      }
    });

    // Draw route polyline connecting airport to hotel to stops
    if (latlngs.length > 1) {
      polylineRef.current = L.polyline(latlngs, {
        color: '#d99726',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 8'
      }).addTo(map);
    }

    return () => {
      // Keep map instance across renders
    };
  }, [stops]);

  // Pan to active stop
  useEffect(() => {
    if (mapInstanceRef.current && activeStop?.lat && activeStop?.lng) {
      mapInstanceRef.current.flyTo([activeStop.lat, activeStop.lng], 15, {
        duration: 1.0
      });
      const marker = markersRef.current[activeStop.id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [activeStopId]);

  // Zoom controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    if (mapInstanceRef.current && stops.length > 0) {
      const validStops = stops.filter(s => s.lat && s.lng);
      if (validStops.length > 0) {
        const bounds = L.latLngBounds(validStops.map(s => [s.lat, s.lng]));
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  };

  return (
    <div className="lg:col-span-3 bg-pureWhite rounded-xl border border-ash shadow-sm flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="p-3 border-b border-ash bg-surface/50 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-ink">Bản Đồ Lộ Trình Thực Tế</h3>
          <p className="text-[10px] text-muted font-mono">Đà Nẵng (DAD) ⇄ Phố Cổ Hội An</p>
        </div>
        <div className="px-2 py-1 rounded bg-pureWhite border border-ash text-[10px] font-semibold text-graphite flex items-center gap-1 shadow-sm">
          <span>🌤️ 28°C</span>
          <span className="text-muted">• Nắng dịu</span>
        </div>
      </div>

      {/* Real Leaflet Map Container */}
      <div className="flex-1 relative w-full h-full min-h-[350px]">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Map Control Buttons */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 shadow-md">
          <button
            onClick={handleZoomIn}
            className="p-1.5 bg-pureWhite hover:bg-surface text-ink rounded-lg border border-ash transition-colors"
            title="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 bg-pureWhite hover:bg-surface text-ink rounded-lg border border-ash transition-colors"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 bg-pureWhite hover:bg-surface text-ink rounded-lg border border-ash transition-colors"
            title="Xem toàn bộ tuyến đường (Sân bay & Hội An)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Active Stop Mini Card at Bottom */}
        {activeStop ? (
          <div className="absolute bottom-3 left-3 right-3 z-10 p-3 bg-pureWhite/95 backdrop-blur-md rounded-xl border border-ash shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ochre font-mono block">
                  Đang Xem Trạm Số {stops.findIndex(s => s.id === activeStop.id) + 1}
                </span>
                <h5 className="font-bold text-xs text-ink mt-0.5 line-clamp-1">{activeStop.name}</h5>
                <p className="text-[10px] text-muted line-clamp-1 mt-0.5">{activeStop.address}</p>
              </div>
              <span className="text-xs font-mono font-bold text-navy shrink-0 ml-2">
                {activeStop.time.split('—')[0]}
              </span>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 right-3 z-10 p-2.5 bg-pureWhite/90 backdrop-blur-md rounded-xl border border-ash shadow-md text-center text-[10px] text-graphite font-mono">
            Vùng quan sát: Đà Nẵng — Hội An • Bản đồ lộ trình chi tiết sẽ hiển thị sau khi nhóm chốt Phương Án Tổng Thể
          </div>
        )}
      </div>
    </div>
  );
};
