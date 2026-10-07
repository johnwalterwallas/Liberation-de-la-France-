const map = L.map('map', {
  zoomControl: true,
  attributionControl: true
}).setView([46.7, 2.2], 6);

// OpenStreetMap standard tiles (reliable, free)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19
}).addTo(map);

const colors = {
  landing: '#2878d0',
  battle: '#c43b35',
  resistance: '#3c9b62',
  pocket: '#d27b22'
};

const markers = {};

BATTLES.forEach(b => {
  const m = L.circleMarker([b[3], b[4]], {
    radius: 8,
    color: colors[b[5]],
    fillColor: colors[b[5]],
    fillOpacity: 0.9,
    weight: 2,
    opacity: 1
  }).addTo(map);

  m.bindPopup(
    '<b>' + b[2] + '</b><br><small>' + b[1] + '</small><p style="margin:8px 0 0">' + b[6] + '</p>'
  );

  m.on('mouseover', function () { this.setStyle({ radius: 11 }); });
  m.on('mouseout', function () {
    const active = this.options.fillOpacity > 0.5;
    this.setStyle({ radius: active ? 8 : 6 });
  });

  markers[b[0]] = m;
});
