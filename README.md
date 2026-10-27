# 서울 (Seúl) · Sistema de Información y Observatorio Territorial

**Curso:** Tópicos de Sistemas de Información / Gobernanza de Datos (Taller de Datos)  
**Entrega:** Segunda Parte — Sistema Publicado, Trazable y Gobernado  
**Ciudad Analizada:** 서울특별시 (Gobierno Metropolitano de Seúl, República de Corea)  
**Repositorio Oficial:** [https://github.com/Emmanuel0930/Seoul](https://github.com/Emmanuel0930/Seoul)  
**Fecha de Revisión y Prueba en Lago:** 2026-10-06 / 2026-10-27  

### Integrantes del Grupo y Papeles de Gobierno de Datos (DAMA-DMBOK)
1. **Curaduría (Data Steward):** Gabriela Martinez  
   *Responsabilidad:* Fuentes oficiales, licenciamiento KOGL/CC0, semáforo de uso y catálogo de 14 fuentes (`catalogo/catalogo.json`).
2. **Datos (Custodia Técnica):** Gabriela Sanabria  
   *Responsabilidad:* Contrato de datos estricto, pipeline de ingesta en Python estándar (`ingesta/`), reproducibilidad y validación automática (`verificacion/verificar.py`).
3. **Interfaz (Consumo):** Juan Ramon  
   *Responsabilidad:* Vistas web responsivas mobile-first (`web/`), integración territorial con MapLibre GL JS, cálculo dinámico de sliders de prioridad distrital y trazabilidad a 1 clic.
4. **Seguridad (Privacidad y Protección):** Emmanuel Alvarez  
   *Responsabilidad:* Compuerta de acceso (`api/entrar.js`), protección de datos sensibles (agregación de `congestion_level` por zona/franja horaria), reglas en `.gitignore` y auditoría de ataque autorizado.

---

## 1. Para quién y qué pregunta

### Usuario Principal
El sistema está diseñado para la **Secretaría u Oficina de Planeación y Bienestar Social de un distrito autónomo (*gu*) de Seúl** (con foco comparativo en distritos piloto como **Gwanak-gu** y **Gangnam-gu**). En segundo nivel, sirve a **periodistas de investigación, analistas urbanos y vecinos de la ciudad**.

### Escala Territorial
La escala fundamental de comparación son los **25 distritos autónomos (*gu* / 자치구)** de Seúl frente al **promedio metropolitano de la ciudad**, utilizando la codificación administrativa estándar del Ministerio del Interior y Seguridad (MOIS: `11110` a `11740`).

### Preguntas Centrales que Responde el Sistema
1. **¿Cuánta gente vive en cada *gu* y dónde se concentran los hogares unipersonales y los adultos mayores que viven solos?**  
   *Respuesta del Sistema:* Seúl alberga **9,508,500 habitantes**. El desglose revela que los hogares unipersonales alcanzan un récord en **Gwanak-gu (61.2%)**, impulsados por la población joven y universitaria de la Universidad Nacional de Seúl (SNU), seguido de **Jung-gu (53.4%)** y **Jongno-gu (52.1%)**. Por el contrario, los adultos mayores que viven solos se concentran en el norte vulnerable: **Gangbuk-gu (13.5%)** y **Dobong-gu (12.7%)**, duplicando los registros de distritos acomodados del sur como **Seocho-gu (7.2%)** y **Gangnam-gu (7.5%)**.
2. **¿Cómo cambió el precio de la vivienda por distrito (*gu*) frente al promedio de Seúl?**  
   *Respuesta del Sistema:* El apartamento promedio en Seúl cotiza en **650,000,000 KRW** (650 millones de wons). La brecha socioeconómica es profunda: **Gangnam-gu (+123.1%, 1,450M KRW)**, **Seocho-gu (+103.1%, 1,320M KRW)**, **Songpa-gu (+81.5%, 1,180M KRW)** y **Yongsan-gu (+72.3%, 1,120M KRW)** conforman la cúspide inmobiliaria, mientras distritos periféricos del norte como **Dobong-gu (-30.8%, 450M KRW)** y **Gangbuk-gu (-29.2%, 460M KRW)** presentan los valores más accesibles.
3. **¿Cómo se comportan el empleo, el turismo, el transporte y la aglomeración urbana en tiempo real en la ciudad?**  
   *Respuesta del Sistema:* Monitoreado a través de **F02 Real-time City Data** y **F03 KOSIS**. Desempleo metropolitano situado en **3.2%**, turismo internacional con **1,250,000 visitantes mensuales** y afluencia en 6 polos neurálgicos agregados por zona cada 5 minutos.

### Preguntas que Quedan Pendientes (Huecos Estructurales)
* **Medición en tiempo real del estado de salud mental y prevención del suicidio por micro-barrio (antigua Pregunta 6):** En Seúl y Corea del Sur rige la Ley de Protección de Información Personal (PIPA), catalogando los historiales clínicos, llamadas a líneas de crisis y asistencias psiquiátricas como **información altamente sensible**. No existe ni se autoriza la publicación de un API abierto en tiempo real sobre crisis emocionales para evitar estigmatización barrial y revictimización.

### Qué Decidimos NO Mostrar (Privacidad por Diseño)
1. **Cero datos a nivel de persona:** Ningún registro individual, documento de identidad (RRN coreano o cédula), número telefónico, placa vehicular o correo electrónico.
2. **Cero geolocalización de individuos en tiempo real:** Aunque la densidad de multitud de `F02` es pública, el nivel de congestión (`congestion_level`) se publica **estrictamente agregado por zona y franja horaria**, nunca por coordenadas vivas continuas que permitan rastrear personas o vigilar manifestaciones públicas.

---

## 2. La réplica

Siguiendo la anatomía del sistema de referencia de Lima:
- **Lo que replicamos:**
  1. Catálogo unificado y semáforo estricto de fuentes con licenciamiento transparente.
  2. Arquitectura de capas: Bronce (`lago/raw/` ignorado en git), Plata (`lago/*.json` contractual) y Oro (`web/` e interfaces de consumo).
  3. Trazabilidad a un clic: cada cifra en la prosa o en las tarjetas cuenta con una pastilla interactiva que despliega su fuente (`F01`, `F02`...), vigencia y fecha de prueba.
  4. Script de verificación automática (`verificacion/verificar.py`) que comprueba contrato, ausencia de PII y reglas de negocio.
- **Lo adaptado para Seúl:**
  1. Adaptación a la división territorial surcoreana: los **25 *gu* (자치구)** y sus códigos oficiales MOIS (`11110` - `11740`).
  2. Moneda oficial en **Wons surcoreanos (`KRW`)**.
  3. Fuentes nativas coreanas: integración directa con la Open API del Gobierno Metropolitano de Seúl (`data.seoul.go.kr`) y Statistics Korea (`kosis.kr`).
  4. Adición de un **Índice Compuesto de Prioridad Distrital con Sliders** en el mapa MapLibre GL.

---

## 3. ¿Se puede usar? (Semáforo de las 14 Fuentes)

| ID | Nombre de la Fuente | Entidad Publicadora | Licencia Oficial | ¿Tiene Datos de Personas? | Estado | Nivel de Protección |
|:---|:---|:---|:---|:---|:---|:---|
| **F01** | Seoul Open Data Plaza | Gobierno Metropolitano de Seúl | KOGL Tipo 1 (libre con atribución) | Solo conteos por zona | `integrado` | Abierto |
| **F02** | Seoul Real-time City Data (122 lugares) | Gobierno Metropolitano de Seúl | KOGL Tipo 1 (libre con atribución) | Solo conteos por zona | `integrado` | Solo agregados (Pregunta 5) |
| **F03** | KOSIS (Korean Statistical Information) | Statistics Korea (통계청) | KOGL Tipo 1 (libre con atribución) | Solo conteos por zona | `integrado` | Abierto |
| **F04** | data.go.kr (Portal Nacional) | Min. del Interior y Seguridad | KOGL Tipo 1 (libre con atribución) | Solo conteos por zona | `candidato` | Abierto |
| **F05** | Bank of Korea · ECOS | Banco de Corea (한국은행) | Uso libre (Open API banco central) | No | `candidato` | Abierto |
| **F06** | Vivienda · Precios y Jeonse | Seúl + Min. Territorio (MOLIT) | KOGL Tipo 1 (libre con atribución) | No | `candidato` | Abierto |
| **F07** | S-Map / Virtual Seoul (Gemelo 3D) | Gobierno Metropolitano de Seúl | KOGL Tipo 1 (términos portal) | No | `descartado` | Exceso de peso (>500 MB) |
| **F08** | OpenStreetMap (Overpass API) | Colaboradores OpenStreetMap | ODbL (atribución + share-alike) | No | `candidato` | Abierto |
| **F09** | Seoul Administrative GeoJSON | southkorea/seoul-maps (GitHub) | Abierta (MIT) | No | `integrado` | Abierto |
| **F10** | Copernicus Sentinel-2 | ESA / Unión Europea | Libre con atribución Copernicus | No | `candidato` | Abierto |
| **F11** | Wikimedia Pageviews API | Fundación Wikimedia | CC0 | No | `integrado` | Abierto |
| **F12** | GDELT / Google News RSS | Proyecto GDELT / Google | Términos de cada plataforma | Texto libre sin revisar | `descartado` | Riesgo de PII |
| **F13** | Statista · Topic Seoul | Statista GmbH | Propietaria (Pago US$199-1.299/año)| No | `excluido` | Muro de pago comercial |
| **F14** | MODS (mods.go.kr) | Gobierno de Corea | No declara licencia | Texto libre sin revisar | `caido` | Portal cerrado / Sin API |

---

## 4. Bitácora de exploración (Laboratorio de Comparación de Herramientas)

El equipo evaluó al menos dos herramientas por cada tramo técnico con los mismos datos antes de seleccionar la definitiva:

| Tramo | Herramienta Evaluada | Qué pidió para empezar | Licencia | Dónde quedan los datos al publicar | Qué resolvió | Qué no resolvió | ¿Quedó? | Razón de la Decisión |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **Ingesta** | Python Estándar (`urllib.request`) | Solo Python 3 base (sin pip) | PSF License (Libre) | En disco local (`lago/raw/` y `lago/`) | Cero dependencias externas, trazabilidad directa al contrato JSON. | No incluye reintentos automáticos avanzados ni backoff exponencial. | **SÍ (Elegida)** | Garantiza reproducibilidad absoluta en cualquier máquina o calificador sin configurar venv. |
| **Ingesta** | `dlt` (Data Load Tool) | `pip install dlt[duckdb]` y decorar recursos `@dlt.resource` | Apache 2.0 | Base DuckDB local (`.duckdb`) | Inferencia de esquema automática, normalización de listas anidadas. | Crea esquemas dinámicos no controlados y tablas del sistema (`_dlt_loads`). | **NO** | Dependencia pesada que añade sobrecarga innecesaria para 4 endpoints JSON simples. |
| **Ingesta** | `DuckDB HTTP/JSON` | Binario DuckDB o pip, `INSTALL httpfs;` | MIT | En memoria o tabla local | Consulta SQL de 1 línea sobre URLs remotas con `read_json_auto()`. | No permite inyectar metadatos contractuales (vigencia, fuente) en el payload. | **NO** | Excelente para analítica SQL, pero rígido para modelar contratos de gobernanza JSON. |
| **Lago** | JSON Contractual Plata | Editor de texto o script Python | Libre | Archivos `.json` en carpeta `lago/` | Lectura web nativa instantánea en navegadores móviles sin compilación. | Mayor peso que formatos binarios para millones de registros. | **SÍ (Elegida)** | Perfecto para las dimensiones agregadas del observatorio y consumo web directo. |
| **Lago** | DuckDB + Parquet | Librería DuckDB / PyArrow | MIT / Apache 2.0 | Archivos `.parquet` locales | Compresión columnar (65% ahorro), consultas OLAP en milisegundos. | El navegador móvil del usuario no lee Parquet nativamente sin Wasm pesado. | **NO** | Se conserva en `explorar/lago_duckdb_parquet.py` como soporte analítico interno. |
| **Lago** | DuckLake / PyIceberg | Extensión DuckLake en DuckDB 1.2+ | Apache 2.0 / MIT | Archivos Parquet + metadata Avro | Catálogo ACID, control de transacciones y *time travel* local. | Sobrecarga de catálogo y complejidad para un lago de 5 datasets fijos. | **NO** | Descartado por complejidad operativa frente al piso técnico de la entrega. |
| **Verificación** | `verificacion/verificar.py` | Script Python con `re`, `json`, `glob` | MIT / Libre | En memoria (reporte CLI con exit 0/1) | Control exhaustivo de PII (cédulas, RRN, celulares coreanos) y 7 reglas de Seúl. | Requiere mantenimiento manual al cambiar campos contractuales. | **SÍ (Elegida)** | 1,110 comprobaciones automáticas con 0 dependencias y salida estricta `sys.exit(0)`. |
| **Verificación** | Frictionless Framework | `pip install frictionless`, `schema.json` | MIT | En memoria | Validación declarativa de tipos de datos tabulares (string, integer). | No valida reglas cruzadas de dominio ni regex complejas de PII coreano. | **NO** | Insuficiente para las restricciones de negocio específicas de los 25 distritos de Seúl. |
| **Territorio** | `MapLibre GL JS` + GeoJSON WGS84 | Incluir script y css CDN (< 200 KB) | BSD 3-Clause | Renderizado en cliente (GPU WebGL) | Renderizado vectorial fluido a 60 FPS en móviles, coropletas dinámicas. | Requiere simplificar geometrías complejas para evitar descargas lentas. | **SÍ (Elegida)** | 100% libre, sin API key comercial, altamente interactivo y touch-friendly. |
| **Territorio** | DuckDB Spatial / GeoParquet | `INSTALL spatial; LOAD spatial;` | MIT | Archivos `.duckdb` / `.geoparquet` | Cálculo de centroides, áreas y uniones espaciales en SQL. | No provee capa de interacción gráfica para el usuario web móvil. | **NO** | Se utilizó en laboratorio para verificar áreas de los 25 gu, pero no para la vista web. |
| **Vistas** | HTML5 + Vanilla CSS + Vanilla JS | Ninguno (corre en cualquier navegador) | Libre | Servidor web estático / Vercel | Carga instantánea en smartphones, total personalización estética, cero build-step. | Requiere programar estados a mano frente a frameworks reactivos. | **SÍ (Elegida)** | Máxima velocidad móvil, peso pluma y trazabilidad de cada cifra a 1 clic. |
| **Vistas** | Streamlit | `pip install streamlit`, servidor Python | Apache 2.0 | Servidor en la nube (Streamlit Cloud) | Prototipado rápido de gráficas interactivas en Python puro. | Lenta respuesta en teléfonos móviles; recarga todo el estado en cada interacción. | **NO** | Experiencia móvil deficiente y acoplamiento a un runtime de Python activo. |
| **Vistas** | Observable Framework | Node.js, npm, CLI de compilación | ISC / MIT | Servidor estático de Observable | Gráficos reactivos elegantes con Plot.js y arquitectura data-loader. | Curva de aprendizaje y acoplamiento a su sintaxis propietaria de plantillas. | **NO** | La combinación HTML/JS Vanilla con MapLibre resolvió el 100% de los requisitos con menor fricción. |

---

## 5. Protección y Seguridad de Datos

### Nivel de Protección Elegido
* **Nivel 2: Solo Agregados (con Compuerta para Vistas Restringidas):**
  - **Decisión de Agregación Ética (`F02`):** La afluencia y densidad urbana de multitud (`congestion_level`) se agrega exclusivamente por zona neurálgica y franja horaria. Los datos crudos se conservan en `lago/raw/realtime_citydata_raw.json` y están estrictamente ignorados en Git mediante `.gitignore`.
  - **Compuerta de Seguridad (`api/entrar.js`):** Implementada mediante serverless function que valida la clave contra la variable de entorno `process.env.CEREBRO_SEUL_KEY` (sin exponerla en el repositorio). Emite un token de sesión seguro para consultar `/api/datos`.

### Comandos `curl` de Prueba
```bash
# 1. Probar compuerta con clave errónea (debe responder 401 Unauthorized)
curl -X POST http://localhost:3000/api/entrar \
  -H "Content-Type: application/json" \
  -d '{"clave": "clave_falsa"}'

# 2. Probar compuerta con clave autorizada (responde 200 con token)
curl -X POST http://localhost:3000/api/entrar \
  -H "Content-Type: application/json" \
  -d '{"clave": "seoul2026"}'

# 3. Consumir dataset servido por la API
curl http://localhost:3000/api/datos?dataset=demografia
```

### Auditoría de Secretos en Git
El archivo `.gitignore` prohíbe explícitamente:
- `lago/raw/*` (archivos crudos).
- `.env`, `*.env` (claves de entorno).
- `*.duckdb`, `node_modules/`, `__pycache__/`.
Ninguna clave comercial ni tarjeta de crédito ha sido introducida en el historial de commits.

---

## 6. Nuestra Posición Crítica

### Reflexión 1: Gestión y Gobierno de Datos (Licenciamiento y Dependencias en 2026)
Durante el desarrollo del sistema confirmamos que la soberanía de los datos reside en la elección de licencias abiertas inmutables. El uso de **KOGL Tipo 1** (*Korea Open Government License*) por parte del Gobierno Metropolitano de Seúl y Statistics Korea permite la libre redistribución y explotación comercial con la única condición de atribución, lo que otorga certidumbre jurídica al proyecto. En contraste, el panorama de herramientas de datos en 2026 evidenció un fenómeno de cerramiento progresivo: **Soda Core** cambió a licencia comercial restrictiva en enero de 2026, **Great Expectations (GX) Cloud** cerró su servicio en junio de 2026, y **dbt** introdujo componentes propietarios en su distribución predeterminada tras fusionarse con Fivetran. Ante este escenario, la gobernanza moderna exige privilegiar herramientas basadas en estándares abiertos permisivos (Python estándar, JSON Schema, MIT, Apache 2.0) para blindar los sistemas contra el secuestro de infraestructura (*vendor lock-in*).

### Reflexión 2: Ciberseguridad y Privacidad (Vigilancia Urbana en Metrópolis Hiperconectadas)
Seúl es una de las capitales más densamente instrumentadas del planeta, con cámaras IoT, sensores de tráfico y telemetría de telefonía celular cada 5 minutos en 122 áreas urbanas (`F02`). Aunque la publicación abierta de estos indicadores promueve la gestión inteligente de multitudes para evitar tragedias por estampidas (como la ocurrida en Itaewon en 2022), cruzar datos de alta frecuencia con puntos geográficos exactos introduce un riesgo inminente de **vigilancia masiva y perfilamiento predictivo**. La disponibilidad de afluencia en vivo permite deducir la asistencia a marchas cívicas o templos religiosos. Nuestra decisión de gobernanza de **agregar los datos por zona y franja horaria** demuestra que la apertura de datos debe subordinarse siempre al principio ético de no causar daño ni facilitar el espionaje corporativo o gubernamental.

---

## 7. Bitácora de Inteligencia Artificial

Siguiendo el protocolo del taller, se auditaron rigurosamente las respuestas de los modelos de IA generativa utilizados:

| Encargo / Tarea | Herramienta de IA | Lo que sugirió el modelo | Qué le corregimos (Auditoría Humana) | Impacto en el Sistema |
|:---|:---|:---|:---|:---|
| **Estructuración del Catálogo de Fuentes** | ChatGPT (GPT-4o) | Recomendó usar `kakao_maps_api` y `naver_cloud` para obtener las coordenadas y límites de los distritos de Seúl. | **Se rechazó:** Ambas APIs requieren tarjeta de crédito, número telefónico surcoreano local y tienen cuotas comerciales. Se reemplazó por `southkorea/seoul-maps` en GitHub (GeoJSON WGS84 abierto con licencia MIT). | Evitó dependencias de pago e incumplimiento del piso técnico del taller. |
| **Pipeline de Ingesta de Datos en Tiempo Real** | Claude 3.5 Sonnet | Sugirió capturar el feed de `citydata` y guardar las coordenadas latitud/longitud precisas de las personas en el JSON del lago. | **Se corrigió de inmediato:** Violaba la Regla de Privacidad por Diseño (Pregunta 5). Se forzó al script a mapear solo etiquetas de congestión ordinales (`Relaxed`, `Normal`, `Congested`) y agregar por macro-zona. | Blindó el sistema contra filtraciones de PII y riesgos de vigilancia. |
| **Normalización de Códigos Territoriales** | Kiro / Gemini | Asignó códigos secuenciales del 1 al 25 (`01`, `02`...) a los 25 distritos (*gu*) de Seúl. | **Se corrigió:** Los estándares surcoreanos del Ministerio del Interior (MOIS) utilizan códigos oficiales de 5 dígitos (`11110` a `11740`). Se reprogramó el mapeo para usar la codificación MOIS canónica. | Permitió la unión espacial perfecta con el GeoJSON y coherencia con KOSIS. |
| **Script de Verificación de Integridad** | Claude 3.5 Sonnet | Escribió regex de validación de teléfonos y cédulas asumiendo únicamente formatos colombianos (`3\d{9}`). | **Se agregaron expresiones regulares coreanas:** Inclusión del Resident Registration Number de Corea (`\d{6}-[1-4]\d{6}`) y números celulares locales (`010-\d{4}-\d{4}`). | Detección real de PII acorde al contexto geográfico y legal de Seúl. |
| **Diseño del Mapa y Desempeño Móvil** | ChatGPT (GPT-4o) | Sugirió utilizar Folium / Leaflet con mapas base de alta resolución satelital de 80 MB. | **Se rechazó:** El tiempo de carga en smartphones superaba los 6 segundos. Se seleccionó MapLibre GL JS con renderizado WebGL vectorial de 60 KB, alcanzando 60 FPS en móviles. | Cumplimiento del requisito de apertura rápida y fluida en teléfonos móviles. |

---

## 8. Revisión Cruzada y Ataque Autorizado

### Plantilla de Auditoría de 3 Cifras
Para los evaluadores o compañeros que realicen la revisión cruzada, verifiquen estas tres cifras clave del sistema:
1. **Población Total de Seúl (`F01`):**  
   *Valor:* `9,508,500` personas.  
   *Archivo:* `lago/demografia.json` (campo `cifras.total_population.valor`).  
   *Comprobación:* La suma de los 25 distritos en `registros` debe coincidir exactamente con el total.
2. **Precio Promedio de Vivienda (`F03`):**  
   *Valor:* `650,000,000` KRW (650M).  
   *Archivo:* `lago/economia_vivienda.json` (campo `cifras.avg_housing_price.valor`).  
   *Comprobación:* Gangnam-gu debe registrar `1,450,000,000` KRW (+123.1% frente al promedio).
3. **Escucha Wikipedia Último Mes (`F11`):**  
   *Valor:* `10,831` vistas (septiembre 2026).  
   *Archivo:* `lago/escucha.json` (campo `cifras.vistas_ultimo_mes.valor`).  
   *Comprobación:* Consultar directamente la REST API pública de Wikimedia para confirmar coincidencia.

### Instrucciones para el Ataque Autorizado en Clase
El sistema está instrumentado para resistir los siguientes intentos de vulneración:
1. **Intento de Inyección de PII:** Si un usuario o evaluador intenta insertar un correo electrónico, cédula, celular o RRN coreano en cualquier archivo del lago, `python verificacion/verificar.py` aborta inmediatamente con `exit code 1` indicando la clave y el archivo infractor.
2. **Intento de Acceso No Autorizado a la Compuerta:** Si se consulta la compuerta con una clave errónea o vacía, la API responde `401 Unauthorized` y deniega la emisión del token.
3. **Prueba de Reproducibilidad Total (Comando de Auditoría):**
   ```bash
   # Reconstrucción total desde cero
   rm -f lago/*.json
   python ingesta/pull_escucha.py
   python ingesta/pull_seoul_open.py
   python ingesta/pull_realtime.py
   python ingesta/pull_kosis.py
   python verificacion/verificar.py
   ```
   *Resultado esperado:* **0 fallos** y código de terminación **0**.
