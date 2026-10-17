# Globo Histórico 0.6.2 · Giro y zoom por gestos

Aplicación educativa portable: globo 3D, geografía e historia con comandos de texto, mouse y reconocimiento de voz en español. Funciona localmente, sin suscripciones ni APIs pagas. Las bibliotecas, los datos y el modelo de voz vienen incluidos.

## Descargar y abrir

1. En GitHub, elegí **Code → Download ZIP** y extraé el archivo completo.
2. En Windows, ejecutá **INICIAR-CON-VOZ.cmd**. Se abrirá el navegador con el servidor local.
3. Pulsá **Activar voz**, autorizá el micrófono y probá «Globo, ir a Roma» o «Globo, seleccionar Argentina y Chile».
4. Para cerrar el servidor, ejecutá **DETENER-SERVIDOR.cmd**. Podés crear el acceso directo con **CREAR-ACCESO-DIRECTO.cmd**.

Para explorar sin voz, abrí **index.html** con doble clic. En otros sistemas, serví esta carpeta con un servidor HTTP en localhost. Se necesita un navegador con WebGL y, para la voz, acceso al micrófono. No hace falta Internet después de descargar el proyecto; los enlaces a fuentes externas sí lo requieren.

Documentación: [Comandos](COMANDOS.md) · [Historia y economía](HISTORIA.md) · [Verificaciones](VERIFICACION.md) · [Procedencia y licencias](licencias/PROCEDENCIA.md).

El código propio usa la [licencia MIT](LICENCIA.txt); los recursos de terceros conservan sus respectivas licencias.

## Zoom con los dedos (0.6)

Abrí el acceso directo o **INICIAR-CON-VOZ.cmd**, pulsá **Activar gestos** y permití la cámara. Si tenías una versión anterior abierta, ejecutá primero **DETENER-SERVIDOR.cmd** y volvé a abrir: el servidor también se actualizó.

- Mostrá una sola mano completa, con buena luz y la palma hacia la cámara.
- **Mano abierta con los dedos extendidos:** mantenela un instante y movela a izquierda o derecha para girar el globo. El giro sigue la mano como se ve en la cámara en espejo, con límite de velocidad y filtro de temblores.
- **Después de usar el zoom:** cerrá y volvé a abrir la mano para regresar al giro. El giro y el zoom no se aplican simultáneamente.
- Juntá pulgar e índice durante un instante, con los otros dedos extendidos, para tomar el zoom.
- Separalos para agrandar el globo; acercalos para achicarlo.
- Cerrá la mano o sacala de cámara para soltar. Podés repetir la pinza para continuar.
- **Detener gestos**, **Apagar**, Escape o salir de la pestaña apaga la cámara. La guía y la vista de cámara son desplegables.

La cámara comienza apagada. El detector no solicita audio, no graba ni envía imágenes. Voz y gestos se activan por separado. Mouse, teclado y comandos siguen disponibles. El procesamiento se realiza en un trabajador del navegador a un máximo aproximado de 12 fotogramas por segundo; no bloquea el dibujo del globo. La separación se normaliza por el tamaño de la palma y el zoom tiene suavizado y límites.

MediaPipe Tasks Vision 0.10.21, sus dos variantes WASM y el modelo Hand Landmarker float16 v1 vienen incluidos: no se descargan al usarlo. Para cámara necesitás localhost o HTTPS; abrir index.html directamente mantiene el mapa, pero muestra cómo iniciar los gestos. Probado en Edge con cámara sintética; queda por evaluar la comodidad con tu cámara, iluminación y gestos reales. La detección puede fallar con oclusiones, poca luz o varias manos.

Pruebas: `node tests/gestos.test.cjs` y `node tests/gestos-browser.test.cjs` (esta última requiere Playwright y Edge). Detalles de dependencias: [licencias](licencias/PROCEDENCIA.md).

## Novedades de la versión 0.5

35 fichas, 111 entradas de asentamientos/nodos por período (91 ubicaciones de referencia) y 30 redes esquemáticas. Total del catálogo: 1835 entradas. Un mismo lugar puede tener fichas distintas en varios períodos.

Abrí **Historia** en la barra superior. Elegí período y sociedad, desplegá **Recursos económicos** y seleccioná asentamientos o redes mediante casillas. Producción, intercambios/importaciones y formas de trabajo tienen apartados separados. Las fichas ofrecen ejemplos cualitativos, no volúmenes ni inventarios exhaustivos.

Antigüedad: Roma, Grecia, Egipto, Fenicia, Persia aqueménida, hititas, Sumeria, civilización del Indo, China Han y redes del golfo. Mundo medieval: francos carolingios, califatos omeya, abasí y cordobés, Bizancio, Venecia, Génova, Florencia, Pisa/Amalfi, Milán, Inglaterra, Liga Hanseática y redes de la seda. Edad Moderna: expansión portuguesa, hispánica, francesa e inglesa; Nueva España, Perú, Nueva Granada y Río de la Plata; VOC, WIC, EIC y compañías francesas de las Indias.

| Comando | Acción |
|---|---|
| Historia | Abrir el explorador |
| Historia de Roma | Abrir la ficha de Roma antigua |
| Recursos económicos de Fenicia | Desplegar la ficha económica |
| Asentamientos de Sumeria | Seleccionar y mostrar sus nodos |
| Red comercial de Liga Hanseática | Seleccionar nodos y vínculos |
| Recursos de nueva España | Mostrar producción e intercambios |
| Red de rutas de la seda | Mostrar la red medieval de la seda |
| Ocultar red de Liga Hanseática | Quitar los vínculos de esa ficha |
| Ver Antigüedad / ver Edad Media / ver Edad Moderna | Filtrar fichas |
| Limpiar historia | Quitar selecciones históricas y conservar las geográficas |

Por voz, anteponé «Globo» y mantené activada la escucha local. Los destinos geográficos anteriores conservan sus comandos: «ir a Roma» sigue siendo un destino; «historia de Roma» abre la ficha.

Las fechas indican el marco estudiado de cada ficha, no la vida completa de sus ciudades. Los nombres India, China, Persia o Bizancio abren etapas concretas, no toda su historia. Cambiar de período conserva las selecciones para comparar: puede haber épocas distintas en pantalla. Las líneas discontinuas representan vínculos simplificados, no itinerarios navegables, caminos exactos, fronteras ni control político. Los trazados físicos son modernos; no reconstruyen antiguas costas o cauces. Algunas fichas contienen nodos sin red trazada.

Las fuentes externas están enlazadas desde cada ficha. Leer los textos y usar el globo es local y gratuito; abrir una fuente externa requiere Internet. Los textos son síntesis propias; no se incluyeron imágenes ni artículos ajenos completos.


---
Documentación de versiones anteriores:

## Versión 0.4.2 — ríos, lagos y asentamientos

Catálogo: 1.694 entradas, incluidos 1.074 ríos y 156 lagos/embalses. Ríos detallados de Natural Earth 10m y tramos 50m sin equivalente por nombre; lagos principales de rango cartográfico hasta 4, además del mar Muerto. Algunos nombres de río identifican tramos o brazos, no cuencas independientes.

En Explorar, elegí Ríos o Lagos / embalses. Marcá casillas para resaltar cursos y superficies; los seleccionados tienen etiquetas cuando hay espacio. Voz: «Globo, seleccionar río Tigris y río Éufrates y lago Titicaca». También «Globo, ir a lago Baikal», «Globo, quitar lago Titicaca». Las selecciones y animaciones anteriores siguen disponibles.

Notas de exploración en Nilo, Tigris, Éufrates, Indo y Amarillo relacionan agua y asentamientos. El agua favoreció muchas ciudades mediante agricultura, transporte y abastecimiento, pero no explica por sí sola toda urbanización. La cartografía muestra cauces y orillas modernos generalizados: no reconstruye los de las primeras ciudades, ni la extensión histórica de lagos desaparecidos. No todos los lagos agregados están vinculados con urbanización temprana.


## Versión 0.4.1

Ahora hay 799 entradas. Se agregaron Escocia, Gales, Inglaterra e Irlanda del Norte como países constituyentes del Reino Unido, con superficies individuales (filtro Regiones). Estrecho de Ormuz admite también Hormuz; se representa con una marca de ubicación, sin inventar límites.

Vientos y corrientes tienen flechas en movimiento, siguiendo el sentido de cada recorrido. La velocidad de animación es ilustrativa, no una velocidad física medida. Casilla «Animar recorridos» en Capas del mapa. Comandos: «Globo, pausar animación», «Globo, activar animación». Se inicia pausada si el navegador solicita movimiento reducido; se puede activar manualmente.

Ejemplos: «Globo, seleccionar Escocia y Gales», «Globo, ir al estrecho de Ormuz».

# Globo Histórico 0.4

794 entradas: 258 países/territorios, 28 regiones, 334 ríos, 93 mares/golfos/bahías y otras áreas marinas, 5 océanos, 16 estrechos/canales, 39 otros lugares, 6 cinturones de viento y 15 corrientes (6 cálidas y 9 frías).

En **Explorar**, filtrá por tipo y marcá las casillas. Pulsá el nombre para viajar. En **Capas del mapa**, las casillas de vientos y corrientes activan grupos completos; una casilla intermedia indica selección parcial. Voz, texto y mouse comparten selección. Las selecciones duran hasta recargar o cerrar.

| Comando | Resultado |
|---|---|
| Ir a Roma | Viajar y marcar |
| Seleccionar Argentina y Chile | Colorear ambos países |
| Seleccionar río Nilo y mar Negro | Resaltar curso y área |
| Ir a océano Pacífico | Mostrar el océano |
| Mostrar vientos | Activar seis cinturones generales |
| Mostrar corrientes frías | Activar nueve corrientes frías |
| Mostrar corrientes cálidas | Activar seis cálidas |
| Activar corriente de Humboldt | Mostrar un recorrido |
| Desactivar corriente de Humboldt | Quitar ese recorrido |
| Ocultar corrientes | Quitar todas las corrientes |
| Quitar Chile | Quitar una selección |
| Limpiar colores | Quitar selecciones y recorridos |
| Acercar / alejar / volver al mundo | Cambiar vista |
| Detener voz | Apagar escucha |

Con la voz activada, anteponé **Globo**: «Globo, mostrar corrientes frías». Iniciá mediante el acceso directo o INICIAR-CON-VOZ.cmd y pulsá Activar voz para autorizar el micrófono. Reconocimiento español local con Vosk, sin servicios pagos. Los nombres poco frecuentes pueden requerir repetir, escribir o usar la casilla.

Rojo = corriente cálida; azul = fría; amarillo discontinuo = viento. Las flechas muestran sentido general; son trazados didácticos propios, no posiciones exactas, temperaturas, velocidades ni tiempo real. Las etiquetas visibles evitan superponerse; cada nombre permanece disponible en el catálogo y las selecciones. Ríos y áreas marinas: cartografía generalizada. Gibraltar (territorio) se distingue de Estrecho de Gibraltar.

Fuentes: Natural Earth, países 50m con 16 territorios adicionales de 10m; áreas marinas y ríos 50m. Dominio público: https://github.com/nvkelso/natural-earth-vector/tree/master/geojson . Tramos agrupados por nombre; traducciones propias de nombres comunes, otros nombres conservados. Áreas marinas sin significado jurisdiccional.

Recorridos de circulación esquemáticos propios basados en el mapa NOAA https://www.vos.noaa.gov/docs/marine_info_guide.pdf y los cinturones NOAA/NWS https://www.weather.gov/media/ohx/PDF/Weather101GlobalCirculations.pdf . Alisios: https://oceanservice.noaa.gov/facts/tradewinds.html . No se redistribuyen las ilustraciones ni se consultan servicios al usar la aplicación.


---
Documentación de versiones anteriores:
# Globo Histórico · v0.3.1

## Abrir y hablar

En Windows, extraé toda la carpeta y ejecutá **INICIAR-CON-VOZ.cmd**. También podés usar el acceso directo **Globo Histórico** del escritorio, si fue creado en tu computadora.

1. Pulsá **Activar voz**. La primera carga del modelo puede tardar unos segundos.
2. Permití el micrófono en el navegador.
3. Decí **«Globo, ir a Roma»** y hacé una pausa.
4. Probá **«Globo, ir a los Andes»**, **«Globo, acercar»**, **«Globo, volver al mundo»** o **«Globo, mostrar ríos»**.
5. Detené la escucha con **Detener voz**, Escape o **«Globo, detener voz»**.

También podés decir «Globo», hacer una pausa y dar el comando dentro de los siguientes 12 segundos. En **Capas del mapa** podés desmarcar la activación con «Globo» para usar comandos directos. No hay escucha antes de activar el botón ni después de detenerlo.

No requiere instalar Python, Node ni Vosk. El iniciador usa PowerShell y .NET incluidos en Windows para servir los archivos en **una dirección local http://127.0.0.1:puerto/**. Solo escucha en esta computadora; no necesita Internet. **DETENER-SERVIDOR.cmd** apaga ese servicio. Cerrar la pestaña detiene el micrófono; el servicio local sigue disponible hasta detenerlo.

**index.html** sigue abriendo el mapa con doble clic y funciona sin Internet. Para voz se necesita el iniciador local debido a las restricciones del navegador sobre archivos y modelos. En otros sistemas, servir la carpeta desde un servidor HTTP en localhost; el iniciador incluido es específico de Windows.

## Pantalla inmersiva

- El globo ocupa casi toda la pantalla. El panel izquierdo comienza cerrado: botón **Explorar** para abrir/cerrar.
- **Capas del mapa**, **Escala hipsométrica**, **Vista**, **Escribir un comando** y la ficha del destino son desplegables.
- Arrastrar gira el planeta. Rueda o pellizco acercan/alejan. Con el globo enfocado: flechas, +, − e Inicio.
- 315 destinos: lugares, accidentes, países, territorios y regiones geográficas.
- Las etiquetas del globo son clicables y se ocultan al quedar detrás del planeta. Se omiten algunas etiquetas superpuestas.

## Relieve y lectura territorial

El mapa clasifica elevaciones del modelo SRTM15+ v2.7, reducido por GMT a 10 minutos de arco (2160 × 1080 celdas). El filtrado regional suaviza cumbres y costas. La ficha muestra la altura aproximada de la celda, **no la altura exacta del punto**. La representación es una textura hipsométrica sobre una esfera: no una malla con montañas extruidas.

La leyenda tiene bandas de altitud en metros, profundidades oceánicas, depresiones terrestres y lagos sin profundidad indicada. El sombreado, opcional, modifica el brillo para facilitar la lectura. El verde representa cotas bajas, no vegetación; el blanco representa altura, no nieve.

Ríos y lagos: Natural Earth, escala 1:110 millones. Desiertos, cordilleras, mesetas, estrechos, llanuras y cuencas tienen anclas orientativas y fichas didácticas. No se dibujan polígonos inventados para sus extensiones. Las fichas explican posibles obstáculos y corredores; son interpretación general, no una clasificación automática de dificultad ni un cálculo de rutas. El relieve actual no sustituye la geografía histórica.

## Voz local

Vosk Browser 0.0.8 / WebAssembly con modelo español **vosk-model-small-es-0.42**, incluido. El audio se procesa en un trabajador del navegador. No hay Web Speech, servicios de transcripción remotos, cuentas ni claves. Vosk puede guardar una copia del modelo en el almacenamiento local del navegador; no se guardan grabaciones ni transcripciones en archivos. No se solicita el micrófono antes de pulsar el botón.

La activación «Globo» se detecta a partir de la transcripción local, después de encender el micrófono. **No es una escucha del sistema mientras la aplicación está cerrada.** El reconocimiento puede equivocarse según voz, ruido y equipo. Solo se ejecutan comandos soportados por el catálogo. Se muestra lo escuchado para poder corregirlo por texto.

## Módulos

- `index.html`, `css/estilos.css`: interfaz adaptable y paneles.
- `js/globo.js`: renderizado 3D, cámara, controles y etiquetas.
- `js/relieve.js`, `datos/relieve.js`: datos de elevación, muestreo y tabla de colores.
- `datos/rivers.js`, `datos/lakes.js`: geometrías Natural Earth.
- `datos/lugares.js`, `datos/accidentes.js`: catálogo y fichas.
- `js/comandos.js`: intérprete común para texto y voz.
- `js/voz.js`: modelo, captura, reconocimiento y liberación del micrófono.
- `js/app.js`: coordinación y detección de la frase de activación.
- `voz/modelo-es.tar.gz`, `vendor/vosk.js`: reconocimiento incluido, sin descarga al usarlo.
- `servidor-local.ps1`: servicio HTTP limitado a la carpeta y a la interfaz de loopback.
- `tools/preparar-datos.py`: preparación reproducible de recursos, solo para desarrollo.
- `licencias/`: procedencia y avisos de las dependencias.

## Pruebas

- `node tests/comandos.test.cjs`: catálogo y comandos, sin dependencias.
- `node tests/browser.test.cjs`: interfaz en Edge con Playwright, mediante file:// y red deshabilitada.
- `node tests/voz-browser.test.cjs`: con servidor local iniciado (GLOBO_URL permite indicar una dirección distinta de 8765); Vosk real recibe la muestra sintética `tests/comando-sintetico.wav`. Valida activación, destino, parada, reinicio y permiso denegado; bloquea conexiones externas.

Las herramientas de pruebas no se necesitan para usar la aplicación. Ver **VERIFICACION.md** y **LEEME.html**.
Si moves la carpeta, ejecuta CREAR-ACCESO-DIRECTO.cmd desde su nueva ubicacion para actualizar el acceso directo del escritorio.

## Novedades v0.3: catálogo y selección múltiple

El catálogo tiene **315 destinos**, incluidos **242 países y territorios** de Natural Earth a escala 1:50 millones, además de lugares, accidentes y agrupaciones geográficas. Hay continentes y subregiones como Europa Occidental, África del Norte o América del Sur. No es un geocodificador universal ni contiene provincias o ciudades de todo el mundo.

Cada visita añade una selección con color propio. Países y regiones se pintan dentro de sus polígonos; ciudades y accidentes sin límites definidos reciben una marca circular de ubicación (no representa extensión territorial). Los colores son una capa semitransparente separada de la hipsometría, para conservar el relieve. Si las superficies se superponen, la última se dibuja encima.

Ejemplos de texto o voz con prefijo «Globo»:

- «Seleccionar Argentina, Chile y Perú».
- «Agregar Brasil» o «ir a Uruguay»: conserva las selecciones anteriores.
- «Seleccionar Europa Occidental y África del Norte».
- «Quitar Chile».
- «Ver selección»: orienta la cámara hacia el conjunto.
- «Limpiar colores»: elimina todas las selecciones.

El menú **Explorar → Selecciones** muestra nombres y colores, permite ir a un destino, quitarlo o limpiar el conjunto. Repetir un destino no lo duplica ni cambia su color. Mundo conserva la selección; cerrar o recargar la página la borra. Lugares muy separados pueden quedar en la cara posterior: girá el globo para verlos. Los países transcontinentales se incluyen completos según la agrupación de Natural Earth; no se intenta trazar límites continentales internos.

Los nombres compuestos con «y», como Trinidad y Tobago o Bosnia y Herzegovina, se reconocen como una sola ubicación. Un comando con un destino desconocido no modifica ninguna selección: corregí el nombre y repetilo.

Nuevos módulos: datos/regiones.js (geometrías y nombres), js/regiones.js (catálogo ampliado y grupos), js/selecciones.js (estado y colores). La preparación reproducible está en tools/preparar-regiones.cjs. Prueba adicional: node tests/selecciones-browser.test.cjs. Para audio sintético de tres países, ejecutar tests/voz-browser.test.cjs con MULTI_VOICE=1.



## Corrección del iniciador v0.3.1
El puerto 8765 es una preferencia. Si ya está ocupado, el iniciador elige automáticamente un puerto libre. Cada carpeta mantiene su propia instancia; al abrirla otra vez se reutiliza. DETENER-SERVIDOR.cmd solo detiene la instancia de esa carpeta. El estado se guarda en LocalAppData/GloboHistorico, identificado por la ruta de la carpeta. No se necesita cerrar otras aplicaciones ni cambiar configuraciones. Al cambiar de puerto, el navegador puede pedir nuevamente permiso de micrófono.


## Tabla de comandos

Por voz, anteponer «Globo»; por texto, escribir directamente.

| Acción | Comando |
| --- | --- |
| Ir y colorear | ir a Argentina |
| Seleccionar varios | seleccionar Argentina y Chile y Perú |
| Seleccionar regiones | seleccionar Europa Occidental y África del Norte |
| Agregar | agregar Brasil |
| Quitar | quitar Chile |
| Encuadrar selección | ver selección |
| Borrar colores | limpiar colores |
| Zoom | acercar / alejar |
| Vista mundial | volver al mundo |
| Relieve | mostrar relieve / ocultar relieve |
| Ríos y lagos | mostrar ríos / ocultar ríos |
| Etiquetas de accidentes | mostrar accidentes / ocultar accidentes |
| Sombreado | activar sombreado / desactivar sombreado |
| Ayuda | ayuda |
| Apagar micrófono | detener voz |

Mundo conserva los colores; limpiar colores los borra.


### Ajuste de gestos 0.6.1
Pinza más tolerante y seguimiento compatible con intervalos de hasta 2 segundos entre detecciones. La vista de cámara abre al activar gestos y dibuja los puntos detectados. El botón «Tomar zoom sin pinza» se habilita al detectar una mano: toma la apertura actual como referencia, sin saltar de zoom. Sigue siendo necesario comprobar el funcionamiento con la cámara del usuario.
