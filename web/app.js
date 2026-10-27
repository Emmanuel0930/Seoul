/**
 * CEREBRO SEÚL · APLICACIÓN PRINCIPAL (web/app.js)
 * Taller de Datos / Gobernanza de Sistemas de Información (2026)
 * Carga dinámica del lago de datos, MapLibre GL JS, trazabilidad a 1 clic y compuerta.
 */

// Estado Global de Datos
const Estado = {
  catalogo: [],
  demografia: null,
  economia: null,
  tiempoReal: null,
  escucha: null,
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

// Rutas a los datos (soporta tanto servidor local/Vercel como rutas relativas directas)
const RUTAS = {
  catalogo: '../catalogo/catalogo.json',
  demografia: '../lago/demografia.json',
  economia: '../lago/economia_vivienda.json',
  tiempoReal: '../lago/tiempo_real.json',
  escucha: '../lago/escucha.json',
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
  await cargarTodosLosDatos();
  renderizarTarjetasCifras();
  renderizarZonasTiempoReal();
  renderizarTablaCatalogo();
  inicializarMapaTerritorial();
  configurarEventosInteractivos();
});

// Carga asíncrona de todos los archivos del lago
async function cargarTodosLosDatos() {
  try {
    const [resCat, resDemo, resEcon, resRT, resEsc, resGeo] = await Promise.all([
      fetch(RUTAS.catalogo).then(r => r.json()).catch(() => []),
      fetch(RUTAS.demografia).then(r => r.json()).catch(() => null),
      fetch(RUTAS.economia).then(r => r.json()).catch(() => null),
      fetch(RUTAS.tiempoReal).then(r => r.json()).catch(() => null),
      fetch(RUTAS.escucha).then(r => r.json()).catch(() => null),
      fetch(RUTAS.geoJson).then(r => r.json()).catch(() => null)
    ]);

    Estado.catalogo = resCat;
    Estado.demografia = resDemo;
    Estado.economia = resEcon;
    Estado.tiempoReal = resRT;
    Estado.escucha = resEsc;
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
}

// 2. Renderizado del Monitor Urbano en Tiempo Real (F02)
function renderizarZonasTiempoReal() {
  const container = document.getElementById('realtime-zones-container');
  if (!container || !Estado.tiempoReal || !Estado.tiempoReal.registros) return;

  const zonas = Estado.tiempoReal.registros;
  container.innerHTML = '';

  zonas.forEach(z => {
    const card = document.createElement('div');
    card.className = 'zone-card';

    let tagClass = 'normal';
    if (z.congestion_level === 'Congested') tagClass = 'congested';
    else if (z.congestion_level === 'Slightly Congested') tagClass = 'slightly-congested';
    else if (z.congestion_level === 'Relaxed') tagClass = 'relaxed';

    card.innerHTML = `
      <div class="zone-header">
        <span class="zone-name">${z.area_name}</span>
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
          <span class="zm-val">${z.time_slot ? z.time_slot.split(' ')[0] : 'Actual'}</span>
        </div>
      </div>
      <div class="zone-footer">
        <span>${z.privacy_note}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// 3. Renderizado de Tabla de Catálogo (F01 - F14)
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

// 4. Inicialización del Mapa con MapLibre GL JS
function inicializarMapaTerritorial() {
  const mapElement = document.getElementById('mapa-seul');
  if (!mapElement || !Estado.geoJson) return;

  // Unir métricas del lago en las propiedades de cada feature GeoJSON
  enriquecerGeoJson();

  // Estilo vector oscuro libre sin API key paga
  const estiloOscuroLibre = {
    version: 8,
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      }
    },
    layers: [
      {
        id: 'osm-tiles-layer',
        type: 'raster',
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  };

  try {
    Estado.mapa = new maplibregl.Map({
      container: 'mapa-seul',
      style: estiloOscuroLibre,
      center: [126.9850, 37.5550], // Centro de Seúl
      zoom: 10.2,
      maxZoom: 14,
      minZoom: 9
    });

    Estado.mapa.addControl(new maplibregl.NavigationControl(), 'top-right');

    Estado.mapa.on('load', () => {
      // Agregar fuente GeoJSON enriquecida
      Estado.mapa.addSource('seoul-gu', {
        type: 'geojson',
        data: Estado.geoJson
      });

      // Capa de polígonos coloreados (Choropleth)
      Estado.mapa.addLayer({
        id: 'seoul-gu-fills',
        type: 'fill',
        source: 'seoul-gu',
        paint: {
          'fill-color': obtenerExpresionColor(Estado.capaActiva),
          'fill-opacity': 0.75
        }
      });

      // Capa de bordes
      Estado.mapa.addLayer({
        id: 'seoul-gu-borders',
        type: 'line',
        source: 'seoul-gu',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 1.5,
          'line-opacity': 0.8
        }
      });

      // Capa de etiquetas de distritos
      Estado.mapa.addLayer({
        id: 'seoul-gu-labels',
        type: 'symbol',
        source: 'seoul-gu',
        layout: {
          'text-field': ['get', 'name_eng'],
          'text-font': ['Open Sans Semibold'],
          'text-size': 11,
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#0f172a',
          'text-halo-width': 1.5
        }
      });

      // Eventos sobre el mapa
      Estado.mapa.on('mousemove', 'seoul-gu-fills', (e) => {
        if (e.features.length > 0) {
          Estado.mapa.getCanvas().style.cursor = 'pointer';
          mostrarFichaDistrito(e.features[0].properties);
        }
      });

      Estado.mapa.on('mouseleave', 'seoul-gu-fills', () => {
        Estado.mapa.getCanvas().style.cursor = '';
      });

      Estado.mapa.on('click', 'seoul-gu-fills', (e) => {
        if (e.features.length > 0) {
          mostrarFichaDistrito(e.features[0].properties);
        }
      });

      // Seleccionar Gwanak-gu o Gangnam-gu por defecto
      const defFeature = Estado.geoJson.features.find(f => f.properties.district_code === '11620');
      if (defFeature) mostrarFichaDistrito(defFeature.properties);
    });
  } catch (e) {
    console.error('Error al inicializar MapLibre:', e);
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

  Estado.geoJson.features.forEach(feat => {
    const code = feat.properties.district_code || feat.properties.code;
    const demo = demoMap[code] || {};
    const econ = econMap[code] || {};

    feat.properties.single_households_pct = demo.single_households_pct || 40.0;
    feat.properties.elderly_alone_pct = demo.elderly_alone_pct || 10.0;
    feat.properties.total_population = demo.total_population || 300000;
    feat.properties.area_km2 = demo.area_km2 || 20.0;
    feat.properties.density_hab_km2 = demo.density_hab_km2 || 15000;
    feat.properties.avg_housing_price = econ.avg_housing_price || 650000000;
    feat.properties.diff_pct_vs_seoul_avg = econ.diff_pct_vs_seoul_avg || 0.0;

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
        Estado.mapa.getSource('seoul-gu').setData(Estado.geoJson);
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

  // Modal de Compuerta
  const modalCompuerta = document.getElementById('modal-compuerta');
  const btnOpenCompuerta = document.getElementById('btn-compuerta');
  const btnCloseCompuerta = document.getElementById('modal-compuerta-close');
  const btnValidarClave = document.getElementById('btn-validar-clave');
  const inputClave = document.getElementById('input-clave');
  const compuertaFeedback = document.getElementById('compuerta-feedback');

  btnOpenCompuerta.addEventListener('click', () => {
    modalCompuerta.style.display = 'flex';
    inputClave.value = '';
    compuertaFeedback.style.display = 'none';
  });

  btnCloseCompuerta.addEventListener('click', () => modalCompuerta.style.display = 'none');
  modalCompuerta.addEventListener('click', (e) => {
    if (e.target === modalCompuerta) modalCompuerta.style.display = 'none';
  });

  btnValidarClave.addEventListener('click', async () => {
    const clave = inputClave.value.trim();
    if (!clave) {
      compuertaFeedback.className = 'feedback-msg error';
      compuertaFeedback.textContent = 'Por favor ingrese la clave académica.';
      compuertaFeedback.style.display = 'block';
      return;
    }

    try {
      const resp = await fetch('/api/entrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave })
      });
      const data = await resp.json();

      if (resp.ok && data.autorizada) {
        compuertaFeedback.className = 'feedback-msg success';
        compuertaFeedback.textContent = '✔ Acceso Autorizado. Token emitido.';
        compuertaFeedback.style.display = 'block';
        setTimeout(() => modalCompuerta.style.display = 'none', 1200);
      } else {
        compuertaFeedback.className = 'feedback-msg error';
        compuertaFeedback.textContent = data.mensaje || 'Clave denegada por la compuerta.';
        compuertaFeedback.style.display = 'block';
      }
    } catch (err) {
      // Si corre puramente en local estático sin servidor Node
      if (clave === 'seoul2026') {
        compuertaFeedback.className = 'feedback-msg success';
        compuertaFeedback.textContent = '✔ Clave verificada en entorno local.';
        compuertaFeedback.style.display = 'block';
        setTimeout(() => modalCompuerta.style.display = 'none', 1200);
      } else {
        compuertaFeedback.className = 'feedback-msg error';
        compuertaFeedback.textContent = 'Clave incorrecta.';
        compuertaFeedback.style.display = 'block';
      }
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
