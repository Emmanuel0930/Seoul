# ESPECIFICACIÓN TÉCNICA PARA AGENTE DE CÓDIGO: SISTEMA DE INFORMACIÓN "CEREBRO SEÚL" (서울)

## 1. CONTEXTO Y METADATOS DEL PROYECTO
- **Curso:** Tópicos de Sistemas de Información / Gobernanza de Datos (Taller de Datos).
- **Objetivo:** Replicar la anatomía y gobernanza del sistema de referencia ("Cerebro Lima") para la ciudad de **서울 (Seúl, Corea del Sur)** y construir el laboratorio de exploración comparando al menos 2 herramientas por tramo sobre los mismos datos.
- **Repositorio:** `https://github.com/Emmanuel0930/Seoul`
- **Integrantes del grupo y Roles de Gobierno de Datos (DAMA-DMBOK):**
  - **Curaduría (Data Steward):** Gabriela Martinez (Fuentes, licencias, semáforo y catálogo).
  - **Datos (Custodia Técnica):** Gabriela Sanabria (Contrato de datos, ingesta reproducible y verificación).
  - **Interfaz (Consumo):** Juan Ramon (Vistas, diseño móvil, mapas y trazabilidad de cifras a 1 clic).
  - **Seguridad (Privacidad y Protección):** Emmanuel Alvarez (Compuerta, control de datos sensibles, `.gitignore` y pruebas de ataque).
- **Usuario principal del sistema:** Secretaría u oficina de planeación de un distrito (*gu*) de Seúl (ej. Gwanak-gu o Gangnam-gu), y en segundo plano vecinos o periodistas locales.
- **Preguntas centrales que responde el sistema:**
  1. ¿Cuánta gente vive en cada *gu* y dónde se concentran los hogares unipersonales y los adultos mayores que viven solos?
  2. ¿Cómo cambió el precio de la vivienda por distrito (*gu*) frente al promedio de Seúl?
  3. ¿Cómo se comportan el empleo, el turismo, el transporte y la aglomeración urbana en tiempo real en la ciudad?

---

## 2. REGLAS ESTRICTAS DE ARQUITECTURA Y GOBERNANZA (INQUEBRANTABLES)
1. **Cero llaves pagas o expuestas:** Ningún script puede tener API keys hardcodeadas. Se leen de variables de entorno (`os.environ.get("SEOUL_API_KEY", "sample")`) y siempre deben tener un fallback funcional reproducible sin llave o con el modo `sample` público.
2. **Cero datos crudos en Git:** Todo dato descargado en crudo va a `lago/raw/`, el cual DEBE estar en `.gitignore`.
3. **Cero cifras sin fuente, vigencia o fecha de prueba:** Ningún número puede escribirse a mano ("hardcodeado") en el HTML/JS de la prosa. Toda cifra mostrada en `web/` debe leerse dinámicamente de los JSON de `lago/` y mostrar al usuario (en la misma línea o a 1 clic): `valor`, `unidad`, `vigencia`, `fuente` (con enlace) y `probado` (fecha en formato `AAAA-MM-DD`, sin horas ni segundos).
4. **Privacidad por diseño (Regla sobre `F02` - `congestion_level`):** Aunque la densidad en tiempo real (`AREA_CONGEST_LVL` / `densidad_tiempo_real`) es pública, puede revelar patrones de presencia de grupos vulnerables o protestas si se cruza con hora y lugar exacto. Por decisión de gobernanza:
   - Los crudos quedan en `lago/raw/` (ignorados en Git).
   - En `lago/tiempo_real.json` solo se publica información agregada por zona y franja horaria, nunca por persona ni punto exacto en vivo.
5. **Prohibido dejar rastros de otras ciudades:** Verificar que no existan referencias a Lima, Miraflores, Medellín, soles (PEN), pesos (COP) o UF en el código de `web/`, `api/` o `lago/`. La moneda es Won surcoreano (`KRW`) y las divisiones son los **25 distritos autónomos (*gu* / 자치구)** de Seúl.
6. **Reproducibilidad total:** Ejecutar `rm -rf lago/*.json` seguido de todos los scripts en `ingesta/pull_*.py` y luego `python3 verificacion/verificar.py` debe reconstruir el lago idéntico con `0 fallos` (`exit code 0`).

---

## 3. ESTRUCTURA DE CARPETAS REQUERIDA
Crea exactamente este árbol de directorios:
```text
Seoul/
├── .gitignore
├── README.md                 # Esqueleto completo exigido por el taller con todas las bitácoras
├── catalogo/
│   └── catalogo.json         # Las 14 fuentes rastreadas (F01 a F14) con estado, licencia, probado y personas
├── ingesta/                  # Scripts Python (solo librería estándar) que bajan, limpian y escriben en lago/
│   ├── pull_escucha.py       # F11: Wikimedia Pageviews API para "Seúl"
│   ├── pull_seoul_open.py    # F01: Seoul Open Data Plaza (población por gu, metro, parqueaderos)
│   ├── pull_realtime.py      # F02: Seoul Real-time City Data (122 lugares, agregado por zona/franja)
│   └── pull_kosis.py         # F03: KOSIS Statistics Korea (desempleo, vivienda, edad, GRDP, turismo)
├── lago/                     # Capa Plata (Silver): JSON limpios que cumplen el contrato de datos
│   ├── raw/                  # Capa Bronce (Bronze): Archivos crudos (IGNORADO EN GIT)
│   ├── escucha.json
│   ├── demografia.json
│   ├── transporte.json
│   ├── tiempo_real.json
│   └── economia_vivienda.json
├── territorio/
│   └── seoul_gu.geojson      # F09: Límites de los 25 distritos (gu) de Seúl en WGS84 simplificado
├── verificacion/
│   └── verificar.py          # Validador de contrato, PII y reglas de dominio de Seúl (falla con exit 1)
├── explorar/                 # Scripts del Laboratorio (mínimo 2 herramientas probadas por tramo)
│   ├── ingesta_dlt.py        # Tramo Ingesta: dlt + DuckDB sobre Wikipedia Seúl (F11)
│   ├── ingesta_duckdb_http.py# Tramo Ingesta: Consulta HTTP directa con DuckDB
│   ├── lago_duckdb_parquet.py# Tramo Lago: Conversión de JSON a Parquet y consulta SQL con DuckDB
│   ├── lago_ducklake.py      # Tramo Lago: Prueba de catálogo y versiones con DuckLake / PyIceberg
│   ├── calidad_frictionless.py # Tramo Verificación: Validación de esquema con Frictionless / Data Contract
│   └── territorio_geoparquet.py # Tramo Territorio: Inspección espacial de los 25 gu de Seúl con DuckDB Spatial
├── api/                      # Compuerta (funciones serverless compatibles con Vercel o servidor local)
│   ├── entrar.js             # Validación de clave de acceso y emisión de sesión/cookie
│   └── datos.js              # Sirve los JSON del lago solo si la sesión es válida
└── web/                      # Capa Oro (Gold): Cáscara pública HTML/CSS/JS sin framework + MapLibre GL
    ├── index.html            # Vistas responsivas (abre en móvil), mapa de 25 gu, buscador y trazabilidad
    ├── estilos.css
    └── app.js

```

---

## 4. ESPECIFICACIÓN DEL CATÁLOGO DE FUENTES (`catalogo/catalogo.json`)

Genera `catalogo/catalogo.json` conteniendo un arreglo JSON con las **14 fuentes (`F01` a `F14`)** rastreadas por el grupo. Cada objeto debe tener: `id`, `nombre`, `entidad`, `tipo_publicador`, `url`, `formato`, `acceso`, `licencia`, `personas`, `cobertura`, `vigencia`, `frecuencia`, `probado`, `estado`, `proteccion`, `como_se_encontro`, `nota`.

Lista oficial de fuentes del grupo:

* **`F01`**: *Seoul Open Data Plaza (data.seoul.go.kr)* | Entidad: Gobierno Metropolitano de Seúl | URL: `https://data.seoul.go.kr` | Licencia: `KOGL Tipo 1 (libre con atribución)` | Personas: `Solo conteos por zona` | Probado: `2026-10-06` | Estado: `integrado` | Protección: `abierto` | Nota: Aporta población por *gu/dong*, estaciones de metro y estacionamientos.
* **`F02`**: *Seoul Real-time City Data (122 lugares)* | Entidad: Gobierno Metropolitano de Seúl | URL: `https://english.seoul.go.kr/reducing-ai-hallucinations-seoul-launches-the-first-public-data-mcp-service/` (Endpoint API: `http://openapi.seoul.go.kr:8088/sample/json/citydata_ppltn/1/5/광화문·덕수궁`) | Licencia: `KOGL Tipo 1 (libre con atribución)` | Personas: `Solo conteos por zona` | Probado: `2026-10-06` | Estado: `integrado` | Protección: `solo agregados` | Nota: Densidad de multitud, transporte, clima y calidad del aire en 122 lugares cada 5 min. Se cataloga la fuente primaria y no el wrapper MCP.
* **`F03`**: *KOSIS — Korean Statistical Information Service* | Entidad: Statistics Korea (통계청) | URL: `https://kosis.kr/eng/` | Licencia: `KOGL Tipo 1 (libre con atribución)` | Personas: `Solo conteos por zona` | Probado: `2026-10-06` | Estado: `integrado` | Protección: `abierto` | Nota: Censo, proyecciones de población, desempleo, vivienda, PIB regional (GRDP) y turismo. Cruzar por código territorial, nunca por nombre.
* **`F04`**: *data.go.kr — Portal Nacional de Datos Abiertos* | Entidad: Ministerio del Interior y Seguridad (Corea) | URL: `https://data.go.kr` | Licencia: `KOGL Tipo 1 (libre con atribución)` | Personas: `Solo conteos por zona` | Probado: `2026-10-06` | Estado: `candidato` | Protección: `abierto` | Nota: Catálogo nacional complementario filtrable por Seúl.
* **`F05`**: *Bank of Korea · ECOS (Economic Statistics System)* | Entidad: Banco de Corea (한국은행) | URL: `https://ecos.bok.or.kr/api/` | Licencia: `Uso libre (Open API del banco central)` | Personas: `No` | Probado: `2026-10-06` | Estado: `candidato` | Protección: `abierto` | Nota: Series macro (IPC, tasa base, tipo de cambio KRW).
* **`F06`**: *Vivienda · precios y jeonse (Seoul Open Data / MOLIT)* | Entidad: Seúl + Min. de Territorio (MOLIT) | URL: `https://data.seoul.go.kr` | Licencia: `KOGL Tipo 1 (libre con atribución)` | Personas: `No` | Probado: `2026-10-06` | Estado: `candidato` | Protección: `abierto` | Nota: Proxy de nivel socioeconómico por *gu*.
* **`F07`**: *S-Map / Virtual Seoul (gemelo 3D)* | Entidad: Gobierno Metropolitano de Seúl | URL: `https://world.seoul.go.kr/policy/smart-city/spatial-data/` | Licencia: `KOGL Tipo 1 (términos del portal)` | Personas: `No` | Probado: `2026-10-06` | Estado: `descartado` | Protección: `abierto` | Nota: Gemelo 3D de 605 km²; descartado por peso excesivo frente al piso técnico móvil del taller.
* **`F08`**: *OpenStreetMap (Overpass API)* | Entidad: Colaboradores de OpenStreetMap | URL: `https://overpass-api.de/` | Licencia: `ODbL (atribución + compartir igual)` | Personas: `No` | Probado: `2026-10-06` | Estado: `candidato` | Protección: `abierto` | Nota: Puntos de interés y vías sin llave.
* **`F09`**: *Seoul administrative divisions (GeoJSON/TopoJSON)* | Entidad: southkorea/seoul-maps (GitHub) | URL: `https://github.com/southkorea/seoul-maps` | Licencia: `Abierta (MIT / repositorio público)` | Personas: `No` | Probado: `2026-10-06` | Estado: `integrado` | Protección: `abierto` | Nota: Provee la geometría WGS84 de los 25 *gu* de Seúl para el mapa en MapLibre GL.
* **`F10`**: *Copernicus Sentinel-2* | Entidad: ESA / Copernicus | URL: `https://dataspace.copernicus.eu/` | Licencia: `Libre y gratuito (con atribución Copernicus)` | Personas: `No` | Probado: `2026-10-06` | Estado: `candidato` | Protección: `abierto` | Nota: Imagen multiespectral 10 m para verde urbano.
* **`F11`**: *Wikimedia Pageviews API* | Entidad: Fundación Wikimedia | URL: `https://wikimedia.org/api/rest_v1/` | Licencia: `CC0` | Personas: `No` | Probado: `2026-10-06` | Estado: `integrado` | Protección: `abierto` | Nota: Línea base obligatoria del taller; mide cuánta gente busca 'Seúl' mensualmente en Wikipedia.
* **`F12`**: *GDELT / Google News RSS* | Entidad: Proyecto GDELT / Google | URL: `https://www.gdeltproject.org/` | Licencia: `Términos de cada plataforma` | Personas: `Texto libre sin revisar` | Probado: `2026-10-06` | Estado: `descartado` | Protección: `solo agregados` | Nota: Trae texto libre sin revisar; se descarta publicar texto crudo por riesgo de datos personales.
* **`F13`**: *Statista · topic Seoul* | Entidad: Statista GmbH | URL: `https://www.statista.com/topics/9076/seoul/` | Licencia: `Propietaria / suscripción de pago (US$199–1.299/año)` | Personas: `No` | Probado: `2026-10-06` | Estado: `excluido` | Protección: `no se publica` | Nota: DESCARTADA por muro de pago y licencia propietaria que prohíbe redistribuir. Sus cifras provienen de KOSIS (F03) y BOK (F05), que usamos directamente y gratis.
* **`F14`**: *MODS (mods.go.kr) — portal de monitoreo* | Entidad: Gobierno de Corea | URL: `https://mods.go.kr/anse/` | Licencia: `no declara` | Personas: `Texto libre sin revisar` | Probado: `2026-10-06` | Estado: `caido` | Protección: `no se publica` | Nota: Documentación en coreano, licencia sin declarar y acceso por script no confirmado.

---

## 5. CONTRATO DE DATOS Y DICCIONARIO DE LOS 15 CAMPOS DEL LAGO

Todo archivo `.json` dentro de `lago/` DEBE cumplir estrictamente esta estructura:

```json
{
  "tema": "<nombre_del_tema>",
  "probado": "2026-10-06",
  "fuentes": [
    {
      "id": "F01",
      "nombre": "Seoul Open Data Plaza (data.seoul.go.kr)",
      "url": "[https://data.seoul.go.kr](https://data.seoul.go.kr)",
      "estado": "vivo",
      "licencia": "KOGL Tipo 1 (libre con atribución)"
    }
  ],
  "cifras": {
    "<nombre_campo>": {
      "valor": 145200,
      "unidad": "Personas",
      "vigencia": "2025-12",
      "fuente": "F01"
    }
  },
  "series": {},
  "registros": []
}

```

### Los 15 campos obligatorios del Diccionario de Datos (Deben existir en los archivos de `lago/`):

1. **`vistas_ultimo_mes`** (Origen: `views`, Fuente: `F11`, Archivo: `lago/escucha.json`)
* Tipo: `Integer` | Unidad: `vistas de personas` | Rango: `>= 0` | Clasificación: `Pública`.
* Transformación: Tomar el último mes completo de la serie de Wikimedia Pageviews (`es.wikipedia`, artículo `Seúl`); fecha `AAAAMMDD` pasa a `AAAA-MM`.


2. **`district_code`** (Origen: `CGOV_CD`, Fuente: `F01`, Archivo: `lago/demografia.json`)
* Tipo: `String` | Unidad: `código territorial` | Rango: Códigos de 5 dígitos (`11110` a `11740`, los 25 *gu* de Seúl) | Clasificación: `Pública`.
* Transformación: Trim y conversión a formato estándar de texto de 5 caracteres.


3. **`total_population`** (Origen: `JUMIN_POP`, Fuente: `F01`, Archivo: `lago/demografia.json`)
* Tipo: `Integer` | Unidad: `Personas` | Ejemplo: `9384512` (total Seúl) y desglose por cada uno de los 25 *gu* (ej. Songpa-gu `658000`, Gangnam-gu `537000`, Gwanak-gu `497000`, Jongno-gu `145200`) | Rango: `>= 0` | Clasificación: `Pública`.
* Transformación: Limpieza de comas y conversión a entero. (Incluir también tasas de hogares unipersonales y adultos mayores solos por *gu* para responder la Pregunta 1).


4. **`station_name`** (Origen: `STAT_NM`, Fuente: `F01`, Archivo: `lago/transporte.json`)
* Tipo: `String` | Ejemplo: `"Gangnam"` | Clasificación: `Pública`.
* Transformación: Normalización a mayúscula inicial y eliminación de espacios.


5. **`subway_line`** (Origen: `LINE_NUM`, Fuente: `F01`, Archivo: `lago/transporte.json`)
* Tipo: `String` | Ejemplo: `"Line 2"` | Rango: Líneas 1 a 9, Sinbundang, etc. | Clasificación: `Pública`.
* Transformación: Estandarización de prefijos de línea.


6. **`total_capacity`** (Origen: `PARKING_CNT`, Fuente: `F01`, Archivo: `lago/transporte.json`)
* Tipo: `Integer` | Unidad: `Vehículos` | Ejemplo: `120` | Rango: `>= 0` | Clasificación: `Pública`.
* Transformación: Imputación de nulos a `0` y conversión a entero.


7. **`area_name`** (Origen: `AREA_NM`, Fuente: `F02`, Archivo: `lago/tiempo_real.json`)
* Tipo: `String` | Ejemplo: `"Myeong-dong"`, `"Gwanghwamun·Deoksugung"`, `"Gangnam MICE"`, `"Hongdae"` | Rango: Lista de 122 áreas predefinidas | Clasificación: `Pública`.
* Transformación: Traducción/romanización limpia y eliminación de caracteres especiales.


8. **`congestion_level`** (Origen: `AREA_CONGEST_LVL`, Fuente: `F02`, Archivo: `lago/tiempo_real.json`)
* Tipo: `String` | Ejemplo: `"Congested"` | Valores permitidos: `["Relaxed", "Normal", "Slightly Congested", "Congested"]` | Clasificación: **`Sensible`** (Dato delicado de la Pregunta 5).
* Transformación: Mapeo de etiquetas coreanas (`여유` -> `Relaxed`, `보통` -> `Normal`, `약간 붐빔` -> `Slightly Congested`, `붐빔` -> `Congested`) y agregación por zona y franja horaria (nunca punto individual en vivo).


9. **`current_temperature`** (Origen: `TEMP`, Fuente: `F02`, Archivo: `lago/tiempo_real.json`)
* Tipo: `Float` | Unidad: `Grados Celsius (°C)` | Ejemplo: `22.5` | Rango: `-30.0 a 50.0` | Clasificación: `Pública`.
* Transformación: Conversión a numérico con un decimal.


10. **`avg_road_speed`** (Origen: `ROAD_MSG`, Fuente: `F02`, Archivo: `lago/tiempo_real.json`)
* Tipo: `Float` | Unidad: `km/h` | Ejemplo: `28.4` | Rango: `>= 0.0` | Clasificación: `Pública`.
* Transformación: Extracción numérica de velocidad vial en km/h.


11. **`air_quality_index`** (Origen: `AIR_IDX`, Fuente: `F02`, Archivo: `lago/tiempo_real.json`)
* Tipo: `String` | Ejemplo: `"Good"` | Valores permitidos: `["Good", "Normal", "Bad", "Very Bad"]` | Clasificación: `Pública`.
* Transformación: Normalización de escala coreana (`좋음`, `보통`, `나쁨`, `매우나쁨`) a descriptores estándar en inglés.


12. **`unemployment_rate`** (Origen: `UE_RATE`, Fuente: `F03`, Archivo: `lago/economia_vivienda.json`)
* Tipo: `Float` | Unidad: `%` | Ejemplo: `3.2` | Rango: `0.0 a 100.0` | Clasificación: `Pública`.
* Transformación: Redondeo a dos decimales.


13. **`avg_housing_price`** (Origen: `HOUSE_PRC`, Fuente: `F03`, Archivo: `lago/economia_vivienda.json`)
* Tipo: `Float` | Unidad: `Wons coreanos (KRW)` | Ejemplo: `650000000` (y serie/comparativa por *gu*, ej. Gangnam-gu `1450000000`, Seocho-gu `1320000000`, Gwanak-gu `520000000`, promedio Seúl `650000000`) | Rango: `>= 0` | Clasificación: `Pública`.
* Transformación: Escalado a unidades monetarias base (KRW).


14. **`age_group`** (Origen: `AGE_GBN`, Fuente: `F03`, Archivo: `lago/demografia.json`)
* Tipo: `String` | Ejemplo: `"20-29"` | Valores permitidos: `["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80+"]` | Clasificación: `Pública`.
* Transformación: Estandarización de formato de rangos de edad.


15. **`regional_gdp`** (Origen: `GRDP`, Fuente: `F03`, Archivo: `lago/economia_vivienda.json`)
* Tipo: `Float` | Unidad: `Millones de KRW` | Ejemplo: `45000000` | Rango: `>= 0` | Clasificación: `Pública`.
* Transformación: Conversión a moneda local en millones de KRW.


16. **`foreign_visitors`** (Origen: `FOR_VISIT`, Fuente: `F03`, Archivo: `lago/economia_vivienda.json`)
* Tipo: `Integer` | Unidad: `Personas` | Ejemplo: `1250000` | Rango: `>= 0` | Clasificación: `Pública`.
* Transformación: Agregación mensual y limpieza de nulos.



---

## 6. VERIFICACIÓN AUTOMÁTICA (`verificacion/verificar.py`)

Construye `verificacion/verificar.py` para que recorra todos los archivos `lago/*.json` y valide:

1. Que `probado` tenga formato exacto `^\d{4}-\d{2}-\d{2}$`.
2. Que toda fuente en `fuentes` tenga `id`, `url` y `licencia` no vacíos, y que exista en `catalogo/catalogo.json`.
3. Que cada métrica dentro de `cifras` tenga `valor` (no nulo), `unidad`, `vigencia` y `fuente` (que coincida con un `id` declarado en `fuentes`).
4. **Detección de PII (Datos Personales):**
* Ninguna clave del JSON puede coincidir con `cedula|documento_identidad|rrn|jumin_no|telefono|celular|correo|email`.
* Ningún string del JSON puede contener correos electrónicos, celulares colombianos (`3\d{9}`) ni celulares/RRN coreanos (`010-\d{4}-\d{4}`).


5. **Comprobaciones de dominio de Seúl (Reglas de negocio):**
* `total_population` de Seúl entre `8_500_000` y `10_500_000`.
* Cantidad de distritos (*gu*) en el desglose territorial igual a `25`, con códigos entre `11110` y `11740`.
* `unemployment_rate` entre `0.0` y `100.0`.
* `current_temperature` entre `-30.0` y `50.0`.
* `congestion_level` perteneciente únicamente a `["Relaxed", "Normal", "Slightly Congested", "Congested"]`.
* `air_quality_index` perteneciente únicamente a `["Good", "Normal", "Bad", "Very Bad"]`.
* `avg_housing_price` > `0`.


6. Si cualquier check falla, imprime `FAIL <detalle>` y termina con `sys.exit(1)`. Si todos pasan, imprime el total de checks exitosos y termina con `sys.exit(0)`.

---

## 7. LABORATORIO DE EXPLORACIÓN (`explorar/` y Bitácora en `README.md`)

El taller exige probar al menos 2 herramientas por tramo sobre los mismos datos y documentar la tabla comparativa en el `README.md`:

1. **Tramo Ingesta:**
* Herramienta 1 (Elegida): Python librería estándar (`urllib.request` en `ingesta/pull_*.py`). Cero dependencias, trazabilidad directa al contrato JSON.
* Herramienta 2 (Explorada): `dlt` (`explorar/ingesta_dlt.py`) cargando `F11` (Wikipedia Seúl) a DuckDB, inspeccionando las tablas `_dlt_loads`, `_dlt_pipeline_state` y `_dlt_version`.
* Herramienta 3 (Explorada): `DuckDB HTTP/JSON` (`explorar/ingesta_duckdb_http.py`) leyendo endpoints remotos con `read_json_auto()`.


2. **Tramo Lago y Almacenamiento:**
* Herramienta 1 (Elegida): Archivos JSON bajo contrato + consultas locales con `DuckDB` / `Parquet` (`explorar/lago_duckdb_parquet.py`).
* Herramienta 2 (Explorada): `DuckLake` (`explorar/lago_ducklake.py`), probando catálogo en SQL, datos en Parquet y viaje en el tiempo (*time travel*) local en versión estable (abril 2026).


3. **Tramo Verificación y Contratos:**
* Herramienta 1 (Elegida): Verificador propio en Python (`verificacion/verificar.py`) con reglas de dominio de Seúl y regex PII.
* Herramienta 2 (Explorada): `Frictionless Framework` / validación de esquema JSON Schema (`explorar/calidad_frictionless.py`). Documentar en la bitácora por qué se descartaron `Soda Core` (cambió a licencia propietaria en enero 2026), `GX Cloud` (cerró en junio 2026) e instalación por defecto de `dbt` (trae distribución propietaria tras fusión con Fivetran en junio 2026, frente a `dbt-core` Apache-2.0).


4. **Tramo Territorio:**
* Herramienta 1 (Elegida): `GeoJSON` simplificado de `southkorea/seoul-maps` (`territorio/seoul_gu.geojson`) renderizado con `MapLibre GL JS`.
* Herramienta 2 (Explorada): `DuckDB Spatial` / `Overture Maps` (`explorar/territorio_geoparquet.py`) para calcular áreas y centroides de los 25 *gu*.


5. **Tramo Vistas:**
* Herramienta 1 (Elegida): HTML5 + CSS3 + JavaScript Vanilla + `MapLibre GL JS` (`web/`). Abre rápido en teléfonos, sin pasos de compilación pesados y permite proteger los datos detrás de `/api`.
* Herramienta 2 (Explorada): `Streamlit` / `Observable Framework` (anotar en bitácora qué resolvió y por qué se eligió la cáscara ligera HTML/JS con MapLibre).



---

## 8. VISTAS (`web/`) Y COMPUERTA (`api/`)

Construye una interfaz web moderna, limpia, responsiva (mobile-first) inspirada en la estética de un centro de monitoreo urbano de Seúl:

1. **Secciones de la interfaz (`web/index.html`):**
* **Portada y Contexto:** Declara explícitamente el usuario objetivo (Secretaría de Planeación Distrital de un *gu* de Seúl como Gwanak-gu / Gangnam-gu y vecinos) y la escala de comparación (comparativa entre los **25 distritos *gu*** y promedio metropolitano de Seúl).
* **Las Preguntas Clave (Tarjetas con cifras vivas):** Cada tarjeta carga su número desde `lago/*.json` y muestra un badge interactivo con: `[Fuente: F01 · Vigencia: 2025-12 · Probado: 2026-10-06]` que al hacer clic lleva a la ficha de la fuente o abre el modal de trazabilidad.
* **Mapa Interactivo de los 25 *Gu* (`MapLibre GL JS`):** Carga `territorio/seoul_gu.geojson`, colorea los 25 distritos según la métrica seleccionada por el usuario (Población total, % Hogares unipersonales, % Adultos mayores solos, Precio promedio de vivienda en KRW) e incluye un **Índice Compuesto de Prioridad Distrital** con *sliders* (controles deslizantes) para que el usuario mueva los pesos de Demografía, Vivienda y Movilidad en vivo.
* **Monitor en Tiempo Real (Agregado y Protegido - `F02`):** Muestra temperatura (`current_temperature`), velocidad vial (`avg_road_speed`), calidad del aire (`air_quality_index`) y nivel de congestión (`congestion_level`) agregado por zona (`Myeong-dong`, `Gwanghwamun`, `Gangnam`, `Hongdae`) y franja horaria, explicando en una nota visible la decisión ética de privacidad de la Pregunta 5.
* **Escucha Externa (`F11`):** Gráfico de serie mensual de búsquedas del artículo `Seúl` en Wikipedia (`vistas_mensuales` y `vistas_ultimo_mes`).
* **Sección «Lo que el Cerebro Seúl NO sabe, lo dice»:** Explica con transparencia los huecos encontrados en el rastreo (la ausencia de datos abiertos en tiempo real sobre el estado emocional/salud mental por barrio para prevención del suicidio —Pregunta 6—, la exclusión de Statista `F13` por muro de pago y la caída/idioma de `MODS` `F14`).
* **Explorador del Catálogo y Diccionario:** Tabla interactiva que lee `catalogo/catalogo.json` mostrando las 14 fuentes (integradas, candidatas, caídas y excluidas) y los 15 campos del diccionario.



---

## 9. DOCUMENTACIÓN COMPLETA EN `README.md`

Escribe el archivo `README.md` siguiendo exactamente la plantilla exigida en la sección **"La entrega"** del taller, rellenando todas las secciones con los datos reales de nuestro proyecto de Seúl:

1. `# 서울 (Seúl) · Sistema de Información` con nombres del grupo, papeles de gobierno de datos, enlace y fecha de revisión.
2. `## Para quién y qué pregunta` (Usuario, las preguntas, escala de 25 *gu* y qué decidimos no mostrar).
3. `## La réplica` (Qué replicamos del ejemplo de Lima, resumen de las 14 fuentes catalogadas y los huecos de Seúl).
4. `## ¿Se puede usar?` (Tabla del semáforo para las 14 fuentes `F01` a `F14` con Licencia, Personas, Estado y Condición).
5. `## Bitácora de exploración` (Tabla con las 10 columnas obligatorias comparando al menos 2 herramientas por cada tramo).
6. `## Protección` (Nivel elegido: *solo agregados / compuerta*, protección de `congestion_level`, crudos en `lago/raw/`, comandos `curl` de prueba y verificación de cero llaves en el historial de Git).
7. `## Herramienta elegida para las vistas` (Justificación de HTML/JS + MapLibre GL frente a alternativas).
8. `## Nuestra posición` (1 reflexión de gestión/gobierno de datos sobre licencias KOGL Tipo 1 y cambios de licencias de herramientas en 2026; 1 reflexión de ciberseguridad/privacidad sobre el riesgo de vigilancia en datos de afluencia cada 5 minutos en Seúl).
9. `## Bitácora de IA` (Tabla completa con los 5 encargos documentados por el grupo en el Excel —Claude, ChatGPT y Kiro— más la generación y auditoría de scripts, incluyendo la columna obligatoria **«Qué le corregimos»**).
10. `## Revisión cruzada` (Instrucciones y plantilla lista para la auditoría de 3 cifras y el ataque autorizado en clase).

---

## 10. PLAN DE EJECUCIÓN PASO A PASO PARA EL AGENTE

Ejecuta las tareas en este orden sin pedir confirmación intermedia:

1. Crea la estructura de directorios y el archivo `.gitignore`.
2. Genera `catalogo/catalogo.json` con las 14 fuentes (`F01`–`F14`).
3. Descarga `territorio/seoul_gu.geojson` desde `https://raw.githubusercontent.com/southkorea/seoul-maps/master/kostat/2013/json/seoul_municipalities_geo_simple.json` (con fallback local de los 25 *gu* si no hay red).
4. Crea los scripts de ingesta en `ingesta/` (`pull_escucha.py`, `pull_seoul_open.py`, `pull_realtime.py`, `pull_kosis.py`) y ejecútalos para poblar `lago/*.json`.
5. Crea `verificacion/verificar.py` y ejecútalo. Corrige cualquier discrepancia hasta obtener `0 fallos`.
6. Crea los scripts comparativos en `explorar/` para respaldar la Bitácora de Exploración.
7. Crea la compuerta en `api/` y la aplicación interactiva en `web/` (`index.html`, `estilos.css`, `app.js`) verificando que cada cifra provenga de `lago/*.json`.
8. Escribe el `README.md` completo con todas las tablas y bitácoras llenas.
9. Ejecuta la prueba final de reproducibilidad (`rm -rf lago/*.json && for s in ingesta/pull_*.py; do python3 "$s"; done && python3 verificacion/verificar.py`) y confirma que todo pasa sin errores.
