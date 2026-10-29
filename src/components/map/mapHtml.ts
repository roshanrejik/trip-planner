/**
 * HTML document for the Leaflet map rendered inside a WebView.
 *
 * Why Leaflet in a WebView instead of react-native-maps?
 * react-native-maps on Android needs a Google Maps API key baked into the APK; without one the
 * map renders blank. Leaflet + free CARTO/Esri tiles works out of the box with no keys, while
 * still giving a real, pannable map. RN talks to the page through `window.app.*` calls
 * (injectJavaScript) and the page answers with `postMessage`.
 */
const TRUCK_SVG =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';
const PIN_SVG =
  '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
const NAV_SVG =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>';

export const MAP_HTML = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #EFE9DC; }
  .leaflet-control-attribution { font-size: 9px; background: rgba(255,255,255,0.7) !important; }
  .marker { width: 34px; height: 34px; border-radius: 17px; display: flex; align-items: center;
            justify-content: center; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(17,31,44,.35); }
  .start { background: #F1521F; }
  .end { background: #111F2C; }
  .car { background: #F1521F; width: 38px; height: 38px; border-radius: 19px; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var TILES = {
    standard: { url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                attr: '&copy; OpenStreetMap &copy; CARTO' },
    satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                 attr: '&copy; Esri' }
  };
  function post(msg) { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(msg)); }

  var map = L.map('map', { zoomControl: false, attributionControl: true }).setView([25.3239, 51.531], 13);
  map.attributionControl.setPrefix(false);
  var tileLayer = null;
  var routeLayers = [];
  var startMarker = null, endMarker = null, carMarker = null;
  var padding = { top: 80, right: 50, bottom: 40, left: 50 };

  function icon(cls, svg) {
    return L.divIcon({ className: '', html: '<div class="marker ' + cls + '">' + svg + '</div>',
                       iconSize: [34, 34], iconAnchor: [17, 17] });
  }

  window.app = {
    setStyle: function (name) {
      var t = TILES[name] || TILES.standard;
      if (tileLayer) map.removeLayer(tileLayer);
      tileLayer = L.tileLayer(t.url, { maxZoom: 19, attribution: t.attr, subdomains: 'abcd' }).addTo(map);
    },
    setPadding: function (p) { padding = p; },
    setCenter: function (lat, lng, zoom) { map.setView([lat, lng], zoom || map.getZoom()); },
    setRoute: function (coords, start, end) {
      routeLayers.forEach(function (l) { map.removeLayer(l); });
      routeLayers = [];
      if (startMarker) { map.removeLayer(startMarker); startMarker = null; }
      if (endMarker) { map.removeLayer(endMarker); endMarker = null; }
      if (coords && coords.length) {
        routeLayers.push(L.polyline(coords, { color: '#ffffff', weight: 8, opacity: 0.9 }).addTo(map));
        routeLayers.push(L.polyline(coords, { color: '#F1521F', weight: 4, dashArray: '8 6' }).addTo(map));
      }
      if (start) startMarker = L.marker(start, { icon: icon('start', '${TRUCK_SVG}') }).addTo(map);
      if (end) endMarker = L.marker(end, { icon: icon('end', '${PIN_SVG}') }).addTo(map);
      window.app.fit();
    },
    fit: function () {
      var pts = [];
      routeLayers.forEach(function (l) { pts = pts.concat(l.getLatLngs()); });
      if (startMarker) pts.push(startMarker.getLatLng());
      if (endMarker) pts.push(endMarker.getLatLng());
      if (pts.length) {
        map.fitBounds(L.latLngBounds(pts), {
          paddingTopLeft: [padding.left, padding.top],
          paddingBottomRight: [padding.right, padding.bottom],
          maxZoom: 16
        });
      }
    },
    setCar: function (lat, lng, follow) {
      if (lat == null) { if (carMarker) { map.removeLayer(carMarker); carMarker = null; } return; }
      if (!carMarker) {
        carMarker = L.marker([lat, lng], { icon: L.divIcon({ className: '',
          html: '<div class="marker car">${NAV_SVG}</div>', iconSize: [38, 38], iconAnchor: [19, 19] }),
          zIndexOffset: 1000 }).addTo(map);
      } else {
        carMarker.setLatLng([lat, lng]);
      }
      if (follow) map.setView([lat, lng], Math.max(map.getZoom(), 16), { animate: true });
    }
  };

  map.on('moveend', function () {
    var c = map.getCenter();
    post({ type: 'center', latitude: c.lat, longitude: c.lng });
  });

  window.app.setStyle('standard');
  post({ type: 'ready' });
</script>
</body>
</html>`;
