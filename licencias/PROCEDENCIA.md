# Recursos incluidos

Descargados el 24 de septiembre de 2026. No se descargan recursos al abrir la aplicación.

- Three.js 0.160.1: https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.min.js
- Licencia Three.js: https://cdn.jsdelivr.net/npm/three@0.160.1/LICENSE
- D3 7.9.0: https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js
- Licencia D3: https://cdn.jsdelivr.net/npm/d3@7.9.0/LICENSE
- World Atlas 2.0.2: https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json
- Licencia World Atlas: https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/LICENSE
- Fuente de los datos geográficos: Natural Earth, cartografía de dominio público: https://www.naturalearthdata.com/about/terms-of-use/

`datos/mapa.js` contiene el mismo TopoJSON envuelto en una asignación JavaScript para cargar desde el sistema de archivos. D3 proyecta los polígonos a una textura equirectangular local. No se incluyen fotos, imágenes de satélite, tipografías ni recursos visuales descargados de otros proveedores.

El catálogo contiene una selección propia de coordenadas orientativas y descripciones geográficas breves, no un nomenclátor exhaustivo ni una fuente académica histórica. Las etiquetas de países y regiones son ayudas de navegación.

## Incorporaciones v0.2

- Relieve: SRTM15+ v2.7, Tozer et al. (2019), https://doi.org/10.1029/2019EA000658 ; dataset publicado con CC BY 4.0: https://figshare.com/articles/online_resource/Tozer_et_al_2019_SRTM15_GMT_Grids/7979780 ; licencia: https://creativecommons.org/licenses/by/4.0/
- Distribución reducida por GMT: https://oceania.generic-mapping-tools.org/server/earth/earth_relief/earth_relief_10m_p.grd . Metadatos: SRTM15 Earth Relief v2.7, 10 arc minutes, Gaussian filtering 52.4 km fullwidth, unidades metros con scale_factor 0.5. Modificaciones: aplicar escala, redondear a metros int16, ordenar filas norte-sur y envolver como JS base64; clasificar con paleta propia y sombrear opcionalmente. Descripción: https://www.generic-mapping-tools.org/remote-datasets/earth-relief.html
- Ríos y lagos Natural Earth (dominio público): https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_rivers_lake_centerlines.geojson y https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_lakes.geojson . Se conservan geometrías y nombres; se quitan atributos no usados.
- Vosk Browser 0.0.8: https://cdn.jsdelivr.net/npm/vosk-browser@0.0.8/dist/vosk.js ; Apache 2.0, COPYING y NOTICE locales. Incluye WebAssembly y dependencias enumeradas en NOTICE.
- Modelo español: https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip , licencia Apache 2.0 según https://alphacephei.com/vosk/models . Se reempaquetó de ZIP a tar.gz con raíz model para Vosk Browser, sin modificar los pesos. README original incluido.
- Fichas territoriales: redacción didáctica propia, inferencias generales sobre pendientes, agua, corredores y aridez. Anclas manuales orientativas; no son polígonos de extensión. Referencia complementaria para Andes y contrastes de vertientes: https://science.nasa.gov/earth/earth-observatory/bolivian-andes-8830/ . No se reproduce texto de esa fuente.
- tests/comando-sintetico.wav: muestra generada localmente con la voz del sistema Microsoft Helena, frase «Globo. Ir a Roma.», utilizada exclusivamente como fixture de prueba. No contiene la voz ni una grabación del usuario.

Descargas efectuadas el 24/09/2026. Ningún recurso se descarga de Internet al ejecutar la aplicación.

## Incorporaciones v0.3

- Países y territorios Natural Earth 1:50m, dominio público: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson . Descargado 24/09/2026. 242 geometrías. Se conservan geometrías, ADM0_A3, NAME_ES, NAME_LONG, LABEL_X/Y, CONTINENT y SUBREGION en un empaquetado JavaScript local.
- Continentes y subregiones: agrupaciones de esas geometrías por CONTINENT/SUBREGION; sin cortar países transcontinentales. Traducciones y alias de navegación propios. Las divisiones y los territorios disputados mantienen la representación de la fuente, no una afirmación del estado jurídico.
- El catálogo combina estos registros con los destinos de v0.2, unificando Argentina y Egipto y evitando nombres de grupos repetidos: 315 entradas.
- tests/multiseleccion-sintetica.wav: voz sintética local Microsoft Helena, frase «Globo. Seleccionar Argentina y Chile y Perú.». Solo prueba automatizada; no contiene audio del usuario.


## Ampliación 0.4
Fuentes: Natural Earth, países 50m con 16 territorios adicionales de 10m; áreas marinas y ríos 50m. Dominio público: https://github.com/nvkelso/natural-earth-vector/tree/master/geojson . Tramos agrupados por nombre; traducciones propias de nombres comunes, otros nombres conservados. Áreas marinas sin significado jurisdiccional.

Recorridos de circulación esquemáticos propios basados en el mapa NOAA https://www.vos.noaa.gov/docs/marine_info_guide.pdf y los cinturones NOAA/NWS https://www.weather.gov/media/ohx/PDF/Weather101GlobalCirculations.pdf . Alisios: https://oceanservice.noaa.gov/facts/tradewinds.html . No se redistribuyen las ilustraciones ni se consultan servicios al usar la aplicación.


## Ampliación 0.4.1
Países constituyentes británicos: geometrías de Natural Earth, dominio público, ne_10m_admin_0_map_units.geojson; extraídas por GU_A3 WLS, SCT, ENG y NIR. Fuente https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_0_map_units.geojson ; explicación https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-details/ . Ormuz: coordenada orientativa 26.566667 N, 56.25 E, gazetteer NGA reproducido en https://geographic.org/geographic_names/name.php?c=oman&fid=4000&uni=-1134197 . No se representa una superficie legal ni de navegación.


## Ampliación 0.4.2
Natural Earth, dominio público: ne_10m_rivers_lake_centerlines.geojson y ne_10m_lakes.geojson, https://github.com/nvkelso/natural-earth-vector/tree/master/geojson . Tramos agrupados por nombre normalizando espacios, traducciones comunes propias; se conservan tramos 50m cuyos nombres no figuran en 10m. Lagos seleccionados por scalerank <= 4 y mar Muerto; partes de un mismo nombre agrupadas. Embalses y lagos naturales comparten categoría. Nombres propios menos comunes se conservan según la fuente. Datos modernos, sin reconstrucción histórica. Notas educativas de orientación general, sin cronologías ni límites antiguos.


## Explorador histórico 0.5 — 26/09/2026
Síntesis originales y coordenadas representativas aproximadas. Fuentes seleccionadas por ficha en HISTORIA.md, HISTORIA.html y datos/historia.js. No se redistribuyen artículos completos ni imágenes. Las fechas son marcos de estudio, y los enlaces entre nodos son diagramas geográficos editoriales, no digitalizaciones de rutas históricas. Los recursos son ejemplos cualitativos; procedencia, producción e intercambios varían por lugar y período.


## Gestos 0.6 — 16/10/2026
- MediaPipe Tasks Vision 0.10.21, Google: https://registry.npmjs.org/@mediapipe/tasks-vision/-/tasks-vision-0.10.21.tgz . Se redistribuyen vision_bundle.mjs y los runtimes WASM SIMD/no SIMD sin modificaciones. Apache-2.0; texto en mediapipe-APACHE.txt y documentación original en mediapipe-README.md.
- Modelo Hand Landmarker float16 v1: https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task . Contiene detector de palma y landmarks. Apache-2.0 según la ficha oficial: https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Hand%20Tracking%20%28Lite_Full%29%20with%20Fairness%20Oct%202021.pdf . Modelo original sin modificaciones.
- Documentación: https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js . Descargas solo durante preparación del proyecto; el uso normal no consulta esos servidores.
- Algoritmo de pinza, interfaz y coordinación del trabajador: código propio, MIT. No se incluyen videos personales ni imágenes de cámaras reales.


## Capas temporales 0.7 · 17/10/2026
Historical Basemaps, A. Ourednik y colaboradores: https://github.com/aourednik/historical-basemaps . Revisión fijada da7a4b735ecef70aebdc9c73e409d8a2500d50f3. Archivos de origen geojson/world_bc500.geojson, world_bc323.geojson y world_200.geojson. Licencia publicada GPL-3.0, copiada íntegramente en historical-basemaps-GPL-3.0.txt. La selección derivada en datos/epocas/*.geojson y datos/epocas-geometrias.js conserva GPL-3.0 y no se ofrece como MIT. Código propio separado MIT.

Cambios: filtro explícito de entidades en el Mediterráneo y Cercano Oriente; se conservan coordenadas y propiedades originales en los GeoJSON. En pantalla se agrupan entidades con el mismo NAME, se traducen etiquetas, se asignan colores y se invierte la orientación de anillos cuando D3 lo requiere. Generador reproducible: tools/preparar-epocas.py. Esta edición es una selección propia, sin aval de los autores originales. El repositorio de origen advierte que está en elaboración y recomienda contrastar con otras fuentes.

Ciudades, recursos y conexiones: selección editorial propia con coordenadas representativas, textos breves y fuentes por corte en datos/epocas.js. Contraste general con The Met (Persia y Roma), OpenStax (Alejandro), Encyclopaedia Iranica (comercio aqueménida) y materiales educativos ya citados en las fichas. No se redistribuyen los artículos ni imágenes. Los enlaces representan conexiones del período; no trazados navegables ni redes exhaustivas de un año exacto. Los recursos son ejemplos regionales, no cantidades ni censos de explotaciones.
