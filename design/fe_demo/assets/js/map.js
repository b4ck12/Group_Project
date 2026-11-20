/* ==========================================================================
   TripMate AI — Leaflet Map Engine & Pin Synchronization (design/fe_demo)
   Synthesized from Uber & Airbnb (see design/DESIGN.md)
   ========================================================================== */

const MapModule = (() => {
  let mapInstance = null;
  let markersLayer = null;
  let polylineLayer = null;
  let currentMarkers = [];

  function init() {
    const mapEl = document.getElementById("map-container");
    if (!mapEl || typeof L === "undefined") return;

    // Initialize Leaflet Map centered around Hoi An (Day 1 initial)
    mapInstance = L.map("map-container", {
      zoomControl: false,
      attributionControl: true
    }).setView([15.8820, 108.3320], 14);

    // Reliable standard OpenStreetMap tile layer (100% Free, No Watermark, No API Key required)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
    }).addTo(mapInstance);

    // Zoom control positioned at bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(mapInstance);

    markersLayer = L.layerGroup().addTo(mapInstance);
    polylineLayer = L.layerGroup().addTo(mapInstance);

    // Auto invalidate size to guarantee correct tile rendering
    setTimeout(() => {
      if (mapInstance) mapInstance.invalidateSize();
    }, 250);

    window.addEventListener("resize", () => {
      if (mapInstance) mapInstance.invalidateSize();
    });

    const initialStops = window.TimelineModule ? TimelineModule.getCurrentStops() : MOCK_STOPS_DAY_1;
    updateMarkers(initialStops);
  }

  function updateMarkers(stops) {
    if (!mapInstance || !markersLayer) return;

    markersLayer.clearLayers();
    polylineLayer.clearLayers();
    currentMarkers = [];

    const latLngs = [];

    stops.forEach((stop, index) => {
      latLngs.push([stop.lat, stop.lng]);

      // Custom HTML Marker Pin (Uber Black / Deep Navy Pill with sequence number)
      const customIcon = L.divIcon({
        className: 'custom-map-pin-wrapper',
        html: `<div class="custom-map-pin" id="map-pin-${stop.id || index}">${index + 1}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // Mini Airbnb-style Card Popup
      const popupHtml = `
        <div class="map-popup-card">
          <img src="${stop.image}" alt="${stop.place_name}" class="map-popup-img" />
          <div class="map-popup-info">
            <div class="map-popup-badge-row">
              <span class="badge badge-transit" style="font-size:10px;">Điểm #${index + 1}</span>
              <span class="badge badge-green" style="font-size:10px;">${stop.rating || '4.8'} ★</span>
            </div>
            <div class="map-popup-name">${stop.place_name}</div>
            <div class="map-popup-meta">
              <span class="map-popup-time">${stop.time_display}</span> · <span class="map-popup-cost">${stop.cost_estimated}</span>
            </div>
            <div class="map-popup-address">${stop.address}</div>
          </div>
        </div>
      `;

      const marker = L.marker([stop.lat, stop.lng], { icon: customIcon })
        .bindPopup(popupHtml, { closeButton: false, offset: [0, -14] })
        .addTo(markersLayer);

      // Click on pin navigates to corresponding stop card in timeline
      marker.on("click", () => {
        const cardEl = document.getElementById(`card-${stop.id}`);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
          cardEl.classList.add("highlighted-pulse");
          setTimeout(() => cardEl.classList.remove("highlighted-pulse"), 1500);
        }
      });

      currentMarkers.push(marker);
    });

    // Draw Route Polyline connecting all stops
    if (latLngs.length > 1) {
      L.polyline(latLngs, {
        color: '#186c8e',
        weight: 4,
        dashArray: '8, 10',
        opacity: 0.85,
        lineCap: 'round'
      }).addTo(polylineLayer);

      // Fit bounds with generous margin
      try {
        mapInstance.fitBounds(L.latLngBounds(latLngs), {
          padding: [50, 50],
          maxZoom: 15,
          animate: true
        });
      } catch (e) {
        console.warn("fitBounds fallback", e);
      }
    } else if (latLngs.length === 1) {
      mapInstance.setView(latLngs[0], 15);
    }
  }

  function highlightMarker(index) {
    if (!currentMarkers[index] || !mapInstance) return;

    // Reset pins
    document.querySelectorAll('.custom-map-pin').forEach(pin => pin.classList.remove('active'));

    const marker = currentMarkers[index];
    const pinEl = marker.getElement() ? marker.getElement().querySelector('.custom-map-pin') : null;
    if (pinEl) pinEl.classList.add('active');

    marker.openPopup();
    mapInstance.panTo(marker.getLatLng(), { animate: true, duration: 0.35 });
  }

  function flyToLocation(lat, lng) {
    if (!mapInstance) return;
    mapInstance.flyTo([lat, lng], 15, { duration: 0.8 });
  }

  function fitAll() {
    if (!mapInstance || !polylineLayer) return;
    const initialStops = window.TimelineModule ? TimelineModule.getCurrentStops() : MOCK_STOPS_DAY_1;
    const latLngs = initialStops.map(s => [s.lat, s.lng]);
    if (latLngs.length > 0) {
      mapInstance.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50] });
    }
  }

  return {
    init,
    updateMarkers,
    highlightMarker,
    flyToLocation,
    fitAll
  };
})();
