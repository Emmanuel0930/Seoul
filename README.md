# Seúl · sistema de información

Grupo: Gabriela Martinez (Curaduría / Data Steward e Interfaz), Gabriela Sanabria (Datos / Custodia Técnica), Emmanuel Alvarez (Seguridad / Privacidad y Protección) · Enlace: https://cerebro-seoul.vercel.app/web · Revisado: 2026-11-03

## Para quién y qué pregunta
- **Usuario:** Secretaría u Oficina de Planeación y Bienestar Social de un distrito autónomo (*gu*) de Seúl (con foco comparativo distrital como Gwanak-gu y Gangnam-gu). En segundo nivel, sirve a periodistas de investigación, urbanistas y ciudadanía general.
- **Preguntas (entre tres y seis):**
  1. *¿Cuánta gente vive en cada gu y dónde se concentran los hogares unipersonales y los adultos mayores que viven solos?* Respondida con F01 (población metropolitana de 9,508,500 hab.; pico de hogares unipersonales en Gwanak-gu con 61.2% por población universitaria joven, seguido de Jung-gu 53.4%; adultos mayores solos concentrados en Gangbuk-gu con 13.5% y Dobong-gu 12.7%). Cifras ilustrativas de F01 pendientes de descarga directa.
  2. *¿Cómo cambió el precio de la vivienda por distrito frente al promedio de Seúl?* Respondida con F03 (apartamento promedio en 650M KRW; brecha extrema con Gangnam-gu +123.1% a 1,450M KRW y Seocho-gu +103.1% a 1,320M KRW frente a la periferia norte como Dobong-gu -30.8% a 450M KRW). Cifras ilustrativas de F03 pendientes de descarga directa.
  3. *¿Cómo se comportan el empleo, el transporte y la afluencia urbana en tiempo real?* Respondida con F02 y F03 (desempleo del 3.2% metropolitano; afluencia monitoreada en tiempo real cada 5 min en puntos neurálgicos agregados por zona y franja horaria).
  4. *Pregunta que queda pendiente (Hueco estructural de datos):* Medición en tiempo real del estado de salud mental y prevención del suicidio por micro-barrio (antigua Pregunta 6). Las leyes surcoreanas de privacidad (PIPA) prohíben la publicación abierta o geolocalización de llamadas de crisis o expedientes clínicos.
- **Escala y comparación:** Los 25 distritos autónomos (*gu* / 자치구) de Seúl frente al promedio metropolitano de la capital, utilizando la codificación oficial del Ministerio del Interior y Seguridad (MOIS: `11110` a `11740`).
- **Lo que decidimos no mostrar, y por qué:**
  1. Cero datos a nivel de personas (cero nombres, teléfonos, correos, documentos de identidad o RRN coreano).
  2. Cero geolocalización o rastreo de individuos en tiempo real: los datos de afluencia de `F02` se agregan estrictamente por macro-zona y franja horaria, nunca por micro-coordenadas vivas para evitar vigilancia masiva, espionaje corporativo o persecución de protestas pacíficas (Privacidad por Diseño).

## La réplica
- **Qué replicamos tal cual del ejemplo y qué tuvimos que cambiar para nuestra ciudad:**
  - *Replicado tal cual:* Arquitectura de 3 capas (Bronce `lago/raw/` ignorada en Git, Plata `lago/*.json` contractual y Oro `web/`); catálogo estricto de 14 fuentes con semáforo; trazabilidad a 1 clic en cada cifra; script de verificación automática de gobernanza (`verificacion/verificar.py`) con salida estricta 0/1.
  - *Cambiado para Seúl:* División territorial en los 25 *gu* de Seúl con códigos MOIS; moneda oficial en Wons surcoreanos (`KRW`); integración de APIs abiertas en coreano (Seoul Open Data y KOSIS); y construcción de un comparador distrital interactivo con sliders de vulnerabilidad social en MapLibre GL JS.
- **Fuentes catalogadas · integradas · caídas · descartadas: (ver catalogo/)**
  - *Catalogadas (15 en total):* F01 a F15 documentadas con ficha completa en `catalogo/catalogo.json` y `diccionario_seoul.xlsx`.
  - *Integradas (6):* F01 (Seoul Open Data), F02 (Seoul Real-Time City Data), F03 (KOSIS), F09 (GeoJSON Gu boundaries), F11 (Wikimedia Pageviews API) y F15 (Open-Meteo Weather API Seúl).
  - *Candidatas (4):* F04 (data.go.kr), F05 (Bank of Korea ECOS), F06 (MOLIT Vivienda/Jeonse), F10 (Copernicus Sentinel-2).
  - *Descartadas (2):* F07 (S-Map gemelo 3D: descartado por peso >500 MB inadmisible en teléfonos) y F12 (GDELT / Google News: descartado por riesgo de PII en noticias no filtradas).
  - *Excluidas (1):* F13 (Statista: excluida por muro de pago de US$199-1.299/año y licencia propietaria restrictiva).
  - *Caídas (1):* F14 (MODS mods.go.kr: caída por portal cerrado, sin documentación de API ni licencia declarada).
- **Huecos: lo que buscamos y no existe abierto para esta ciudad:**
  1. Microdatos de llamadas de emergencia psiquiátrica o salud mental barrial (bloqueados éticamente por la ley PIPA de Corea).
  2. Llave completa de API en Seoul Open Data Plaza para extranjeros sin número de teléfono móvil emitido por una operadora de Corea del Sur (obliga al uso de la llave pública `sample` que devuelve 1 zona viva de muestra).

## ¿Se puede usar?
| Fuente | Licencia | Personas | Estado | Condición |
|---|---|---|---|---|
| **F01** Seoul Open Data Plaza | KOGL Tipo 1 | Solo conteos por zona | `integrado` | Libre redistribución comercial con atribución obligatoria |
| **F02** Seoul Real-time City Data (122 lugares) | KOGL Tipo 1 | Solo conteos por zona | `integrado` | Atribución oficial; agregación por zona/tiempo (no individual) |
| **F03** KOSIS (Statistics Korea) | KOGL Tipo 1 | Solo conteos por zona | `integrado` | Libre uso estadístico con cita de la fuente oficial |
| **F04** data.go.kr (Portal Nacional) | KOGL Tipo 1 | Solo conteos por zona | `candidato` | Registro previo gratuito y atribución oficial MOIS |
| **F05** Bank of Korea · ECOS | Uso libre | No | `candidato` | Open API del banco central sin costo comercial |
| **F06** Vivienda y Jeonse (MOLIT) | KOGL Tipo 1 | No | `candidato` | Atribución pública Seúl / MOLIT |
| **F07** S-Map 3D (Gemelo Digital) | KOGL Tipo 1 | No | `descartado` | Excede peso admisible en cliente móvil (>500 MB) |
| **F08** OpenStreetMap (Overpass API) | ODbL 1.0 | No | `candidato` | Atribución + compartir igual (Share-Alike) |
| **F09** Seoul Administrative GeoJSON | MIT | No | `integrado` | Licencia permisiva abierta universal |
| **F10** Copernicus Sentinel-2 | Libre Copernicus | No | `candidato` | Atribución legal ESA / Unión Europea |
| **F11** Wikimedia Pageviews API | CC0 | No | `integrado` | Dominio público universal sin restricciones |
| **F12** GDELT / Google News RSS | Términos plataforma | Texto libre sin revisar | `descartado` | Riesgo de datos personales (PII) en prensa abierta |
| **F13** Statista · Topic Seoul | Propietaria | No | `excluido` | Muro de pago comercial (US$199–1.299/año) |
| **F14** MODS (mods.go.kr) | No declara | Texto libre sin revisar | `caido` | Portal cerrado sin API pública documentada |
| **F15** Open-Meteo Weather API | CC-BY 4.0 / Open Data | No | `integrado` | Libre uso no comercial sin API key ni tarjetas; centro de Seúl (37.5665° N, 126.9780° E) |

## Bitácora de exploración
| Tramo | Herramienta | Qué pidió para empezar | Licencia | Dónde quedan los datos | ¿Se rehace con un comando? | Estado del proyecto | Qué resolvió | Qué no pudo | ¿Quedó? ¿Por qué? |
|---|---|---|---|---|---|---|---|---|---|
| **Ingesta** | Python Estándar (`urllib.request`) | Solo Python 3 base (sin pip) | PSF License | En disco local (`lago/raw/` y `lago/`) | `python ingesta/pull_*.py` | Ejecutado con éxito | Cero dependencias externas; contratos limpios y reproducibles | Manejo automático de backoff exponencial en fallos | **SÍ (Elegida)**: 100% reproducible en cualquier máquina sin configurar venv |
| **Ingesta** | `dlt` (Data Load Tool) | `pip install dlt[duckdb]` y decoradores | Apache 2.0 | Base DuckDB local (`.duckdb`) | `python explorar/ingesta_dlt.py` | Solo documentada | Inferencia de esquema automática y normalización anidada | Crea esquemas dinámicos no gobernados y metadatos ajenos | **NO**: Sobrecarga innecesaria para 4 llamadas HTTP JSON |
| **Ingesta** | `DuckDB HTTP/JSON` | Binario DuckDB o pip, `INSTALL httpfs;` | MIT | En memoria o tabla local | `python explorar/ingesta_duckdb_http.py` | Solo documentada | Consulta SQL directa sobre URLs remotas con `read_json_auto()` | Inyectar metadatos de vigencia contractual en el payload JSON | **NO**: Rígido para modelar contratos de gobernanza JSON |
| **Lago** | JSON Contractual Plata | Editor de texto o script Python | Libre | Archivos `.json` en `lago/` | `python ingesta/pull_*.py` | Ejecutado con éxito | Consumo web nativo instantáneo en teléfonos inteligentes sin compilación | Mayor tamaño que formatos binarios para millones de registros | **SÍ (Elegida)**: Perfecto para observatorios agregados y consumo web directo |
| **Lago** | DuckDB + Parquet | Librería DuckDB / PyArrow | MIT / Apache 2.0 | Archivos `.parquet` locales | `python explorar/lago_duckdb_parquet.py` | Solo documentada | Compresión columnar (65% ahorro) y analítica OLAP local | Lectura nativa directa en el navegador móvil sin Wasm pesado | **NO**: Preservada en `explorar/` como opción analítica local |
| **Lago** | DuckLake / PyIceberg | Extensión DuckLake en DuckDB | Apache 2.0 / MIT | Archivos Parquet + metadata Avro | `python explorar/lago_ducklake.py` | Solo documentada | Catálogo ACID, control transaccional y time-travel | Sobrecarga de catálogo desproporcionada para 5 datasets fijos | **NO**: Complejidad innecesaria para el piso técnico |
| **Verificación** | Script `verificar.py` | Python con `re`, `json`, `glob` | MIT / Libre | En memoria (reporte CLI exit 0/1) | `python verificacion/verificar.py` | Ejecutado con éxito | 1,584 comprobaciones automáticas de contrato, PII y reglas de Seúl | Requiere mantenimiento manual al cambiar campos contractuales | **SÍ (Elegida)**: 0 dependencias externas y salida estricta `sys.exit(0)` |
| **Verificación** | Frictionless Framework | `pip install frictionless`, esquemas | MIT | En memoria | `python explorar/calidad_frictionless.py` | Solo documentada | Validación declarativa de tipos de datos en tablas | Validar reglas cruzadas complejas de dominio ni regex de PII coreano | **NO**: Insuficiente para las reglas específicas de los 25 gu de Seúl |
| **Territorio** | `MapLibre GL JS` + GeoJSON WGS84 | Script y CSS CDN (< 200 KB) | BSD 3-Clause | Renderizado en cliente (WebGL) | `python -m http.server 8000` | Ejecutado con éxito | Renderizado vectorial fluido a 60 FPS en móviles y coropletas dinámicas | Requiere simplificar geometrías complejas para descarga rápida | **SÍ (Elegida)**: 100% libre, sin API key comercial, touch-friendly en móvil |
| **Territorio** | DuckDB Spatial / GeoParquet | `INSTALL spatial; LOAD spatial;` | MIT | Archivos `.duckdb` / `.geoparquet` | `python explorar/territorio_geoparquet.py` | Solo documentada | Uniones espaciales y cálculo de centroides en SQL puro | No provee capa interactiva visual para el usuario final en celular | **NO**: Inadecuada para el consumo visual directo en interfaz web |
| **Meteorología** | Open-Meteo API | Petición HTTP directa (lat/lon) | CC-BY 4.0 | En disco local (`lago/clima.json`) | `python ingesta/pull_clima.py` | Ejecutado con éxito | Clima actual, sensación térmica, viento, lluvia y pronósticos 24h y 7d | Límites para uso comercial a gran escala | **SÍ (Elegida)**: Cero llaves, cero tarjetas, JSON nativo sin fricción |
| **Meteorología** | KMA (Korea Meteorological Admin) | Clave en apihub.kma.go.kr | KOGL Tipo 1 | Endpoint remoto | No | Solo documentada | Fuente oficial institucional surcoreana | Registro gubernamental obligatorio y portales en coreano | **NO**: Catalogada como candidata institucional; Open-Meteo garantiza reproducibilidad inmediata |
| **Meteorología** | OpenWeather / WeatherAPI | Registro y API Key de pago/freemium | Propietaria | Nube externa | No | Solo documentada | Widgets prehechos comerciales | Cuotas con tarjetas de crédito y restricciones en históricos | **NO**: Descartadas por riesgo de violar el piso técnico libre del taller |
| **Vistas** | HTML5 + CSS + Vanilla JS | Navegador web moderno estándar | Libre | Servidor web estático / Vercel | `python -m http.server 8000` | Ejecutado con éxito | Carga ultrarrápida en smartphones, cero build step, trazabilidad a 1 clic | Requiere programar estados a mano frente a frameworks reactivos | **SÍ (Elegida)**: Máxima velocidad móvil, peso pluma y trazabilidad de cada cifra |
| **Vistas** | Streamlit | Python, `pip install streamlit` | Apache 2.0 | Servidor en la nube (Streamlit Cloud) | No | Solo documentada | Prototipado rápido de paneles analíticos en Python puro | Lenta respuesta táctil en móviles; recarga todo el estado en cada clic | **NO**: Experiencia móvil deficiente y acoplamiento a runtime Python activo |
| **Vistas** | Observable Framework | Node.js, npm, CLI compilador | ISC / MIT | Servidor estático Observable | No | Solo documentada | Gráficos reactivos elegantes con Plot.js y data loaders | Curva de aprendizaje y acoplamiento a sintaxis propietaria | **NO**: Descartada por mayor complejidad operativa |

## Protección
- **Nivel:** abierto (con agregación ética en tiempo real).
- **Qué protegemos, y de quién:**
  - Protegemos la identidad, privacidad y libertad de movimiento de los transeúntes de Seúl frente a vigilancia masiva corporativa o perfilamiento estatal.
  - En `F02`, los datos de multitud se publican estrictamente como nivel de congestión ordinal (`Relaxed`, `Normal`, `Slightly Congested`, `Congested`) agregados por macro-zona y franja horaria, eliminando micro-coordenadas individuales o conteos en bruto.
  - Los datos crudos se conservan exclusivamente en `lago/raw/`, el cual está ignorado en Git mediante `.gitignore` y jamás se sube ni se expone en la web.
- **Pruebas de terminal o de ventana privada:**
  - Ejecución de `python verificacion/verificar.py` en terminal limpia: valida 1,584 comprobaciones con 0 fallos.
  - Prueba de inyección de datos con anomalías: al simular `unemployment_rate = 150` en `lago/economia_vivienda.json`, el script aborta inmediatamente con código de terminación `1`.
  - Prueba de PII: cualquier intento de agregar claves `cedula`, `email` o patrones de teléfono coreano (`010-XXXX-XXXX`) o RRN (`XXXXXX-[1-4]XXXXXX`) detiene el proceso con `exit code 1`.
  - Navegación en ventana privada / móvil: el sitio carga en < 1 segundo desde cualquier teléfono sin pedir autenticación ni cookies de rastreo.
- **Revisión de secretos en el historial:**
  - `.gitignore` prohíbe explícitamente: `lago/raw/*`, `.env`, `*.env`, `*.duckdb`, `node_modules/`, `__pycache__/`.
  - La clave de prueba `sample` utilizada para la API de Seúl es una clave pública y libre proveída por el propio Gobierno Metropolitano de Seúl para fines educativos. Ninguna tarjeta de crédito ni llave de pago existe en el código ni en el historial de commits.

## Herramienta elegida para las vistas
- **Qué necesitábamos mostrar:**
  - El observatorio de los 25 distritos (*gu*) de Seúl con coropletas interactivas, sliders ponderados de vulnerabilidad social, comparador distrital en vivo, monitor urbano en tiempo real y trazabilidad a 1 clic hacia el catálogo de fuentes.
- **Qué teníamos que proteger:**
  - La fluidez y velocidad en teléfonos inteligentes (menos de 200 KB de carga inicial), evitando dependencias de servidores Python pesados o cookies invasivas.
  - La privacidad de transeúntes evitando publicar micro-puntos o coordenadas continuas en el mapa.
- **Por qué esta herramienta cumple las dos cosas, y cuál descartamos por poco:**
  - **HTML5 + CSS + JavaScript Vanilla con MapLibre GL JS** cumple ambas exigencias: aprovecha la aceleración por hardware WebGL nativa del teléfono para renderizar el GeoJSON de los 25 distritos a 60 FPS, sin consumir cuotas de API keys comerciales (como Mapbox o Google Maps) y leyendo los JSON del lago directamente sin latencia de servidor.
  - **Descartamos por muy poco a Observable Framework:** Su arquitectura reactiva con Plot.js era elegante, pero requería Node.js, dependencias npm y un paso de compilación estricto, aumentando la fricción de mantenimiento frente a la simplicidad universal de Vanilla JS.

## Nuestra posición
- **Una reflexión de gestión y gobierno de datos, y nuestra respuesta con evidencia de nuestro sistema:**
  - *Reflexión:* En 2026, la soberanía de los sistemas de información depende de licencias públicas inmutables frente al cerramiento progresivo de herramientas (como la mercantilización de Soda Core en 2026 o el cierre de GX Cloud). Sin embargo, que un dato sea legalmente abierto bajo licencia (como KOGL Tipo 1) no garantiza su accesibilidad práctica: el portal oficial Seoul Open Data Plaza restringe el acceso a su API completa a quienes cuenten con una línea telefónica móvil local surcoreana para verificar su identidad. Para un equipo internacional, la apertura se reduce a la llave educativa `sample`.
  - *Evidencia en el sistema:* Nuestro sistema responde declarando con transparencia radical este límite en la web y el catálogo; servimos con rigor la zona devuelta por la API pública y etiquetamos con `"verificado": false` y badges visuales amarillos aquellas cifras que quedan pendientes de verificación directa por esta barrera de acceso.
- **Una reflexión de ciberseguridad, y nuestra respuesta con evidencia de nuestro sistema:**
  - *Reflexión:* En metrópolis hiperconectadas como Seúl, cruzar sensores IoT de tráfico, densidad de multitud y telemetría de telefonía móvil cada 5 minutos representa un riesgo inminente de vigilancia predictiva y reidentificación de personas en concentraciones públicas.
  - *Evidencia en el sistema:* Implementamos **Privacidad por Diseño**: nuestro pipeline `ingesta/pull_realtime.py` captura los crudos en `lago/raw/` (aislado de Git) y descarta de raíz cualquier coordenada individual o conteo minucioso de personas, publicando en `lago/tiempo_real.json` exclusivamente rangos categóricos de congestión agregados por macro-zona y franja horaria. El verificador automático audita continuamente la ausencia de PII con expresiones regulares específicas de Corea del Sur.

## Bitácora de IA
| Tramo | Herramienta | Qué le encargamos | Qué entregó | Qué le corregimos |
|---|---|---|---|---|
| **Estructuración del Catálogo** | ChatGPT (GPT-4o) | Identificar APIs geoespaciales para los límites distritales de Seúl | Recomendó usar Kakao Maps API y Naver Cloud API | **Se rechazó:** Ambas APIs comerciales exigen tarjeta de crédito y verificación telefónica coreana. Se reemplazó por el repositorio abierto `southkorea/seoul-maps` en GitHub (GeoJSON WGS84 abierto con licencia MIT). |
| **Pipeline de Ingesta en Tiempo Real** | Claude 3.5 Sonnet | Ingestar el feed de Seoul City Data (F02) | Sugirió guardar coordenadas latitud/longitud precisas de las personas en el JSON del lago | **Se corrigió de inmediato:** Violaba la Regla de Privacidad por Diseño (Pregunta 5). Se forzó al script a mapear solo etiquetas de congestión ordinales (`Relaxed`, `Normal`, `Congested`) agregadas por macro-zona. |
| **Normalización Territorial** | Gemini / Kiro | Generar códigos identificadores para los 25 distritos de Seúl | Asignó identificadores secuenciales del 1 al 25 (`01`, `02`...) | **Se corrigió:** Los estándares surcoreanos del Ministerio del Interior (MOIS) utilizan códigos oficiales de 5 dígitos (`11110` a `11740`). Se reprogramó el mapeo para usar la codificación MOIS canónica, asegurando la unión espacial con el GeoJSON. |
| **Verificación de Integridad y PII** | Claude 3.5 Sonnet | Escribir regex de detección de PII | Escribió patrones de cédula y teléfono colombiano (`3\d{9}`) | **Se agregaron expresiones regulares coreanas:** Inclusión del Resident Registration Number de Corea (`\d{6}-[1-4]\d{6}`) y números celulares locales (`010-\d{4}-\d{4}`). |
| **Diseño del Mapa y Desempeño Móvil** | ChatGPT (GPT-4o) | Proponer mapa interactivo territorial | Sugirió Folium / Leaflet con mapas base satelitales de alta resolución de 80 MB | **Se rechazó:** Tiempos de carga inaceptables en celular (>6 s). Se seleccionó MapLibre GL JS con renderizado WebGL vectorial liviano (< 200 KB), alcanzando 60 FPS en móviles. |
| **Ingesta de F01 y F03** | Claude | Crear los scripts de ingesta `pull_seoul_open.py` y `pull_kosis.py` | Escribió a mano en el script cifras demográficas y económicas verosímiles en lugar de descargarlas del API | **Se declararon transparentemente:** No se borraron; cada registro lleva `"verificado": false`, la web muestra la advertencia "Pendiente de verificar contra la fuente", el catálogo registra la limitación y el README lo documenta como vuelta atrás. |

## Revisión cruzada
- **Tres cifras auditadas por el grupo <X> (Grupo Auditor de Ciudades - Tokio / Bogotá):**
  1. *Temperatura y congestión en Gwanghwamun·Deoksugung (`F02`):* El grupo auditor ejecutó simultáneamente `curl` contra la API oficial de Seúl y el script `python ingesta/pull_realtime.py`. Verificaron que la temperatura (`8.9°C`) y la congestión (`Relaxed` / `여유`) coincidieron en el mismo minuto. *Corrección:* Sugirieron agregar una etiqueta explícita de `time_slot` ("Tiempo Real Agregado - 5 min") para clarificar la vigencia del dato.
  2. *Integridad territorial de los 25 distritos (`F09`):* Corrieron `python -c "import json; print(len(json.load(open('territorio/seoul_gu.geojson'))['features']))"` y confirmaron exactamente 25 distritos con nombres canónicos. *Corrección:* Notaron que el campo nativo en hangul `name` provocaba problemas de teselación en ciertas versiones móviles de MapLibre; lo aislamos limpiamente para renderizado sin alterar el GeoJSON del lago.
  3. *Línea base de escucha en Wikipedia (`F11`):* Contrastaron contra la API REST pública de Wikimedia Analytics el dato de septiembre 2026. Resultado: 10,831 visitas exactas confirmadas al 100%.
- **Ataque del grupo <Y> (Grupo de Pruebas de Penetración y Ciberseguridad):**
  - *Qué intentó:*
    1. Inyectar un Resident Registration Number (RRN) coreano válido (`980415-1029384`) y un número de celular (`010-2345-6789`) dentro del dataset de demografía.
    2. Intentar leer archivos de microdatos crudos o geolocalización continua de transeúntes desde el repositorio público.
    3. Romper las reglas de negocio introduciendo una tasa de desempleo imposible (`unemployment_rate = 150%`).
  - *Qué consiguió:* Ninguna filtración de datos sensibles ni acceso a datos crudos (la carpeta `lago/raw/` está excluida del repositorio mediante `.gitignore`).
  - *Qué cambiamos:* Al ejecutar el ataque de inyección en disco de prueba, `verificacion/verificar.py` abortó de inmediato con `exit code 1` señalando la regla violada. Para robustecer el sistema en plataformas Windows y Linux, reconfiguramos los scripts con `sys.stdout.reconfigure(encoding='utf-8')` evitando caídas por codificación de caracteres, y añadimos en la web el Comparador Distrital y el Modo Presentación en Clase.
- **Vueltas atrás en la ruta: de qué tramo a cuál, y por qué:**
  1. *De Ingesta en Vivo a Declaración de Zona Muestra en F02:* Al probar con la llave pública `sample`, descubrimos que la API de Seúl devuelve únicamente el área de Gwanghwamun·Deoksugung, repitiéndola si se piden otras zonas. En vez de simular que teníamos 6 zonas reales, retrocedimos, aislamos la única área real y declaramos las otras 5 como zonas pendientes de llave propia.
  2. *De Datos Asumidos como Vivos a Cifras Ilustrativas Transparentes en F01 y F03:* Al auditar el código generado por IA, detectamos cifras escritas a mano. Retrocedimos en la ruta: marcamos explícitamente `"verificado": false` en cada registro, añadimos alertas amarillas en la interfaz web y actualizamos el catálogo para advertir al evaluador con total honestidad.
  3. *De Intento de API Key Propia a Registro de Barrera Geográfica:* Intentamos registrarnos en `data.seoul.go.kr` para obtener una llave completa de las 122 áreas; al toparnos con el requisito mandatorio de verificación por SMS con número celular local coreano, retrocedimos y documentamos la limitación en la bitácora de gobierno de datos.

---

## En clase: Guion de Presentación (Sin Diapositivas)
*Para usar con el sistema abierto en pantalla (también disponible tocando el botón «🎙️ Guion en Clase» en la barra superior):*

1. **¿Qué herramienta descartamos que casi elegimos?**  
   *Observable Framework y Streamlit.* Casi elegimos Observable por la elegancia reactiva de Plot.js y Streamlit por la rapidez en Python; pero las descartamos porque MapLibre GL JS con HTML/JS Vanilla corre con aceleración WebGL nativa a 60 FPS en cualquier smartphone, pesa menos de 200 KB, no requiere runtime de servidor Python que se caiga y lee directamente los JSON del lago.
2. **¿Qué decidimos NO mostrar?**  
   *Datos a nivel de persona y micro-coordenadas de individuos en tiempo real.* Aunque la API F02 ofrece telemetría cada 5 minutos, el nivel de congestión se publica agregado por zona y franja horaria. Cruzar geolocalización viva con densidad permitiría vigilar la asistencia a manifestaciones o templos, vulnerando la privacidad cívica (PIPA).
3. **¿Qué tendría que cambiar para que la respuesta fuera otra?**  
   - *En la fuente:* Que Seoul Open Data Plaza permita registro internacional sin exigir línea de celular surcoreana local.
   - *En la herramienta:* Que DuckDB-Wasm reduzca su consumo de memoria RAM en móviles para procesar GeoParquet directamente en el cliente.
   - *En nuestro sistema:* Si integráramos datos clínicos o de prevención del suicidio (Pregunta 6), crearíamos una compuerta criptográfica con autenticación Zero-Knowledge y tokens efímeros para personal médico acreditado, nunca un mapa público abierto.
