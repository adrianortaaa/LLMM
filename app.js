/**
 * app.js — Lógica principal de MeteoCartaya
 * Carga hero, previsión 7 días, registros y avisos desde AEMET.
 */

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// ID de estación AEMET más cercana a Cartaya (Huelva-Ronda del Este)
const ESTACION_HUELVA = '5960';
// ID municipio Cartaya para predicción
const MUNICIPIO_CARTAYA = '21021';

/** Formatea una fecha como "lun 5 may" */
function fmtDate(d) {
  return `${DAYS_ES[d.getDay()].toLowerCase()} ${d.getDate()} ${MONTHS_ES[d.getMonth()]}`;
}

/* ── HERO: observación actual ──────────────────────────────── */
async function loadHeroWeather() {
  const card = document.getElementById('hero-weather');
  try {
    const obs = await AEMET.getObservacionEstacion(ESTACION_HUELVA);
    // La API devuelve array; cogemos el último registro
    const last = Array.isArray(obs) ? obs[obs.length - 1] : obs;

    const temp   = parseFloat(last.ta);
    const hum    = parseFloat(last.hr);
    const windKmh = parseFloat(last.vv) * 3.6;
    const gustKmh = parseFloat(last.vmax) * 3.6;
    const pres   = parseFloat(last.pres);
    const rain   = parseFloat(last.prec);
    const fhora  = last.fhora || last.fecha || '';

    card.innerHTML = `
      <div class="hw-loc">📍 Cartaya, Huelva · Observación en tiempo real</div>
      <div class="hw-temp">${isNaN(temp) ? '—' : temp.toFixed(1)}°</div>
      <div class="hw-sky">${isNaN(rain) || rain === 0 ? 'Sin precipitación' : rain + ' mm en la última hora'}</div>
      <div class="hw-grid">
        <div class="hw-stat">
          <span class="hw-stat-label">Humedad</span>
          <span class="hw-stat-value">${isNaN(hum) ? '—' : hum + '%'}</span>
        </div>
        <div class="hw-stat">
          <span class="hw-stat-label">Viento</span>
          <span class="hw-stat-value">${isNaN(windKmh) ? '—' : Math.round(windKmh) + ' km/h'}</span>
        </div>
        <div class="hw-stat">
          <span class="hw-stat-label">Racha máx.</span>
          <span class="hw-stat-value">${isNaN(gustKmh) ? '—' : Math.round(gustKmh) + ' km/h'}</span>
        </div>
        <div class="hw-stat">
          <span class="hw-stat-label">Presión</span>
          <span class="hw-stat-value">${isNaN(pres) ? '—' : Math.round(pres) + ' hPa'}</span>
        </div>
      </div>
      <div class="hw-updated">AEMET · Estación Huelva · ${fhora}</div>
    `;

    document.getElementById('nav-update').textContent =
      'AEMET · ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  } catch (e) {
    console.warn('Error hero weather:', e.message);
    card.innerHTML = `
      <div class="hw-loc">📍 Cartaya, Huelva</div>
      <div class="hw-temp">—</div>
      <div class="hw-sky">Datos no disponibles en este momento</div>
      <div class="hw-updated">AEMET no responde · Inténtalo de nuevo más tarde</div>
    `;
    document.getElementById('nav-update').textContent = 'Sin datos AEMET';
  }
}

/* ── PREVISIÓN 7 DÍAS ──────────────────────────────────────── */
async function loadForecast() {
  const grid = document.getElementById('forecast-grid');
  const stamp = document.getElementById('forecast-stamp');

  try {
    const data = await AEMET.getPrediccionDiaria(MUNICIPIO_CARTAYA);
    // data[0].prediccion.dia es un array de días
    const pred = data[0];
    const dias = pred.prediccion.dia;
    const elaborado = pred.elaborado || '';

    stamp.textContent = 'AEMET · ' + elaborado.substring(0, 16).replace('T', ' ');

    grid.innerHTML = dias.slice(0, 7).map((dia, i) => {
      const fecha = new Date(dia.fecha);
      const hoy = i === 0;

      // Temperatura máx/mín
      const tmax = dia.temperatura && dia.temperatura.maxima;
      const tmin = dia.temperatura && dia.temperatura.minima;

      // Estado del cielo (cogemos el periodo de mediodía si existe, si no el primero)
      const cielos = dia.estadoCielo || [];
      const cielo = cielos.find(c => c.periodo === '13-19') || cielos[0] || {};
      const icono = AEMET.iconoCielo(cielo.value || '11');

      // Probabilidad de precipitación
      const precips = dia.probPrecipitacion || [];
      const precip = precips.find(p => p.periodo === '13-19') || precips[0] || {};
      const pprec = precip.value;

      return `
        <div class="forecast-card ${hoy ? 'today' : ''}">
          <div class="fc-day">${hoy ? 'Hoy' : DAYS_ES[fecha.getDay()]}</div>
          <div class="fc-icon">${icono}</div>
          <div class="fc-max">${tmax !== undefined ? tmax + '°' : '—'}</div>
          <div class="fc-min">${tmin !== undefined ? tmin + '°' : '—'}</div>
          ${pprec !== undefined ? `<div class="fc-rain">${pprec}%</div>` : ''}
        </div>
      `;
    }).join('');

  } catch (e) {
    console.warn('Error forecast:', e.message);
    stamp.textContent = 'AEMET no disponible';
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);font-size:14px;padding:2rem 0;">
      No se pudo obtener la previsión de AEMET. Inténtalo de nuevo más tarde.
    </div>`;
  }
}

/* ── REGISTROS DEL MES ─────────────────────────────────────── */
async function loadRecords() {
  const stamp = document.getElementById('records-stamp');
  try {
    const datos = await AEMET.getClimatologiaMensual(ESTACION_HUELVA);

    let tmax = -Infinity, tmin = Infinity, precTotal = 0, vmaxMax = 0;
    let tmaxD = '', tminD = '', vmaxD = '';

    for (const d of datos) {
      const t = parseFloat(d.tmax);
      const tn = parseFloat(d.tmin);
      const p = parseFloat(d.prec);
      const v = parseFloat(d.racha);
      const fecha = d.fecha || '';

      if (!isNaN(t) && t > tmax) { tmax = t; tmaxD = fecha; }
      if (!isNaN(tn) && tn < tmin) { tmin = tn; tminD = fecha; }
      if (!isNaN(p) && p > 0) precTotal += p;
      if (!isNaN(v) && v > vmaxMax) { vmaxMax = v; vmaxD = fecha; }
    }

    const now = new Date();
    stamp.textContent = `${MONTHS_ES[now.getMonth()]} ${now.getFullYear()} · Estación Huelva`;

    document.getElementById('rec-tmax').textContent = tmax > -Infinity ? tmax.toFixed(1) + ' °C' : '—';
    document.getElementById('rec-tmin').textContent = tmin < Infinity ? tmin.toFixed(1) + ' °C' : '—';
    document.getElementById('rec-prec').textContent = precTotal > 0 ? precTotal.toFixed(1) + ' mm' : '0 mm';
    document.getElementById('rec-vmax').textContent = vmaxMax > 0 ? Math.round(vmaxMax * 3.6) + ' km/h' : '—';

  } catch (e) {
    console.warn('Error registros:', e.message);
    stamp.textContent = 'AEMET no disponible';
    ['rec-tmax','rec-tmin','rec-prec','rec-vmax'].forEach(id => {
      document.getElementById(id).textContent = '—';
    });
  }
}

/* ── AVISOS AEMET ──────────────────────────────────────────── */
async function loadAvisos() {
  const grid = document.getElementById('alerts-grid');
  try {
    // AEMET devuelve XML CAP para avisos; parseamos lo que podemos
    const raw = await AEMET.getAvisos();

    // raw puede ser texto XML o array JSON según versión de API
    let avisos = [];

    if (typeof raw === 'string' && raw.includes('<alert>')) {
      // Parsear XML CAP
      const parser = new DOMParser();
      const doc = parser.parseFromString(raw, 'application/xml');
      const alerts = doc.querySelectorAll('alert');

      alerts.forEach(alert => {
        const infos = alert.querySelectorAll('info');
        infos.forEach(info => {
          const lang = info.querySelector('language')?.textContent || '';
          if (lang !== 'es-ES' && lang !== '') return;
          const event = info.querySelector('event')?.textContent || '';
          const urgency = info.querySelector('urgency')?.textContent || '';
          const severity = info.querySelector('severity')?.textContent || '';
          const areas = info.querySelectorAll('area areaDesc');
          areas.forEach(area => {
            avisos.push({
              zona: area.textContent,
              fenomeno: event,
              nivel: mapSeverity(severity),
            });
          });
        });
      });
    } else if (Array.isArray(raw)) {
      avisos = raw.slice(0, 6).map(a => ({
        zona: a.area || a.zona || 'España',
        fenomeno: a.fenomeno || a.event || 'Aviso meteorológico',
        nivel: a.nivel || mapSeverity(a.severity) || 'Amarillo',
      }));
    }

    if (avisos.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;font-size:13px;color:rgba(255,255,255,0.4);padding:1rem 0;">
        ✅ Sin avisos activos en este momento.
      </div>`;
      return;
    }

    grid.innerHTML = avisos.slice(0, 6).map(a => `
      <div class="alert-card">
        <span class="alert-level level-${a.nivel.toLowerCase()}">${a.nivel}</span>
        <div class="alert-place">${a.zona}</div>
        <div class="alert-what">${a.fenomeno}</div>
      </div>
    `).join('');

  } catch (e) {
    console.warn('Error avisos:', e.message);
    grid.innerHTML = `<div style="grid-column:1/-1;font-size:13px;color:rgba(255,255,255,0.4);padding:1rem 0;">
      No se pudieron obtener los avisos de AEMET.
    </div>`;
  }
}

function mapSeverity(s) {
  if (!s) return 'Amarillo';
  const m = { 'Extreme': 'Rojo', 'Severe': 'Naranja', 'Moderate': 'Amarillo', 'Minor': 'Verde' };
  return m[s] || 'Amarillo';
}

/* ── AUTO-REFRESH ──────────────────────────────────────────── */
function startAutoRefresh() {
  // Refresca todo cada 30 minutos
  setInterval(() => {
    loadHeroWeather();
    loadForecast();
    loadRecords();
    loadAvisos();
    WeatherMap.init();
  }, 30 * 60 * 1000);
}

/* ── INIT ──────────────────────────────────────────────────── */
async function init() {
  // Lanzar todas las cargas en paralelo
  await Promise.allSettled([
    loadHeroWeather(),
    loadForecast(),
    loadRecords(),
    loadAvisos(),
    WeatherMap.init(),
  ]);
  startAutoRefresh();
}

document.addEventListener('DOMContentLoaded', init);
