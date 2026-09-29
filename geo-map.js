// Leaflet sits over OpenStreetMap tiles. City coordinates are WGS84; connections are illustrative.
export function createGeoMap(element, scenes, coordinates, places, modes) {
  const L = window.L;
  if (!L) throw new Error('Leaflet did not load');
  const map = L.map(element, { scrollWheelZoom: false, zoomControl: true, preferCanvas: true });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>',
    maxZoom: 17
  }).addTo(map);

  const used = [...new Set(scenes.flatMap(scene => scene.points))];
  const bounds = L.latLngBounds(used.map(key => coordinates[key]));
  const routes = scenes.map(scene => {
    const keys = scene.points;
    if (scene.mode !== 'plane' || keys.length !== 2) return keys.map(key => coordinates[key]);
    const [a, b] = keys.map(key => coordinates[key]);
    const bend = Math.min(3.3, Math.abs(b[1] - a[1]) * .08);
    return Array.from({ length: 33 }, (_, i) => {
      const t = i / 32;
      return [a[0] * (1 - t) + b[0] * t + Math.sin(Math.PI * t) * bend, a[1] * (1 - t) + b[1] * t];
    });
  });
  const lines = routes.map((points, i) => L.polyline(points, {
    color: modes[scenes[i].mode === 'mixed' ? 'train' : scenes[i].mode].color,
    weight: 3, opacity: .62, dashArray: '5 8', lineCap: 'round', interactive: false
  }).addTo(map));

  const major = new Set(['astana', 'urc', 'beijing', 'xian', 'luoyang', 'zjj', 'chongqing', 'chengdu']);
  const labelDirection = { xian: 'left', luoyang: 'right', chengdu: 'left', chongqing: 'top', zjj: 'right' };
  const dots = Object.fromEntries(used.map(key => {
    const dot = L.circleMarker(coordinates[key], {
      radius: major.has(key) ? 6 : 4, color: '#15312d', weight: 2,
      fillColor: major.has(key) ? '#d6ef83' : '#faf3cd', fillOpacity: 1
    }).addTo(map).bindPopup(places[key].name);
    if (major.has(key)) dot.bindTooltip(places[key].name, { permanent: true, direction: labelDirection[key] || 'top', offset: [0, -7], className: `geo-label geo-label-${key}` });
    return [key, dot];
  }));
  const active = L.polyline([], { color: '#d6ef83', weight: 5, opacity: .95, lineCap: 'round', interactive: false }).addTo(map);
  const traveler = L.marker(coordinates[scenes[0].points[0]], {
    interactive: false, zIndexOffset: 1000, icon: iconFor('plane')
  }).addTo(map);
  let currentMode = 'plane';
  let currentIndex = -1;

  function iconFor(mode) {
    const symbols = { plane: '✈', train: '🚆', road: '🚌', walk: '🚶' };
    return L.divIcon({ className: 'geo-vehicle', html: `<span style="--vehicle-color:${modes[mode].color}" aria-hidden="true">${symbols[mode]}</span>`, iconSize: [42, 42], iconAnchor: [21, 21] });
  }

  function pointAt(points, fraction) {
    const lengths = points.slice(1).map((point, i) => {
      const a = L.latLng(points[i]);
      return a.distanceTo(L.latLng(point));
    });
    const total = lengths.reduce((a, b) => a + b, 0);
    let target = total * fraction;
    const part = [points[0]];
    for (let i = 0; i < lengths.length; i++) {
      if (target <= lengths[i] || i === lengths.length - 1) {
        const t = lengths[i] ? Math.max(0, Math.min(1, target / lengths[i])) : 1;
        const a = points[i], b = points[i + 1];
        const position = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        part.push(position);
        return { position, part };
      }
      part.push(points[i + 1]);
      target -= lengths[i];
    }
    return { position: points.at(-1), part: points };
  }

  function paint(index, progress, mode) {
    const indexChanged = currentIndex !== index;
    const modeChanged = currentMode !== mode;
    if (indexChanged) {
      currentIndex = index;
      lines.forEach((line, i) => line.setStyle({ dashArray: i < index ? null : '5 8', opacity: i < index ? .92 : .62, weight: i < index ? 4 : 3 }));
    }
    const { position, part } = pointAt(routes[index], progress);
    active.setLatLngs(part);
    traveler.setLatLng(position);
    if (modeChanged) { currentMode = mode; active.setStyle({ color: modes[mode].color }); traveler.setIcon(iconFor(mode)); }
    if (indexChanged || modeChanged) {
      const destination = scenes[index].points.at(-1);
      Object.entries(dots).forEach(([key, dot]) => dot.setStyle({ fillColor: key === destination ? modes[mode].color : major.has(key) ? '#d6ef83' : '#faf3cd' }));
    }
  }

  function fit() { map.fitBounds(bounds, { padding: [44, 44], maxZoom: 6, animate: false }); }
  fit();
  return { paint, fit, resize() { map.invalidateSize(); fit(); }, destroy() { map.remove(); } };
}
