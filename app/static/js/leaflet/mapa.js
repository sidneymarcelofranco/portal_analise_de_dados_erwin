const map = L.map('map').setView([-22.5, -48.5], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

function normalizar(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

Promise.all([
  fetch('static/json/geojs-35-mun.json').then(r => r.json()),
  fetch('static/json/pessoas.json').then(r => r.json())
]).then(([geojsonData, pessoasData]) => {
  const qtdPorMunicipio = {};
  pessoasData.forEach(item => {
    const nome = normalizar(item.municipio);
    qtdPorMunicipio[nome] = item.quantidade;
  });

  Object.entries(qtdPorMunicipio).forEach(([municipio, qtd]) => {
    const coord = coordenadasMock[municipio];
    if (coord) {
      L.marker(coord)
        .addTo(map)
        .bindTooltip(`${qtd} PM`, { permanent: true, direction: 'top' })
        .bindPopup(`<strong>${municipio}</strong><br/>Quantidade: ${qtd}`);
    }
  });

  L.geoJSON(geojsonData, {
    style: feature => {
      const nome = normalizar(feature.properties.name);
      let regiao = null;
      
      // Find the region for this municipality
      for (const [nomeRegiao, municipiosObj] of Object.entries(regioes)) {
        if (Object.keys(municipiosObj).includes(nome)) {
          regiao = nomeRegiao;
          break;
        }
      }

      return {
        color: '#333',
        weight: 1,
        fillOpacity: 0.6,
        fillColor: cores[regiao] || '#cccccc'
      };
    },
    onEachFeature: (feature, layer) => {
      const nomeOriginal = feature.properties.name;
      const nomeNormalizado = normalizar(nomeOriginal);
      const qtd = qtdPorMunicipio[nomeNormalizado] || 0;
      layer.bindPopup(`<strong>${nomeOriginal}</strong><br/>Quantidade: ${qtd}`);
    }
  }).addTo(map);
});