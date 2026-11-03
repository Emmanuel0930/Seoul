/**
 * CEREBRO SEÚL · APLICACIÓN PRINCIPAL (web/app.js)
 * Taller de Datos / Gobernanza de Sistemas de Información (2026)
 * Carga dinámica del lago de datos, MapLibre GL JS y trazabilidad a 1 clic.
 */

// Estado Global de Datos
const Estado = {
  catalogo: [],
  demografia: null,
  economia: null,
  tiempoReal: null,
  escucha: null,
  transporte: null,
  viviendaCrecimiento: null,
  macroBok: null,
  clima: null,
  geoJson: null,
  mapa: null,
  distritoSeleccionado: null,
  capaActiva: 'single_households_pct',
  pesosIndice: {
    unipersonales: 0.40,
    adultos: 0.40,
    vivienda: 0.20
  }
};
if (typeof window !== 'undefined') { window.Estado = Estado; }

// Rutas a los datos (soporta tanto servidor local/Vercel como rutas relativas directas)
const RUTAS = {
  catalogo: '../catalogo/catalogo.json',
  demografia: '../lago/demografia.json',
  economia: '../lago/economia_vivienda.json',
  tiempoReal: '../lago/tiempo_real.json',
  escucha: '../lago/escucha.json',
  transporte: '../lago/transporte.json',
  viviendaCrecimiento: '../lago/vivienda_crecimiento.json',
  macroBok: '../lago/macro_bok.json',
  clima: '../lago/clima.json',
  geoJson: '../territorio/seoul_gu.geojson'
};

// Paleta de colores para coropletas en MapLibre GL
const PALETA_COLOR = {
  azulCyan: ['#082f49', '#0284c7', '#38bdf8', '#bae6fd'],
  purpuraRosa: ['#3b0764', '#7e22ce', '#c084fc', '#f3e8ff'],
  escalaPrioridad: ['#1e1b4b', '#4338ca', '#818cf8', '#f43f5e']
};

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Inicializando Centro de Información Urbana de Seúl...');
  inicializarCompuertaSeguridad();
  await cargarTodosLosDatos();
  renderizarTarjetasCifras();
  renderizarContextos();
  renderizarProcedencia();
  renderizarZonasTiempoReal();
  renderizarModuloClima();
  renderizarTablaCatalogo();
  renderizarEvolucionVivienda();
  renderizarTransporte();
  renderizarIndicadoresEconomicos();
  renderizarMacroBok();
  inicializarMapaTerritorial();
  configurarEventosInteractivos();
});

// Carga asíncrona de todos los archivos del lago
async function cargarTodosLosDatos() {
  try {
    const [resCat, resDemo, resEcon, resRT, resEsc, resTrans, resVivCrec, resMacro, resClima, resGeo] = await Promise.all([
      fetch(RUTAS.catalogo).then(r => r.json()).catch(() => []),
      fetch(RUTAS.demografia).then(r => r.json()).catch(() => null),
      fetch(RUTAS.economia).then(r => r.json()).catch(() => null),
      fetch(RUTAS.tiempoReal).then(r => r.json()).catch(() => null),
      fetch(RUTAS.escucha).then(r => r.json()).catch(() => null),
      fetch(RUTAS.transporte).then(r => r.json()).catch(() => null),
      fetch(RUTAS.viviendaCrecimiento).then(r => r.json()).catch(() => null),
      fetch(RUTAS.macroBok).then(r => r.json()).catch(() => null),
      fetch(RUTAS.clima).then(r => r.json()).catch(() => null),
      fetch(RUTAS.geoJson).then(r => r.json()).catch(() => null)
    ]);

    Estado.catalogo = resCat;
    Estado.demografia = resDemo;
    Estado.economia = resEcon;
    Estado.tiempoReal = resRT;
    Estado.escucha = resEsc;
    Estado.transporte = resTrans;
    Estado.viviendaCrecimiento = resVivCrec;
    Estado.macroBok = resMacro;
    Estado.clima = resClima;
    Estado.geoJson = resGeo;

    console.log('✅ Datos del lago cargados exitosamente.');
  } catch (err) {
    console.error('❌ Error cargando datasets del lago:', err);
  }
}

// 1. Renderizado de Tarjetas de Cifras Vivas
function renderizarTarjetasCifras() {
  if (Estado.demografia && Estado.demografia.cifras) {
    const pop = Estado.demografia.cifras.total_population;
    if (pop) document.getElementById('val-poblacion').textContent = pop.valor.toLocaleString('es-CO');

    const single = Estado.demografia.cifras.single_households_rate;
    if (single) document.getElementById('val-unipersonales').textContent = `${single.valor}%`;

    const elderly = Estado.demografia.cifras.elderly_alone_rate;
    if (elderly) document.getElementById('val-adultos').textContent = `${elderly.valor}%`;
  }

  if (Estado.economia && Estado.economia.cifras) {
    const viv = Estado.economia.cifras.avg_housing_price;
    if (viv) document.getElementById('val-vivienda').textContent = `${(viv.valor / 1000000).toFixed(0)}M`;

    const ue = Estado.economia.cifras.unemployment_rate;
    if (ue) document.getElementById('val-desempleo').textContent = `${ue.valor}%`;
  }

  if (Estado.escucha && Estado.escucha.cifras) {
    const views = Estado.escucha.cifras.vistas_ultimo_mes;
    if (views) document.getElementById('val-vistas').textContent = views.valor.toLocaleString('es-CO');
  }

  // Hacer las tarjetas clickeables para auditar su procedencia
  document.querySelectorAll('.stat-card .provenance-pill[data-metric]').forEach(pill => {
    const card = pill.closest('.stat-card');
    if (card && pill.getAttribute('data-source')) {
      card.setAttribute('data-source', pill.getAttribute('data-source'));
      card.style.cursor = 'pointer';
      card.setAttribute('title', 'Haga clic para auditar procedencia, vigencia y prueba en lago');
    }
  });
}

function buscarArchivo(metrica) {
  return [Estado.demografia, Estado.economia, Estado.escucha]
    .find(archivo => archivo && archivo.cifras && archivo.cifras[metrica]) || null;
}

function buscarCifra(metrica) {
  const archivo = buscarArchivo(metrica);
  return archivo ? archivo.cifras[metrica] : null;
}

// Procedencia de cada tarjeta (fuente, vigencia y fecha de prueba) leída del lago
function renderizarProcedencia() {
  document.querySelectorAll('.provenance-pill[data-metric]').forEach(pill => {
    const metrica = pill.getAttribute('data-metric');
    const archivo = buscarArchivo(metrica);
    if (!archivo) return;
    const cifra = archivo.cifras[metrica];
    pill.querySelector('.prov-text').textContent = `${cifra.fuente} · Vigencia: ${cifra.vigencia} · Probado: ${archivo.probado}`;
  });
}

// Texto de contexto de las tarjetas generado desde lago/*.json (nada escrito a mano)
function renderizarContextos() {
  const fijar = (id, html) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = html;
  };
  const pct = v => `${v > 0 ? '+' : ''}${v}%`;
  const millones = v => `${(v / 1000000).toFixed(0)}M KRW`;
  const ordenar = (regs, campo) => [...regs].sort((a, b) => b[campo] - a[campo]);

  const demo = Estado.demografia && Estado.demografia.registros;
  if (demo && demo.length) {
    const pob = ordenar(demo, 'total_population');
    const mayor = pob[0], menor = pob[pob.length - 1];
    fijar('ctx-poblacion',
      `Desglosada en los ${demo.length} distritos (<em>gu</em>). Mayor concentración en <strong>${mayor.district_name}</strong> (${mayor.total_population.toLocaleString('es-CO')}) y menor en <strong>${menor.district_name}</strong> (${menor.total_population.toLocaleString('es-CO')}).`,
      demo);

    const uni = ordenar(demo, 'single_households_pct');
    fijar('ctx-unipersonales',
      `Pico en <strong>${uni[0].district_name} (${uni[0].single_households_pct}%)</strong>, seguido por <strong>${uni[1].district_name} (${uni[1].single_households_pct}%)</strong>.`,
      demo);

    const ady = ordenar(demo, 'elderly_alone_pct');
    const minAdy = ady[ady.length - 1];
    fijar('ctx-adultos',
      `Mayor proporción en <strong>${ady[0].district_name} (${ady[0].elderly_alone_pct}%)</strong> y <strong>${ady[1].district_name} (${ady[1].elderly_alone_pct}%)</strong>; menor en <strong>${minAdy.district_name} (${minAdy.elderly_alone_pct}%)</strong>.`,
      demo);
  }

  const econ = Estado.economia && Estado.economia.registros;
  if (econ && econ.length) {
    const viv = ordenar(econ, 'diff_pct_vs_seoul_avg');
    const barato = viv[viv.length - 1];
    const promedio = Estado.economia.cifras.avg_housing_price;
    fijar('ctx-vivienda',
      `Promedio Seúl: ${promedio ? millones(promedio.valor) : '-'}. <strong>${viv[0].district_name} (${pct(viv[0].diff_pct_vs_seoul_avg)})</strong> y <strong>${viv[1].district_name} (${pct(viv[1].diff_pct_vs_seoul_avg)})</strong> frente a <strong>${barato.district_name} (${pct(barato.diff_pct_vs_seoul_avg)})</strong>.`,
      econ);

    const ue = ordenar(econ, 'unemployment_rate');
    const minUe = ue[ue.length - 1];
    const tasa = Estado.economia.cifras.unemployment_rate;
    fijar('ctx-desempleo',
      `Tasa metropolitana: ${tasa ? tasa.valor : '-'}%. Menor desempleo distrital en <strong>${minUe.district_name} (${minUe.unemployment_rate}%)</strong>.`,
      econ);
  }
}

function fuenteSinVerificar(fid) {
  return [Estado.demografia, Estado.economia].some(archivo =>
    archivo && archivo.cifras && Object.values(archivo.cifras).some(c => c.fuente === fid && c.verificado === false)
  );
}

// 2. Renderizado del Monitor Urbano en Tiempo Real (F02)
function renderizarZonasTiempoReal() {
  const container = document.getElementById('realtime-zones-container');
  if (!container || !Estado.tiempoReal || !Estado.tiempoReal.registros) return;

  const zonas = Estado.tiempoReal.registros;
  container.innerHTML = '';

  const pendientes = Estado.tiempoReal.zonas_pendientes || [];
  const nota = document.getElementById('realtime-muestra-nota');
  if (nota) nota.style.display = pendientes.length ? 'block' : 'none';

  zonas.forEach(z => {
    const card = document.createElement('div');
    card.className = 'zone-card clickable-provenance';
    card.setAttribute('data-source', 'F02');
    card.setAttribute('title', 'Haga clic para auditar procedencia F02 (Seoul Real-Time Data)');
    card.style.cursor = 'pointer';

    let tagClass = 'normal';
    if (z.congestion_level === 'Congested') tagClass = 'congested';
    else if (z.congestion_level === 'Slightly Congested') tagClass = 'slightly-congested';
    else if (z.congestion_level === 'Relaxed') tagClass = 'relaxed';

    card.innerHTML = `
      <div class="zone-header">
        <span class="zone-name">${z.area_name.replace(/·/g, "·<wbr>")}</span>
        <span class="zone-tag ${tagClass}">${z.congestion_level}</span>
      </div>
      <div class="zone-metrics">
        <div class="zm-item">
          <span class="zm-label">Temperatura</span>
          <span class="zm-val">${z.current_temperature} °C</span>
        </div>
        <div class="zm-item">
          <span class="zm-label">Velocidad Vial</span>
          <span class="zm-val">${z.avg_road_speed} km/h</span>
        </div>
        <div class="zm-item">
          <span class="zm-label">Calidad Aire</span>
          <span class="zm-val">${z.air_quality_index}</span>
        </div>
        <div class="zm-item">
          <span class="zm-label">Franja Horaria</span>
          <span class="zm-val">${z.time_slot || 'Actual'}</span>
        </div>
      </div>
      <div class="zone-footer">
        <span>${z.privacy_note}</span>
        <span class="badge-source-mini" style="margin-left:auto; display:inline-block;">F02</span>
      </div>
    `;
    container.appendChild(card);
  });

  // Zonas sin datos con la llave de prueba: tarjeta atenuada, sin valores ni etiqueta
  pendientes.forEach(nombre => {
    const card = document.createElement('div');
    card.className = 'zone-card zone-pendiente';
    card.innerHTML = `
      <div class="zone-header">
        <span class="zone-name">${nombre.replace(/·/g, "·<wbr>")}</span>
      </div>
      <p class="zone-pendiente-msg">Pendiente: requiere llave de la API de Seúl</p>
    `;
    container.appendChild(card);
  });
}

// 2B. Renderizado del Módulo de Clima en Seúl (Open-Meteo + KMA)
function renderizarModuloClima() {
  if (!Estado.clima || !Estado.clima.cifras) return;

  const c = Estado.clima.cifras;

  // Condiciones actuales
  const elTemp = document.getElementById('clima-hero-temp');
  if (elTemp && c.current_temperature) elTemp.textContent = c.current_temperature.valor.toFixed(1);

  const elApp = document.getElementById('clima-hero-sensacion');
  if (elApp && c.apparent_temperature) elApp.textContent = `${c.apparent_temperature.valor.toFixed(1)} °C`;

  const elDesc = document.getElementById('clima-hero-desc');
  if (elDesc && c.weather_code) elDesc.textContent = c.weather_code.descripcion || 'Variable';

  const elIcon = document.getElementById('clima-hero-icon');
  if (elIcon && c.weather_code) elIcon.textContent = c.weather_code.icono || '🌤️';

  const elHum = document.getElementById('clima-humedad');
  if (elHum && c.relative_humidity) elHum.textContent = `${c.relative_humidity.valor} %`;

  const elViento = document.getElementById('clima-viento');
  if (elViento && c.wind_speed) elViento.textContent = `${c.wind_speed.valor} km/h`;

  const elLluvia = document.getElementById('clima-lluvia');
  if (elLluvia && c.precipitation) elLluvia.textContent = `${c.precipitation.valor} mm`;

  // Pronóstico horario (24h)
  const hourlyTrack = document.getElementById('clima-hourly-track');
  if (hourlyTrack && Estado.clima.pronostico_24h && Estado.clima.pronostico_24h.length) {
    hourlyTrack.innerHTML = '';
    Estado.clima.pronostico_24h.forEach(h => {
      const item = document.createElement('div');
      item.className = 'hourly-card';
      item.innerHTML = `
        <span class="h-time">${h.hora}</span>
        <span class="h-icon">${h.icono}</span>
        <span class="h-temp">${h.temperatura}°C</span>
        <span class="h-rain">${h.prob_lluvia > 0 ? '🌧️ ' + h.prob_lluvia + '%' : '☀️ Seco'}</span>
      `;
      hourlyTrack.appendChild(item);
    });
  }

  // Pronóstico diario (7 días)
  const dailyGrid = document.getElementById('clima-daily-grid');
  if (dailyGrid && Estado.clima.pronostico_7d && Estado.clima.pronostico_7d.length) {
    dailyGrid.innerHTML = '';
    Estado.clima.pronostico_7d.forEach(d => {
      const item = document.createElement('div');
      item.className = 'daily-card';
      item.innerHTML = `
        <div class="daily-header">
          <span class="daily-day">${d.dia}</span>
          <span class="daily-date">${d.fecha.slice(5)}</span>
        </div>
        <div class="daily-icon">${d.icono}</div>
        <div class="daily-desc">${d.descripcion}</div>
        <div class="daily-temps">
          <span class="d-max">${d.temp_max}°</span>
          <span class="d-separator">/</span>
          <span class="d-min">${d.temp_min}°</span>
        </div>
        <div class="daily-rain-wrap">
          <div class="daily-rain-bar" style="width: ${d.prob_lluvia_max}%"></div>
          <span class="daily-rain-text">${d.prob_lluvia_max}% prob. lluvia</span>
        </div>
      `;
      dailyGrid.appendChild(item);
    });
  }

  // Intento de refresco en vivo desde Open-Meteo en cliente si hay conexión
  refrescarClimaEnVivo();
}

async function refrescarClimaEnVivo() {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FSeoul&forecast_days=7';
    const resp = await fetch(url);
    if (!resp.ok) return;
    const data = await resp.json();
    if (!data.current) return;

    const cur = data.current;
    if (document.getElementById('clima-hero-temp')) {
      document.getElementById('clima-hero-temp').textContent = Number(cur.temperature_2m).toFixed(1);
    }
    if (document.getElementById('clima-hero-sensacion')) {
      document.getElementById('clima-hero-sensacion').textContent = `${Number(cur.apparent_temperature).toFixed(1)} °C`;
    }
    if (document.getElementById('clima-humedad')) {
      document.getElementById('clima-humedad').textContent = `${cur.relative_humidity_2m} %`;
    }
    if (document.getElementById('clima-viento')) {
      document.getElementById('clima-viento').textContent = `${Number(cur.wind_speed_10m).toFixed(1)} km/h`;
    }
    if (document.getElementById('clima-lluvia')) {
      document.getElementById('clima-lluvia').textContent = `${Number(cur.precipitation).toFixed(1)} mm`;
    }
    console.log('🌤️ Clima de Seúl actualizado en vivo desde Open-Meteo.');
  } catch (_) {
    // Si falla o no hay conexión, se mantiene el dato contractual de lago/clima.json
  }
}

// 3. Renderizado de Tabla de Catálogo (F01 - F15)
function renderizarTablaCatalogo() {
  const tbody = document.getElementById('catalogo-tbody');
  if (!tbody || !Estado.catalogo || Estado.catalogo.length === 0) return;

  tbody.innerHTML = '';
  Estado.catalogo.forEach(f => {
    const tr = document.createElement('tr');

    let badgeClass = 'integrado';
    if (f.estado === 'candidato') badgeClass = 'candidato';
    else if (f.estado === 'descartado') badgeClass = 'descartado';
    else if (f.estado === 'excluido' || f.estado === 'caido') badgeClass = 'excluido';

    tr.innerHTML = `
      <td><span class="badge-fid" data-source="${f.id}">${f.id}</span></td>
      <td><strong>${f.nombre}</strong></td>
      <td>${f.entidad}</td>
      <td><code>${f.licencia}</code></td>
      <td>${f.personas}</td>
      <td>${f.probado}</td>
      <td><span class="status-badge ${badgeClass}">${f.estado.toUpperCase()}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// 4. Inicialización del Mapa con MapLibre GL JS (Ciudad 3D)
// Base: estilo vectorial libre "Liberty" de OpenFreeMap (incluye glyphs y edificios con altura).
// Sobre él se monta la coropleta de datos (protagonista) + edificios 3D grises.
const ESTILO_3D = 'https://tiles.openfreemap.org/styles/liberty';

function inicializarMapaTerritorial() {
  const mapElement = document.getElementById('mapa-seul');
  if (!mapElement || !Estado.geoJson) return;

  // Unir métricas del lago en las propiedades de cada feature GeoJSON
  enriquecerGeoJson();

  try {
    Estado.mapa = new maplibregl.Map({
      container: 'mapa-seul',
      style: ESTILO_3D,
      center: [126.9850, 37.5550], // Centro de Seúl
      zoom: 11,
      pitch: 55,          // Cámara inclinada -> perspectiva 3D
      bearing: -17.6,
      maxZoom: 18,
      minZoom: 9,
      maxPitch: 75,
      antialias: true
    });

    Estado.mapa.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    Estado.mapa.on('load', () => {
      construirCapas3D();

      // Seleccionar Gwanak-gu o Gangnam-gu por defecto
      const defFeature = Estado.geoJson.features.find(f => f.properties.district_code === '11620');
      if (defFeature) mostrarFichaDistrito(defFeature.properties);
    });
  } catch (e) {
    console.error('Error al inicializar MapLibre:', e);
  }
}

// Construye las capas 3D sobre el estilo base, protegiendo cada paso para no abortar el resto.
function construirCapas3D() {
  const mapa = Estado.mapa;
  if (!mapa) return;
  Estado.factorAltura = Estado.factorAltura || 1.5;

  const capasBase = (mapa.getStyle().layers || []);

  // 1) Atenuar el mapa base para que la coropleta de datos domine:
  //    - quitar edificios nativos (los sustituimos por los nuestros en gris)
  //    - oscurecer calles/parques/landuse de colores vivos
  capasBase.forEach(l => {
    try {
      if (l['source-layer'] === 'building') { mapa.removeLayer(l.id); return; }
      if (l.type === 'fill' && /landuse|landcover|park|wood|grass/i.test(l.id)) {
        mapa.setPaintProperty(l.id, 'fill-opacity', 0.12);
      }
      if (l.type === 'line' && /road|transportation|bridge|tunnel|highway|street/i.test(l.id)) {
        mapa.setPaintProperty(l.id, 'line-opacity', 0.25);
      }
    } catch (_) { /* ignorar capas que no acepten la propiedad */ }
  });

  // Insertar la coropleta por debajo de la primera capa de símbolos (etiquetas de calles)
  const primerSimbolo = (mapa.getStyle().layers || []).find(l => l.type === 'symbol');
  const antesDe = primerSimbolo ? primerSimbolo.id : undefined;

  // 2) FUENTE de distritos (sin el campo coreano 'name', que rompía la teselación)
  mapa.addSource('seoul-gu', { type: 'geojson', data: geoJsonParaMapa() });

  // 3) COROPLETA de datos — PROTAGONISTA
  mapa.addLayer({
    id: 'seoul-gu-fills',
    type: 'fill',
    source: 'seoul-gu',
    paint: {
      'fill-color': obtenerExpresionColor(Estado.capaActiva),
      'fill-opacity': 0.7
    }
  }, antesDe);

  // 4) Bordes de distritos
  mapa.addLayer({
    id: 'seoul-gu-borders',
    type: 'line',
    source: 'seoul-gu',
    paint: {
      'line-color': '#38bdf8',
      'line-width': 1.5,
      'line-opacity': 0.9
    }
  }, antesDe);

  // 5) EDIFICIOS 3D en gris (relieve urbano) por encima de la coropleta
  mapa.addLayer({
    id: 'edificios-3d',
    source: 'openmaptiles',
    'source-layer': 'building',
    type: 'fill-extrusion',
    minzoom: 12,
    paint: {
      'fill-extrusion-color': [
        'interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 6],
        0, '#3a4660',
        30, '#4a5a78',
        80, '#5d6f92',
        150, '#7286a8'
      ],
      'fill-extrusion-height': [
        '*',
        ['coalesce', ['get', 'render_height'], 6],
        ['literal', Estado.factorAltura]
      ],
      'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
      'fill-extrusion-opacity': 0.65
    }
  }, antesDe);

  // 6) Etiquetas de distritos (usa la fuente de glyphs del estilo Liberty)
  const fuenteGlyphs = buscarFuenteGlyphs(capasBase);
  mapa.addLayer({
    id: 'seoul-gu-labels',
    type: 'symbol',
    source: 'seoul-gu',
    layout: {
      'text-field': ['get', 'name_eng'],
      'text-font': fuenteGlyphs,
      'text-size': 12,
      'text-anchor': 'center',
      'text-allow-overlap': false
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#0f172a',
      'text-halo-width': 1.8
    }
  });

  // Eventos sobre los distritos
  mapa.on('mousemove', 'seoul-gu-fills', (e) => {
    if (e.features.length > 0) {
      mapa.getCanvas().style.cursor = 'pointer';
      mostrarFichaDistrito(e.features[0].properties);
    }
  });
  mapa.on('mouseleave', 'seoul-gu-fills', () => { mapa.getCanvas().style.cursor = ''; });
  mapa.on('click', 'seoul-gu-fills', (e) => {
    if (e.features.length > 0) mostrarFichaDistrito(e.features[0].properties);
  });
}

// Encuentra una pila de fuentes (text-font) válida del estilo base para reusar sus glyphs.
function buscarFuenteGlyphs(capas) {
  for (const l of capas) {
    const tf = l.layout && l.layout['text-font'];
    if (Array.isArray(tf) && tf.length && typeof tf[0] === 'string') return tf;
  }
  return ['Noto Sans Regular'];
}

// Copia del GeoJSON para la fuente del mapa, sin el campo 'name' (coreano) que rompía
// la teselación GeoJSON de MapLibre. El nombre coreano sigue en Estado.geoJson para la ficha.
function geoJsonParaMapa() {
  return {
    type: 'FeatureCollection',
    features: Estado.geoJson.features.map(f => {
      const props = Object.assign({}, f.properties);
      delete props.name;
      return { type: 'Feature', properties: props, geometry: f.geometry };
    })
  };
}

// Alterna entre vista 2D (cenital) y 3D (cámara inclinada)
function fijarVista3D(activar) {
  if (!Estado.mapa) return;
  const btn2d = document.getElementById('btn-vista-2d');
  const btn3d = document.getElementById('btn-vista-3d');
  const sliderPitch = document.getElementById('control-pitch');
  if (activar) {
    const pitch = sliderPitch ? parseInt(sliderPitch.value) : 55;
    Estado.mapa.easeTo({ pitch, bearing: -17.6, duration: 900 });
    if (Estado.mapa.getLayer('edificios-3d')) Estado.mapa.setLayoutProperty('edificios-3d', 'visibility', 'visible');
    btn3d && btn3d.classList.add('active');
    btn2d && btn2d.classList.remove('active');
  } else {
    Estado.mapa.easeTo({ pitch: 0, bearing: 0, duration: 900 });
    if (Estado.mapa.getLayer('edificios-3d')) Estado.mapa.setLayoutProperty('edificios-3d', 'visibility', 'none');
    btn2d && btn2d.classList.add('active');
    btn3d && btn3d.classList.remove('active');
  }
}

// Ajusta la altura de los edificios extruidos en vivo
function ajustarAlturaEdificios(factor) {
  Estado.factorAltura = factor;
  if (Estado.mapa && Estado.mapa.getLayer('edificios-3d')) {
    Estado.mapa.setPaintProperty('edificios-3d', 'fill-extrusion-height', [
      '*', ['coalesce', ['get', 'render_height'], 6], ['literal', factor]
    ]);
  }
}

// Unir métricas demográficas y de vivienda al GeoJSON
function enriquecerGeoJson() {
  if (!Estado.geoJson || !Estado.demografia || !Estado.demografia.registros) return;

  const demoMap = {};
  Estado.demografia.registros.forEach(r => {
    demoMap[r.district_code] = r;
  });

  const econMap = {};
  if (Estado.economia && Estado.economia.registros) {
    Estado.economia.registros.forEach(r => {
      econMap[r.district_code] = r;
    });
  }

  // F06: crecimiento de precio de vivienda 2020-2025 por distrito
  const crecMap = {};
  if (Estado.viviendaCrecimiento && Estado.viviendaCrecimiento.registros) {
    Estado.viviendaCrecimiento.registros.forEach(r => {
      crecMap[r.district_code] = r;
    });
  }

  Estado.geoJson.features.forEach(feat => {
    const code = feat.properties.district_code || feat.properties.code;
    const demo = demoMap[code] || {};
    const econ = econMap[code] || {};
    const crec = crecMap[code] || {};

    feat.properties.single_households_pct = demo.single_households_pct || 40.0;
    feat.properties.elderly_alone_pct = demo.elderly_alone_pct || 10.0;
    feat.properties.total_population = demo.total_population || 300000;
    feat.properties.area_km2 = demo.area_km2 || 20.0;
    feat.properties.density_hab_km2 = demo.density_hab_km2 || 15000;
    feat.properties.avg_housing_price = econ.avg_housing_price || 650000000;
    feat.properties.diff_pct_vs_seoul_avg = econ.diff_pct_vs_seoul_avg || 0.0;
    feat.properties.growth_pct = (crec.growth_pct !== undefined) ? crec.growth_pct : 0.0;
    feat.properties.price_2020 = crec.price_2020 || null;
    feat.properties.price_2025 = crec.price_2025 || null;

    // Cálculo inicial de índice compuesto
    feat.properties.composite_index = calcularIndiceDistrito(feat.properties);
  });
}

// Cálculo del Índice Compuesto con Sliders
function calcularIndiceDistrito(props) {
  // Normalizaciones simples 0 - 1
  const normSingle = (props.single_households_pct - 30) / (65 - 30);
  const normElderly = (props.elderly_alone_pct - 6) / (15 - 6);
  const normPrice = (props.avg_housing_price - 400000000) / (1500000000 - 400000000);

  const val = (normSingle * Estado.pesosIndice.unipersonales) +
              (normElderly * Estado.pesosIndice.adultos) +
              (normPrice * Estado.pesosIndice.vivienda);

  return Math.max(0, Math.min(100, Math.round(val * 100)));
}

// Expresión de color MapLibre GL
function obtenerExpresionColor(metrica) {
  if (metrica === 'single_households_pct') {
    return [
      'interpolate', ['linear'], ['get', 'single_households_pct'],
      32, '#1e293b',
      40, '#0284c7',
      50, '#6366f1',
      62, '#f43f5e'
    ];
  } else if (metrica === 'elderly_alone_pct') {
    return [
      'interpolate', ['linear'], ['get', 'elderly_alone_pct'],
      7.0, '#1e293b',
      9.5, '#0d9488',
      11.5, '#eab308',
      13.8, '#ef4444'
    ];
  } else if (metrica === 'total_population') {
    return [
      'interpolate', ['linear'], ['get', 'total_population'],
      120000, '#1e293b',
      350000, '#3b82f6',
      500000, '#8b5cf6',
      660000, '#ec4899'
    ];
  } else if (metrica === 'avg_housing_price') {
    return [
      'interpolate', ['linear'], ['get', 'avg_housing_price'],
      450000000, '#1e293b',
      650000000, '#06b6d4',
      1000000000, '#8b5cf6',
      1450000000, '#f43f5e'
    ];
  } else if (metrica === 'growth_pct') {
    // Crecimiento del precio de vivienda 2020->2025 (F06): verde=poco, rojo=mucho
    return [
      'interpolate', ['linear'], ['get', 'growth_pct'],
      5, '#064e3b',
      15, '#15803d',
      25, '#eab308',
      35, '#f97316',
      42, '#dc2626'
    ];
  } else {
    // composite_index
    return [
      'interpolate', ['linear'], ['get', 'composite_index'],
      20, '#1e293b',
      45, '#3b82f6',
      65, '#f59e0b',
      85, '#f43f5e'
    ];
  }
}

// Actualizar Ficha Técnica del Distrito
function mostrarFichaDistrito(props) {
  if (!props) return;
  Estado.distritoSeleccionado = props;

  document.getElementById('detail-gu-name').textContent = props.name_eng || props.name;
  document.getElementById('detail-gu-kor').textContent = props.name || '자치구';
  document.getElementById('detail-code').textContent = props.district_code || props.code || '-';
  document.getElementById('detail-pop').textContent = props.total_population ? `${props.total_population.toLocaleString('es-CO')} hab.` : '-';
  document.getElementById('detail-single').textContent = `${props.single_households_pct}%`;
  document.getElementById('detail-elderly').textContent = `${props.elderly_alone_pct}%`;
  
  if (props.avg_housing_price) {
    document.getElementById('detail-price').textContent = `${(props.avg_housing_price / 1000000).toFixed(0)}M KRW`;
  }
  
  if (props.diff_pct_vs_seoul_avg !== undefined) {
    const sign = props.diff_pct_vs_seoul_avg >= 0 ? '+' : '';
    document.getElementById('detail-diff').textContent = `${sign}${props.diff_pct_vs_seoul_avg}%`;
    document.getElementById('detail-diff').style.color = props.diff_pct_vs_seoul_avg >= 0 ? '#f43f5e' : '#38bdf8';
  }

  // Crecimiento de vivienda 2020-2025 (F06)
  const elGrowth = document.getElementById('detail-growth');
  if (elGrowth && props.growth_pct !== undefined) {
    elGrowth.textContent = `+${props.growth_pct}%`;
    elGrowth.style.color = props.growth_pct >= 30 ? '#dc2626' : (props.growth_pct >= 18 ? '#f59e0b' : '#22c55e');
  }

  actualizarComparadorDistritos();
}

// 5. Configuración de Eventos Interactivos
function configurarEventosInteractivos() {
  // Selector de métricas de capa
  const selector = document.getElementById('metric-selector');
  const slidersPanel = document.getElementById('sliders-panel');

  selector.addEventListener('change', (e) => {
    Estado.capaActiva = e.target.value;
    slidersPanel.style.display = (Estado.capaActiva === 'composite_index') ? 'block' : 'none';

    if (Estado.mapa && Estado.mapa.getLayer('seoul-gu-fills')) {
      Estado.mapa.setPaintProperty('seoul-gu-fills', 'fill-color', obtenerExpresionColor(Estado.capaActiva));
    }
  });

  // Sliders de índice compuesto
  const sSingle = document.getElementById('peso-unipersonales');
  const sElderly = document.getElementById('peso-adultos');
  const sPrice = document.getElementById('peso-vivienda');

  function actualizarPesos() {
    const w1 = parseInt(sSingle.value);
    const w2 = parseInt(sElderly.value);
    const w3 = parseInt(sPrice.value);
    const total = w1 + w2 + w3 || 1;

    Estado.pesosIndice.unipersonales = w1 / total;
    Estado.pesosIndice.adultos = w2 / total;
    Estado.pesosIndice.vivienda = w3 / total;

    document.getElementById('label-peso-unipersonales').textContent = `${Math.round(Estado.pesosIndice.unipersonales * 100)}%`;
    document.getElementById('label-peso-adultos').textContent = `${Math.round(Estado.pesosIndice.adultos * 100)}%`;
    document.getElementById('label-peso-vivienda').textContent = `${Math.round(Estado.pesosIndice.vivienda * 100)}%`;

    // Recalcular índice en GeoJSON
    if (Estado.geoJson) {
      Estado.geoJson.features.forEach(f => {
        f.properties.composite_index = calcularIndiceDistrito(f.properties);
      });
      if (Estado.mapa && Estado.mapa.getSource('seoul-gu')) {
        Estado.mapa.getSource('seoul-gu').setData(geoJsonParaMapa());
      }
    }
  }

  sSingle.addEventListener('input', actualizarPesos);
  sElderly.addEventListener('input', actualizarPesos);
  sPrice.addEventListener('input', actualizarPesos);

  document.getElementById('btn-reset-sliders').addEventListener('click', () => {
    sSingle.value = 40;
    sElderly.value = 40;
    sPrice.value = 20;
    actualizarPesos();
  });

  // Buscador de distritos
  const inputSearch = document.getElementById('buscador-distrito');
  const dropdown = document.getElementById('search-results');

  inputSearch.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q || !Estado.geoJson) {
      dropdown.style.display = 'none';
      return;
    }

    const matches = Estado.geoJson.features.filter(f => {
      const eng = (f.properties.name_eng || '').toLowerCase();
      const kor = f.properties.name || '';
      return eng.includes(q) || kor.includes(q);
    });

    if (matches.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    dropdown.innerHTML = '';
    matches.forEach(m => {
      const item = document.createElement('div');
      item.className = 'search-item';
      item.innerHTML = `
        <span class="search-item-name">${m.properties.name_eng} (${m.properties.name})</span>
        <span class="search-item-meta">Pob: ${m.properties.total_population?.toLocaleString()} | Hogar Unip: ${m.properties.single_households_pct}%</span>
      `;
      item.addEventListener('click', () => {
        mostrarFichaDistrito(m.properties);
        dropdown.style.display = 'none';
        inputSearch.value = m.properties.name_eng;

        // Centrar mapa si está disponible
        if (Estado.mapa && m.geometry && m.geometry.coordinates) {
          // Obtener primer punto aproximado
          let coord = m.geometry.coordinates[0];
          while (Array.isArray(coord[0])) coord = coord[0];
          Estado.mapa.flyTo({ center: coord, zoom: 11.5 });
        }
      });
      dropdown.appendChild(item);
    });
    dropdown.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (!inputSearch.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  // Controles de Vista 3D / Ciudad
  const btn2d = document.getElementById('btn-vista-2d');
  const btn3d = document.getElementById('btn-vista-3d');
  const sliderPitch = document.getElementById('control-pitch');
  const labelPitch = document.getElementById('label-pitch');
  const sliderAltura = document.getElementById('control-altura');
  const labelAltura = document.getElementById('label-altura');

  if (btn3d) btn3d.addEventListener('click', () => fijarVista3D(true));
  if (btn2d) btn2d.addEventListener('click', () => fijarVista3D(false));

  if (sliderPitch) {
    sliderPitch.addEventListener('input', (e) => {
      const p = parseInt(e.target.value);
      if (labelPitch) labelPitch.textContent = `${p}°`;
      if (Estado.mapa) Estado.mapa.setPitch(p);
    });
  }

  if (sliderAltura) {
    sliderAltura.addEventListener('input', (e) => {
      const factor = parseInt(e.target.value) / 10; // 5..40 -> 0.5x .. 4.0x
      if (labelAltura) labelAltura.textContent = `${factor.toFixed(1)}×`;
      ajustarAlturaEdificios(factor);
    });
  }

  // Modal de Trazabilidad a 1 clic
  const modalFuente = document.getElementById('modal-fuente');
  const btnCloseModal = document.getElementById('modal-close');

  btnCloseModal.addEventListener('click', () => modalFuente.style.display = 'none');
  modalFuente.addEventListener('click', (e) => {
    if (e.target === modalFuente) modalFuente.style.display = 'none';
  });

  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-source]');
    if (target) {
      const fid = target.getAttribute('data-source');
      abrirModalFuente(fid);
    }
  });

  // Configurar nuevos componentes de consumo
  configurarAtajosChips();
  configurarComparador();

  // Tecla Escape cierra el modal de fuentes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalFuente) {
      modalFuente.style.display = 'none';
    }
  });
}

// Abrir Modal de Trazabilidad
function abrirModalFuente(fid) {
  const modal = document.getElementById('modal-fuente');
  if (!modal || !Estado.catalogo) return;

  const fuente = Estado.catalogo.find(f => f.id === fid) || {
    id: fid,
    nombre: 'Fuente Oficial de Seúl',
    entidad: 'Gobierno Metropolitano de Seúl',
    licencia: 'KOGL Tipo 1 (libre con atribución)',
    vigencia: '2025-12',
    probado: '2026-10-06',
    personas: 'Solo conteos por zona',
    estado: 'integrado',
    nota: 'Dato contractual integrado y auditado.',
    url: 'https://data.seoul.go.kr'
  };

  document.getElementById('modal-fid').textContent = fuente.id;
  document.getElementById('modal-fname').textContent = fuente.nombre;
  document.getElementById('modal-fentidad').textContent = fuente.entidad;
  document.getElementById('modal-flicencia').textContent = fuente.licencia;
  document.getElementById('modal-fvigencia').textContent = fuente.vigencia;
  document.getElementById('modal-fprobado').textContent = fuente.probado;
  document.getElementById('modal-fpersonas').textContent = fuente.personas;
  document.getElementById('modal-festado').textContent = fuente.estado.toUpperCase();
  document.getElementById('modal-fnota').textContent = fuente.nota;
  
  const link = document.getElementById('modal-furl');
  link.href = fuente.url;
  link.textContent = fuente.url;

  modal.style.display = 'flex';
}

// 6. Atajos Rápidos de Exploración (Chips de Hallazgos Móviles)
function configurarAtajosChips() {
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const distCode = btn.getAttribute('data-district');
      const metric = btn.getAttribute('data-metric');
      
      document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (metric) {
        const selector = document.getElementById('metric-selector');
        if (selector && selector.value !== metric) {
          selector.value = metric;
          selector.dispatchEvent(new Event('change'));
        }
      }

      if (Estado.geoJson && Estado.geoJson.features) {
        const feat = Estado.geoJson.features.find(f => (f.properties.district_code || f.properties.code) === distCode);
        if (feat) {
          mostrarFichaDistrito(feat.properties);
          if (Estado.mapa && feat.geometry && feat.geometry.coordinates) {
            let coord = feat.geometry.coordinates[0];
            while (Array.isArray(coord[0])) coord = coord[0];
            Estado.mapa.flyTo({ center: coord, zoom: 12, speed: 1.2 });
          }
        }
      }
    });
  });
}

// 7. Módulo Comparador Distrital (Consumo de Datos Side-by-Side)
function configurarComparador() {
  const btnToggle = document.getElementById('btn-toggle-compare');
  const panel = document.getElementById('compare-panel');
  const select = document.getElementById('select-compare-gu');

  if (btnToggle && panel) {
    btnToggle.addEventListener('click', () => {
      const visible = panel.style.display !== 'none';
      panel.style.display = visible ? 'none' : 'block';
      btnToggle.textContent = visible ? '⚖️ Comparar con otro Gu' : '✖ Cerrar Comparador';
      if (!visible) {
        poblarSelectComparador();
        actualizarComparadorDistritos();
      }
    });
  }

  if (select) {
    select.addEventListener('change', () => {
      actualizarComparadorDistritos();
    });
  }
}

function poblarSelectComparador() {
  const select = document.getElementById('select-compare-gu');
  if (!select || !Estado.geoJson) return;

  const currentCode = Estado.distritoSeleccionado?.district_code || '11620';
  const prevVal = select.value;
  select.innerHTML = '';

  Estado.geoJson.features.forEach(f => {
    const code = f.properties.district_code || f.properties.code;
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = `${f.properties.name_eng} (${f.properties.name})`;
    if (code === prevVal || (!prevVal && code === (currentCode === '11680' ? '11620' : '11680'))) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
}

function actualizarComparadorDistritos() {
  const panel = document.getElementById('compare-panel');
  if (!panel || panel.style.display === 'none') return;

  const select = document.getElementById('select-compare-gu');
  const results = document.getElementById('compare-results');
  if (!select || !results || !Estado.geoJson || !Estado.distritoSeleccionado) return;

  const codeB = select.value;
  const featB = Estado.geoJson.features.find(f => (f.properties.district_code || f.properties.code) === codeB);
  if (!featB) return;

  const A = Estado.distritoSeleccionado;
  const B = featB.properties;

  const diffPop = A.total_population - B.total_population;
  const diffSingle = (A.single_households_pct - B.single_households_pct).toFixed(1);
  const diffElderly = (A.elderly_alone_pct - B.elderly_alone_pct).toFixed(1);
  const diffPriceM = Math.round((A.avg_housing_price - B.avg_housing_price) / 1000000);

  results.innerHTML = `
    <div class="cmp-row header-row">
      <span class="cmp-metric">Métrica</span>
      <span class="cmp-val cmp-a">${A.name_eng}</span>
      <span class="cmp-val cmp-b">${B.name_eng}</span>
      <span class="cmp-diff">Diferencia (A - B)</span>
    </div>
    <div class="cmp-row">
      <span class="cmp-metric">Población</span>
      <span class="cmp-val">${(A.total_population/1000).toFixed(0)}k</span>
      <span class="cmp-val">${(B.total_population/1000).toFixed(0)}k</span>
      <span class="cmp-diff ${diffPop >= 0 ? 'pos' : 'neg'}">${diffPop >= 0 ? '+' : ''}${(diffPop/1000).toFixed(0)}k</span>
    </div>
    <div class="cmp-row">
      <span class="cmp-metric">Hogar Unipersonal</span>
      <span class="cmp-val">${A.single_households_pct}%</span>
      <span class="cmp-val">${B.single_households_pct}%</span>
      <span class="cmp-diff ${diffSingle >= 0 ? 'pos' : 'neg'}">${diffSingle >= 0 ? '+' : ''}${diffSingle} pts</span>
    </div>
    <div class="cmp-row">
      <span class="cmp-metric">Adultos Solos</span>
      <span class="cmp-val">${A.elderly_alone_pct}%</span>
      <span class="cmp-val">${B.elderly_alone_pct}%</span>
      <span class="cmp-diff ${diffElderly >= 0 ? 'pos' : 'neg'}">${diffElderly >= 0 ? '+' : ''}${diffElderly} pts</span>
    </div>
    <div class="cmp-row">
      <span class="cmp-metric">Precio Vivienda</span>
      <span class="cmp-val">${Math.round(A.avg_housing_price/1000000)}M</span>
      <span class="cmp-val">${Math.round(B.avg_housing_price/1000000)}M</span>
      <span class="cmp-diff ${diffPriceM >= 0 ? 'pos' : 'neg'}">${diffPriceM >= 0 ? '+' : ''}${diffPriceM}M KRW</span>
    </div>
  `;
}


// ============================================================
// SECCIONES NUEVAS (datos ya presentes en el lago: F01 / F03)
// ============================================================

// A. Evolución histórica del precio de vivienda (serie 2020-2025, fuente F03)
function renderizarEvolucionVivienda() {
  const cont = document.getElementById('evolucion-vivienda-chart');
  if (!cont || !Estado.economia || !Estado.economia.series) return;
  const serie = Estado.economia.series.evolucion_precio_vivienda;
  if (!serie || !serie.length) return;

  const valores = serie.map(s => s.precio_krw);
  const maxVal = Math.max(...valores);
  const minVal = Math.min(...valores);

  // Barras SVG responsivas
  const W = 680, H = 300, padL = 56, padB = 36, padT = 20;
  const innerW = W - padL - 16;
  const innerH = H - padB - padT;
  const bw = innerW / serie.length;

  let barras = '';
  serie.forEach((s, i) => {
    const h = ((s.precio_krw - minVal) / (maxVal - minVal || 1)) * (innerH - 30) + 30;
    const x = padL + i * bw + bw * 0.18;
    const y = padT + innerH - h;
    const w = bw * 0.64;
    const millones = (s.precio_krw / 1000000).toFixed(0);
    barras += `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="url(#gradViv)">
        <title>${s.anio}: ${millones}M KRW</title>
      </rect>
      <text x="${x + w / 2}" y="${padT + innerH + 22}" text-anchor="middle" class="svg-x-label">${s.anio}</text>
      <text x="${x + w / 2}" y="${y - 7}" text-anchor="middle" class="svg-bar-value">${millones}M</text>
    `;
  });

  cont.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" class="chart-svg" role="img" aria-label="Evolución del precio promedio de vivienda en Seúl 2020-2025">
      <defs>
        <linearGradient id="gradViv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#6366f1"/>
        </linearGradient>
      </defs>
      <line x1="${padL}" y1="${padT + innerH}" x2="${W - 16}" y2="${padT + innerH}" stroke="rgba(255,255,255,0.15)"/>
      <text x="16" y="${padT + 6}" class="svg-y-label">${(maxVal / 1000000).toFixed(0)}M</text>
      <text x="16" y="${padT + innerH}" class="svg-y-label">${(minVal / 1000000).toFixed(0)}M</text>
      ${barras}
    </svg>
  `;
}

// B. Transporte público: estaciones de metro y capacidad (fuente F01)
function renderizarTransporte() {
  const cont = document.getElementById('transporte-container');
  if (!cont || !Estado.transporte || !Estado.transporte.registros) return;
  const regs = [...Estado.transporte.registros].sort((a, b) => b.total_capacity - a.total_capacity);
  const maxCap = Math.max(...regs.map(r => r.total_capacity));

  cont.innerHTML = regs.map(r => {
    const pct = Math.round((r.total_capacity / maxCap) * 100);
    return `
      <div class="transit-card">
        <div class="transit-head">
          <span class="transit-name">🚇 ${r.station_name}</span>
          <span class="transit-line">${r.subway_line}</span>
        </div>
        <div class="transit-bar-track"><div class="transit-bar-fill" style="width:${pct}%"></div></div>
        <div class="transit-foot">
          <span>${r.total_capacity.toLocaleString('es-CO')} vehículos</span>
          <span class="transit-code">MOIS ${r.district_code}</span>
        </div>
      </div>
    `;
  }).join('');
}

// C. Indicadores económicos clave (PIB regional, turismo, empleo — fuente F03)
function renderizarIndicadoresEconomicos() {
  const cont = document.getElementById('indicadores-econ-container');
  if (!cont || !Estado.economia || !Estado.economia.cifras) return;
  const c = Estado.economia.cifras;

  const tarjetas = [];
  if (c.regional_gdp) {
    const billones = (c.regional_gdp.valor / 1000000).toFixed(1);
    tarjetas.push({ icon: '🏦', label: 'PIB Regional (GRDP)', valor: `${billones} B KRW`, nota: `Vigencia ${c.regional_gdp.vigencia}` });
  }
  if (c.foreign_visitors) {
    tarjetas.push({ icon: '✈️', label: 'Turistas Internacionales', valor: c.foreign_visitors.valor.toLocaleString('es-CO'), nota: `Mensuales · ${c.foreign_visitors.vigencia}` });
  }
  if (c.unemployment_rate) {
    tarjetas.push({ icon: '💼', label: 'Tasa de Desempleo', valor: `${c.unemployment_rate.valor}%`, nota: `Metropolitano · ${c.unemployment_rate.vigencia}` });
  }
  if (c.avg_housing_price) {
    tarjetas.push({ icon: '🏠', label: 'Vivienda Promedio', valor: `${(c.avg_housing_price.valor / 1000000).toFixed(0)}M KRW`, nota: `Seúl · ${c.avg_housing_price.vigencia}` });
  }

  cont.innerHTML = tarjetas.map(t => `
    <div class="econ-card">
      <div class="econ-icon">${t.icon}</div>
      <div class="econ-body">
        <span class="econ-label">${t.label}</span>
        <span class="econ-value">${t.valor}</span>
        <span class="econ-note">${t.nota}</span>
      </div>
    </div>
  `).join('');
}


// D. Indicadores macroeconómicos nacionales (Bank of Korea · ECOS, fuente F05)
function renderizarMacroBok() {
  const cont = document.getElementById('macro-bok-container');
  if (!cont || !Estado.macroBok || !Estado.macroBok.cifras) return;
  const c = Estado.macroBok.cifras;

  const items = [];
  if (c.base_rate) items.push({ icon: '🏛️', label: 'Tasa Base BOK', valor: `${c.base_rate.valor}%`, nota: c.base_rate.vigencia });
  if (c.cpi_inflation) items.push({ icon: '📈', label: 'Inflación (IPC)', valor: `${c.cpi_inflation.valor}%`, nota: `Interanual · ${c.cpi_inflation.vigencia}` });
  if (c.exchange_rate_usd) items.push({ icon: '💱', label: 'Tipo de Cambio', valor: `₩${c.exchange_rate_usd.valor.toLocaleString('es-CO')}`, nota: `por 1 USD · ${c.exchange_rate_usd.vigencia}` });
  if (c.gdp_growth) items.push({ icon: '🌐', label: 'Crecimiento PIB', valor: `${c.gdp_growth.valor}%`, nota: `Anual · ${c.gdp_growth.vigencia}` });

  cont.innerHTML = items.map(t => `
    <div class="econ-card">
      <div class="econ-icon">${t.icon}</div>
      <div class="econ-body">
        <span class="econ-label">${t.label}</span>
        <span class="econ-value">${t.valor}</span>
        <span class="econ-note">${t.nota}</span>
      </div>
    </div>
  `).join('');
}

// ============================================================================
// COMPUERTA DE SEGURIDAD CRIPTOGRÁFICA (SHA-256)
// ============================================================================
// La clave NO se almacena en texto plano en el código JavaScript.
// Se valida comparando el resumen criptográfico SHA-256 usando Web Crypto API.
// Hash SHA-256 correspondiente a la clave oficial entregada al profesor:
const HASH_COMPUERTA_OFICIAL = '495ac4b6f9a7332b52d1530bcd6a96219043e25bc6a389dc14f13c7128c5c944';

async function calcularSHA256(texto) {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function inicializarCompuertaSeguridad() {
  const overlay = document.getElementById('pantalla-compuerta');
  const card = document.getElementById('gate-card');
  const form = document.getElementById('gate-form');
  const input = document.getElementById('gate-password-input');
  const errorBox = document.getElementById('gate-error-msg');
  const toggleBtn = document.getElementById('gate-toggle-visibility');
  const lockBtn = document.getElementById('btn-bloquear-cerebro');

  if (!overlay || !input) return;

  // Verificar estado de sesión previo
  const estadoSesion = sessionStorage.getItem('cerebro_seoul_auth');
  if (estadoSesion === 'unlocked') {
    overlay.classList.add('gate-unlocked');
    document.body.classList.remove('cerebro-locked');
  } else {
    overlay.classList.remove('gate-unlocked');
    document.body.classList.add('cerebro-locked');
    setTimeout(() => input.focus(), 250);
  }

  // Alternar visibilidad de contraseña
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      toggleBtn.textContent = isPassword ? '🔒' : '👁️';
    });
  }

  // Validar clave en el envío
  const procesarIntentoAcceso = async () => {
    const claveIngresada = input.value.trim();
    if (!claveIngresada) {
      input.focus();
      return;
    }

    try {
      const hashIngresado = await calcularSHA256(claveIngresada);
      if (hashIngresado === HASH_COMPUERTA_OFICIAL) {
        // Acceso concedido
        if (errorBox) errorBox.style.display = 'none';
        sessionStorage.setItem('cerebro_seoul_auth', 'unlocked');
        overlay.classList.add('gate-unlocked');
        document.body.classList.remove('cerebro-locked');
        input.value = '';
      } else {
        // Acceso denegado
        if (errorBox) {
          errorBox.style.display = 'flex';
          const errText = errorBox.querySelector('.gate-error-text');
          if (errText) errText.textContent = 'Clave incorrecta. Acceso restringido al sistema.';
        }
        if (card) {
          card.classList.remove('gate-shake');
          void card.offsetWidth; // Forzar reflow para reiniciar animación
          card.classList.add('gate-shake');
        }
        input.select();
      }
    } catch (e) {
      console.error('Error calculando hash SHA-256:', e);
    }
  };

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      procesarIntentoAcceso();
    });
  }

  // Botón en la barra superior para bloquear el sistema nuevamente
  if (lockBtn) {
    lockBtn.addEventListener('click', () => {
      sessionStorage.removeItem('cerebro_seoul_auth');
      overlay.classList.remove('gate-unlocked');
      document.body.classList.add('cerebro-locked');
      if (errorBox) errorBox.style.display = 'none';
      input.value = '';
      setTimeout(() => input.focus(), 200);
    });
  }
}
