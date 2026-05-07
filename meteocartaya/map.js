/**
 * map.js — Mapa interactivo del tiempo en España con datos AEMET
 * Usa D3 + TopoJSON + d3-composite-projections (es-atlas)
 */

const WeatherMap = (() => {
  let currentMode = 'temp';
  let weatherByProvince = {}; // { 'Huelva': { temp, rain, wind, sky } }

  const tempColors  = ['#B5D4F4','#85B7EB','#378ADD','#EF9F27','#BA7517','#D85A30','#993C1D'];
  const rainColors  = ['#1a2744','#0C447C','#185FA5','#378ADD','#85B7EB','#B5D4F4','#E6F1FB'];
  const windColors  = ['#EAF3DE','#C0DD97','#97C459','#EF9F27','#BA7517','#D85A30','#993C1D'];

  const tempScale = d3.scaleQuantize().domain([8, 28]).range(tempColors);
  const rainScale = d3.scaleQuantize().domain([0, 15]).range(rainColors);
  const windScale = d3.scaleQuantize().domain([0, 50]).range(windColors);

  const legendLabels = {
    temp: { lo: '8°C', hi: '28°C' },
    rain: { lo: 'Sin lluvia', hi: '15 mm' },
    wind: { lo: 'Calma', hi: '50 km/h' },
  };

  function colorFor(prov, mode) {
    const d = weatherByProvince[prov];
    if (!d) return '#2a3f54';
    if (mode === 'temp') return tempScale(d.temp);
    if (mode === 'rain') return rainScale(d.rain);
    if (mode === 'wind') return windScale(d.wind);
    return '#2a3f54';
  }

  function buildLegend(mode) {
    const bar = document.getElementById('map-legend');
    const colors = mode === 'temp' ? tempColors : mode === 'rain' ? rainColors : windColors;
    const { lo, hi } = legendLabels[mode];
    bar.innerHTML = `
      <span>${lo}</span>
      <div class="legend-bar">${colors.map(c => `<div class="legend-seg" style="background:${c}"></div>`).join('')}</div>
      <span>${hi}</span>
    `;
  }

  function setMode(mode) {
    currentMode = mode;
    d3.selectAll('.prov-path').attr('fill', function() {
      return colorFor(this.dataset.prov, mode);
    });
    buildLegend(mode);
  }

  function resolveProvince(name) {
    if (!name) return null;
    const upper = name.toUpperCase().trim();
    if (AEMET.PROV_MAP[upper]) return AEMET.PROV_MAP[upper];
    // Búsqueda parcial
    for (const [k, v] of Object.entries(AEMET.PROV_MAP)) {
      if (upper.includes(k) || k.includes(upper)) return v;
    }
    return name;
  }

  /**
   * Procesa las observaciones brutas de AEMET y devuelve un objeto
   * { 'Huelva': { temp, rain, wind, sky }, ... }
   * agrupando por provincia y calculando la media de estaciones.
   */
  function processObservaciones(obs) {
    const byProv = {};

    for (const o of obs) {
      if (!o.provincia) continue;
      const prov = resolveProvince(o.provincia);
      if (!prov) continue;

      if (!byProv[prov]) byProv[prov] = { temps: [], rains: [], winds: [], count: 0 };

      const temp = parseFloat(o.ta);   // temperatura aire
      const rain = parseFloat(o.prec); // precipitación
      const wind = parseFloat(o.vv);   // velocidad viento (m/s)
      const gust = parseFloat(o.vmax); // racha máx

      if (!isNaN(temp)) byProv[prov].temps.push(temp);
      if (!isNaN(rain) && rain >= 0) byProv[prov].rains.push(rain);
      if (!isNaN(wind)) byProv[prov].winds.push(wind * 3.6); // m/s → km/h
      byProv[prov].count++;
    }

    const result = {};
    for (const [prov, d] of Object.entries(byProv)) {
      const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
      const t = avg(d.temps);
      const r = avg(d.rains);
      const w = avg(d.winds);
      result[prov] = {
        temp: t !== null ? Math.round(t * 10) / 10 : null,
        rain: r !== null ? Math.round(r * 10) / 10 : 0,
        wind: w !== null ? Math.round(w) : null,
        sky: skyFromTemp(t, r),
      };
    }
    return result;
  }

  /** Infiere el estado del cielo aproximado a partir de temp+lluvia cuando no hay dato directo */
  function skyFromTemp(t, r) {
    if (r > 5) return 'Lluvia';
    if (r > 0.5) return 'Chubascos';
    if (t === null) return 'Variable';
    return 'Despejado/Poco nuboso';
  }

  function renderTooltip(event, provName) {
    const d = weatherByProvince[provName];
    if (!d) return;
    const tip = document.getElementById('map-tooltip');
    const modeLabel = currentMode === 'temp' ? `${d.temp !== null ? d.temp + '°C' : '—'}`
                    : currentMode === 'rain' ? `${d.rain} mm`
                    : `${d.wind !== null ? d.wind + ' km/h' : '—'}`;

    tip.innerHTML = `
      <div class="tt-name">${provName}</div>
      <div class="tt-big">${d.temp !== null ? d.temp + '°' : '—'}</div>
      <div class="tt-row"><span class="tt-lbl">Lluvia</span><span>${d.rain} mm</span></div>
      <div class="tt-row"><span class="tt-lbl">Viento</span><span>${d.wind !== null ? d.wind + ' km/h' : '—'}</span></div>
      <div class="tt-row"><span class="tt-lbl">Cielo</span><span>${d.sky}</span></div>
    `;
    tip.style.display = 'block';
    positionTooltip(event);
  }

  function positionTooltip(event) {
    const tip = document.getElementById('map-tooltip');
    const wrap = document.querySelector('.map-wrap');
    const rect = wrap.getBoundingClientRect();
    let x = event.clientX - rect.left + 12;
    let y = event.clientY - rect.top - 10;
    if (x + 170 > rect.width) x -= 185;
    tip.style.left = Math.max(0, x) + 'px';
    tip.style.top = Math.max(0, y) + 'px';
  }

  async function init() {
    // Tabs
    document.querySelectorAll('.map-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.map-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setMode(btn.dataset.mode);
      });
    });

    // Cargar observaciones AEMET
    let obs = [];
    try {
      obs = await AEMET.getObservacionTodas();
      weatherByProvince = processObservaciones(obs);
      document.getElementById('map-stamp').textContent =
        'AEMET · ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.warn('AEMET observaciones no disponibles, usando datos de ejemplo:', e.message);
      weatherByProvince = getFallbackData();
      document.getElementById('map-stamp').textContent = 'Datos de ejemplo (AEMET no disponible)';
    }

    // Cargar topología de España
    try {
      const es = await d3.json('https://unpkg.com/es-atlas@0.3.1/es/provinces.json');
      drawMap(es);
    } catch (e) {
      console.error('Error cargando topología:', e);
      document.getElementById('map-loading').innerHTML = '<span>Error cargando el mapa. Comprueba tu conexión.</span>';
    }
  }

  function drawMap(es) {
    const svg = d3.select('#map-svg');
    const features = topojson.feature(es, es.objects.provinces).features;
    const projection = d3.geoConicConformalSpain().fitSize([900, 500], topojson.feature(es, es.objects.provinces));
    const path = d3.geoPath(projection);

    svg.selectAll('path')
      .data(features)
      .join('path')
      .attr('class', 'prov-path')
      .attr('d', path)
      .attr('stroke', 'rgba(255,255,255,0.2)')
      .each(function(d) {
        const raw = d.properties && (d.properties.name || '');
        const prov = resolveProvince(raw) || raw;
        this.dataset.prov = prov;
      })
      .attr('fill', function() { return colorFor(this.dataset.prov, 'temp'); })
      .on('mouseover', function(event, d) {
        renderTooltip(event, this.dataset.prov);
      })
      .on('mousemove', function(event) {
        const tip = document.getElementById('map-tooltip');
        if (tip.style.display === 'block') positionTooltip(event);
      })
      .on('mouseout', function() {
        document.getElementById('map-tooltip').style.display = 'none';
      });

    // Etiquetas de temperatura
    features.forEach(d => {
      const c = path.centroid(d);
      if (!c || isNaN(c[0])) return;
      const prov = resolveProvince(d.properties && d.properties.name) || '';
      const wd = weatherByProvince[prov];
      if (!wd || wd.temp === null) return;
      svg.append('text')
        .attr('x', c[0]).attr('y', c[1])
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10')
        .attr('font-family', 'Space Grotesk, sans-serif')
        .attr('font-weight', '500')
        .attr('fill', 'rgba(255,255,255,0.85)')
        .attr('pointer-events', 'none')
        .text(wd.temp + '°');
    });

    buildLegend('temp');
    document.getElementById('map-loading').classList.add('hidden');
  }

  /** Datos de fallback si AEMET no está disponible */
  function getFallbackData() {
    return {
      'Huelva': { temp: 21, rain: 3, wind: 32, sky: 'Viento' },
      'Sevilla': { temp: 23, rain: 1, wind: 18, sky: 'Parcialmente nuboso' },
      'Cádiz': { temp: 20, rain: 2, wind: 28, sky: 'Nuboso' },
      'Badajoz': { temp: 22, rain: 0, wind: 15, sky: 'Despejado' },
      'Málaga': { temp: 22, rain: 0, wind: 12, sky: 'Despejado' },
      'Granada': { temp: 20, rain: 0, wind: 10, sky: 'Despejado' },
      'Córdoba': { temp: 24, rain: 0, wind: 10, sky: 'Despejado' },
      'Jaén': { temp: 21, rain: 0, wind: 8, sky: 'Despejado' },
      'Almería': { temp: 26, rain: 0, wind: 8, sky: 'Calor' },
      'Murcia': { temp: 25, rain: 0, wind: 10, sky: 'Calor' },
      'Alicante': { temp: 23, rain: 0, wind: 12, sky: 'Despejado' },
      'Valencia': { temp: 22, rain: 0, wind: 14, sky: 'Despejado' },
      'Castellón': { temp: 21, rain: 0, wind: 14, sky: 'Despejado' },
      'Tarragona': { temp: 20, rain: 0, wind: 16, sky: 'Despejado' },
      'Barcelona': { temp: 19, rain: 0, wind: 16, sky: 'Despejado' },
      'Girona': { temp: 17, rain: 1, wind: 18, sky: 'Parcial' },
      'Lleida': { temp: 18, rain: 0, wind: 14, sky: 'Despejado' },
      'Huesca': { temp: 13, rain: 8, wind: 22, sky: 'Nieve' },
      'Zaragoza': { temp: 18, rain: 0, wind: 30, sky: 'Viento' },
      'Teruel': { temp: 15, rain: 1, wind: 18, sky: 'Nublado' },
      'Madrid': { temp: 19, rain: 0, wind: 16, sky: 'Despejado' },
      'Toledo': { temp: 21, rain: 0, wind: 12, sky: 'Despejado' },
      'Guadalajara': { temp: 18, rain: 0, wind: 14, sky: 'Despejado' },
      'Cuenca': { temp: 17, rain: 1, wind: 12, sky: 'Parcial' },
      'Ciudad Real': { temp: 22, rain: 0, wind: 10, sky: 'Despejado' },
      'Albacete': { temp: 22, rain: 0, wind: 10, sky: 'Despejado' },
      'Cáceres': { temp: 20, rain: 1, wind: 14, sky: 'Parcial' },
      'Salamanca': { temp: 17, rain: 1, wind: 14, sky: 'Nublado' },
      'Zamora': { temp: 16, rain: 1, wind: 15, sky: 'Nublado' },
      'Valladolid': { temp: 17, rain: 0, wind: 16, sky: 'Despejado' },
      'Palencia': { temp: 15, rain: 1, wind: 17, sky: 'Nublado' },
      'León': { temp: 14, rain: 2, wind: 18, sky: 'Nublado' },
      'Burgos': { temp: 13, rain: 3, wind: 22, sky: 'Nublado' },
      'Soria': { temp: 12, rain: 2, wind: 20, sky: 'Nublado' },
      'Segovia': { temp: 15, rain: 0, wind: 14, sky: 'Despejado' },
      'Ávila': { temp: 14, rain: 1, wind: 15, sky: 'Nublado' },
      'A Coruña': { temp: 16, rain: 8, wind: 35, sky: 'Lluvia' },
      'Lugo': { temp: 13, rain: 10, wind: 22, sky: 'Lluvia' },
      'Ourense': { temp: 17, rain: 3, wind: 16, sky: 'Nublado' },
      'Pontevedra': { temp: 16, rain: 9, wind: 28, sky: 'Lluvia' },
      'Asturias': { temp: 15, rain: 5, wind: 30, sky: 'Nublado' },
      'Cantabria': { temp: 14, rain: 6, wind: 32, sky: 'Nublado' },
      'Bizkaia': { temp: 15, rain: 3, wind: 24, sky: 'Nublado' },
      'Gipuzkoa': { temp: 14, rain: 4, wind: 22, sky: 'Nublado' },
      'Álava': { temp: 13, rain: 2, wind: 18, sky: 'Nublado' },
      'Navarra': { temp: 14, rain: 2, wind: 20, sky: 'Nublado' },
      'La Rioja': { temp: 16, rain: 1, wind: 15, sky: 'Despejado' },
      'Illes Balears': { temp: 20, rain: 2, wind: 28, sky: 'Oleaje' },
      'Las Palmas': { temp: 24, rain: 0, wind: 20, sky: 'Despejado' },
      'Santa Cruz de Tenerife': { temp: 23, rain: 0, wind: 22, sky: 'Despejado' },
    };
  }

  return { init };
})();
