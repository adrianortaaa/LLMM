/**
 * aemet.js — Módulo de integración con AEMET OpenData
 * Documentación: https://opendata.aemet.es/dist/index.html
 */

const AEMET = (() => {
  const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhb3J0bWFyODU2QGllc2xhbWFyaXNtYS5uZXQiLCJqdGkiOiI1ZTFlNzU1OC04NTk4LTRhODktYmM4MC01ZjA4YWU5NDgxY2IiLCJpc3MiOiJBRU1FVCIsImlhdCI6MTc3ODE5MDcwNiwidXNlcklkIjoiNWUxZTc1NTgtODU5OC00YTg5LWJjODAtNWYwOGFlOTQ4MWNiIiwicm9sZSI6IiJ9.LcTEWzqKTLPmxMDKPZzvpdUjah4mej0qgOSlUEqMwaU';
  const BASE = 'https://opendata.aemet.es/opendata/api';

  // ID de municipio de Cartaya (Huelva) en AEMET
  const CARTAYA_ID = '21021';

  // Cache en memoria para no superar el rate limit
  const cache = {};
  const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

  /**
   * Llama a un endpoint AEMET (devuelve primero la URL de datos, luego los datos reales).
   * AEMET usa un sistema de doble petición: primero metadata+url, luego la url con los datos.
   */
  async function fetchAemet(path) {
    const cacheKey = path;
    const now = Date.now();
    if (cache[cacheKey] && (now - cache[cacheKey].ts) < CACHE_TTL) {
      return cache[cacheKey].data;
    }

    const url = `${BASE}${path}?api_key=${API_KEY}`;
    const meta = await fetch(url).then(r => r.json());

    if (meta.estado !== 200) {
      throw new Error(`AEMET error ${meta.estado}: ${meta.descripcion}`);
    }

    const data = await fetch(meta.datos).then(r => r.json());
    cache[cacheKey] = { data, ts: now };
    return data;
  }

  /**
   * Predicción diaria para un municipio (7 días).
   * Endpoint: /prediccion/especifica/municipio/diaria/{idMunicipio}
   */
  async function getPrediccionDiaria(idMunicipio = CARTAYA_ID) {
    return fetchAemet(`/prediccion/especifica/municipio/diaria/${idMunicipio}`);
  }

  /**
   * Observación actual de todas las estaciones meteorológicas convencionales.
   * Endpoint: /observacion/convencional/todas
   */
  async function getObservacionTodas() {
    return fetchAemet('/observacion/convencional/todas');
  }

  /**
   * Observación de una estación concreta.
   * Cartaya: estación más cercana es Huelva (5960) o Almonte (5945)
   */
  async function getObservacionEstacion(idEstacion = '5960') {
    return fetchAemet(`/observacion/convencional/datos/estacion/${idEstacion}`);
  }

  /**
   * Avisos en vigor para una zona.
   */
  async function getAvisos() {
    return fetchAemet('/avisos_cap/ultimoelaborado/area/ES');
  }

  /**
   * Valores climatológicos del mes en curso para una estación.
   * Huelva: 5960
   */
  async function getClimatologiaMensual(idEstacion = '5960') {
    const hoy = new Date();
    const anyo = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const ini = `${anyo}-${mes}-01T00:00:00UTC`;
    const fin = `${anyo}-${mes}-${String(hoy.getDate()).padStart(2,'0')}T23:59:59UTC`;
    return fetchAemet(`/valores/climatologicos/diarios/datos/fechaini/${encodeURIComponent(ini)}/fechafin/${encodeURIComponent(fin)}/estacion/${idEstacion}`);
  }

  /**
   * Retorna el icono SVG según el código de estado del cielo AEMET.
   * Códigos: https://www.aemet.es/es/eltiempo/prediccion/estados_cielo
   */
  function iconoCielo(codigo) {
    const c = String(codigo).replace(/[nN]$/, ''); // quitar sufijo nocturno
    const mapa = {
      '11': '☀️', '12': '🌤', '13': '⛅', '14': '🌥', '15': '☁️', '16': '☁️', '17': '☁️',
      '23': '🌦', '24': '🌧', '25': '🌧', '26': '🌧', '33': '⛈', '34': '⛈', '35': '⛈', '36': '⛈',
      '43': '🌨', '44': '🌨', '45': '❄️', '46': '❄️', '51': '🌫', '52': '🌫', '53': '🌫', '54': '🌫',
      '61': '🌧', '62': '⛈', '63': '🌧', '64': '🌧', '71': '🌨', '72': '🌨', '73': '❄️', '74': '❄️',
      '81': '⛈', '82': '⛈', '83': '⛈',
    };
    return mapa[c] || '🌤';
  }

  /**
   * Nombre legible del estado del cielo.
   */
  function nombreCielo(codigo) {
    const c = String(codigo).replace(/[nN]$/, '');
    const mapa = {
      '11': 'Despejado', '12': 'Poco nuboso', '13': 'Intervalos nubosos', '14': 'Nuboso',
      '15': 'Muy nuboso', '16': 'Cubierto', '17': 'Nubes altas',
      '23': 'Intervalos nubosos con lluvia', '24': 'Nuboso con lluvia', '25': 'Muy nuboso con lluvia', '26': 'Cubierto con lluvia',
      '33': 'Intervalos nubosos con nieve', '34': 'Nuboso con nieve', '35': 'Muy nuboso con nieve', '36': 'Cubierto con nieve',
      '43': 'Intervalos nubosos con lluvia y nieve', '44': 'Nuboso con lluvia y nieve',
      '51': 'Niebla', '52': 'Niebla', '53': 'Calima', '54': 'Calima',
      '61': 'Lluvia débil', '62': 'Tormenta', '63': 'Chubascos', '64': 'Chubascos fuertes',
      '71': 'Nevadas débiles', '72': 'Nevadas', '73': 'Nieve', '74': 'Ventisca',
      '81': 'Tormenta', '82': 'Tormenta fuerte', '83': 'Tormenta muy fuerte',
    };
    return mapa[c] || 'Variable';
  }

  /**
   * Mapa de nombres de provincia AEMET → nombre corto para el mapa.
   */
  const PROV_MAP = {
    'ALMERÍA': 'Almería', 'CÁDIZ': 'Cádiz', 'CÓRDOBA': 'Córdoba', 'GRANADA': 'Granada',
    'HUELVA': 'Huelva', 'JAÉN': 'Jaén', 'MÁLAGA': 'Málaga', 'SEVILLA': 'Sevilla',
    'BADAJOZ': 'Badajoz', 'CÁCERES': 'Cáceres', 'CIUDAD REAL': 'Ciudad Real',
    'CUENCA': 'Cuenca', 'GUADALAJARA': 'Guadalajara', 'TOLEDO': 'Toledo',
    'ALBACETE': 'Albacete', 'MURCIA': 'Murcia', 'ALICANTE': 'Alicante',
    'CASTELLÓN': 'Castellón', 'VALENCIA': 'Valencia', 'BARCELONA': 'Barcelona',
    'GIRONA': 'Girona', 'LLEIDA': 'Lleida', 'TARRAGONA': 'Tarragona',
    'HUESCA': 'Huesca', 'TERUEL': 'Teruel', 'ZARAGOZA': 'Zaragoza',
    'ÁLAVA': 'Álava', 'GUIPÚZCOA': 'Gipuzkoa', 'VIZCAYA': 'Bizkaia',
    'BURGOS': 'Burgos', 'LEÓN': 'León', 'PALENCIA': 'Palencia',
    'SALAMANCA': 'Salamanca', 'SEGOVIA': 'Segovia', 'SORIA': 'Soria',
    'VALLADOLID': 'Valladolid', 'ZAMORA': 'Zamora', 'ÁVILA': 'Ávila',
    'MADRID': 'Madrid', 'A CORUÑA': 'A Coruña', 'LUGO': 'Lugo',
    'OURENSE': 'Ourense', 'PONTEVEDRA': 'Pontevedra', 'ASTURIAS': 'Asturias',
    'CANTABRIA': 'Cantabria', 'NAVARRA': 'Navarra', 'LA RIOJA': 'La Rioja',
    'LAS PALMAS': 'Las Palmas', 'S.C. DE TENERIFE': 'Santa Cruz de Tenerife',
    'ILLES BALEARS': 'Illes Balears',
  };

  return {
    getPrediccionDiaria,
    getObservacionTodas,
    getObservacionEstacion,
    getAvisos,
    getClimatologiaMensual,
    iconoCielo,
    nombreCielo,
    PROV_MAP,
    CARTAYA_ID,
  };
})();
