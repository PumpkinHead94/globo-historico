# Verificación de entrega v0.2 — 24/09/2026

## Aprobado

- Cinco grupos de pruebas del intérprete, alias, capas y catálogo de 48 destinos.
- Edge mediante file:// con red deshabilitada: mapa, relieve, ríos y lagos locales; sin solicitudes HTTP/HTTPS ni errores JavaScript.
- Panel lateral cerrado al inicio; abrir/cerrar cambia el espacio del globo. Capas, leyenda, navegación, comandos y ficha desplegables.
- Roma centrada; navegación por catálogo y comandos; zoom limitado; giro por mouse/teclado; Mundo.
- Muestreo coherente: meseta tibetana > 4.000 m, Pacífico profundo < -3.000 m.
- Comandos de accidentes, capas y activación Globo en una frase o en dos enunciados.
- Escritorio, notebook 1366×768 y móvil simulado 390×844, sin desbordamiento horizontal. Globo completo en vista mundial vertical.
- Aviso sin WebGL; voz desde file:// indica usar el iniciador.
- Servidor Windows en 127.0.0.1:8765 sin Python ni Node.
- Vosk español real incluido. Audio sintético «Globo. Ir a Roma.» como micrófono de prueba: reconocimiento -> activación -> Roma.
- Inicio, parada, reinicio y Escape; pistas del micrófono de prueba terminadas al detener.
- Permiso denegado: aviso y estado inactivo, sin bloquear texto.
- Voz con conexiones externas bloqueadas; cero conexiones externas y errores JavaScript.
- Acceso directo del escritorio apunta al iniciador e icono de esta versión.

## Límites

No se grabó la voz del usuario ni se probó su micrófono físico. La prueba usa audio español sintetizado; no mide precisión con distintos acentos o ruido ambiente. No se verificó en hardware móvil, Firefox o Safari. Relieve regional generalizado: no validado para rutas, pasos ni pendientes locales.

## Verificación adicional v0.3 — 24/09/2026

- Seis grupos de pruebas del intérprete y catálogo: 315 destinos sin identificadores ni alias conflictivos.
- Listas con comas, conjunciones o nombres consecutivos; Trinidad y Tobago y Bosnia y Herzegovina tratados como nombres completos.
- Coloreado verificado en píxeles de Argentina, Chile y Perú; tres colores distintos y estables al repetir destinos.
- Selección acumulativa, Mundo conserva colores, quitar individualmente y limpiar; comando parcialmente desconocido no modifica nada.
- Continentes/subregiones seleccionables, controles del panel y prueba de interfaz móvil sin desbordamiento.
- Pruebas de interfaz original nuevamente aprobadas con el catálogo ampliado.
- Vosk real reconoció un audio sintético «Globo. Seleccionar Argentina y Chile y Perú.» y seleccionó los tres países con colores diferentes, con conexiones externas bloqueadas.
- Detener/reiniciar y permiso denegado siguen funcionando y liberan el micrófono.
- Revisión visual de selección múltiple sobre relieve hipsométrico. Sin errores JavaScript en las pruebas.

El micrófono físico del usuario no fue utilizado. La voz se verificó con audio sintético. Las superficies son las de Natural Earth; puntos sin polígonos usan una marca y no un territorio supuesto.

## Corrección v0.3.1 — 25/09/2026

Se corrigió el conflicto entre la copia original y una carpeta extraída que intentaban usar 8765. Selección automática de puerto libre, estado por carpeta, exclusión de arranques simultáneos y apagado de la instancia correspondiente.

Prueba del servidor aprobada: carpetas simultáneas, doble inicio, reapertura, apagado independiente y reinicio. La copia extraída se abrió en un puerto alternativo. Vosk real aprobó allí la prueba sintética de selección de Argentina, Chile y Perú, parada/reinicio y permiso denegado sin conexiones externas. Se añadió pausa al fixture corto para separar sus repeticiones; esa última repetición no se usa como evidencia de aprobación.
## Verificación v0.4 — 25/09/2026

- 794 entradas; pruebas del intérprete: identificadores y alias únicos, coordenadas válidas, listas y comandos anteriores aprobados.
- Interfaz abierta como archivo sin conexión: WebGL, navegación, zoom, catálogo, teclado, arrastre y tamaño móvil aprobados.
- Prueba nueva de circulación: comandos recibidos por la ruta de voz actualizan casillas; grupos completos, estados parciales, selección individual, eliminación y limpieza de flechas aprobados. Sin errores JavaScript.
- Prueba de regresión de selecciones: polígonos coloreados, colores estables, acumulación, eliminación y limpieza aprobados.
- Vosk real con audio sintético español reconoció «Globo, seleccionar Argentina y Chile y Perú». Detener/reiniciar, Escape y permiso denegado aprobados, sin conexiones externas. Los comandos nuevos se verificaron por la función compartida que recibe transcripciones; no se verificó por audio cada nombre del catálogo ni el micrófono físico.
- Captura revisada visualmente: globo, nombres, flechas, colores de corrientes y casillas. Recorridos esquemáticos con limitación indicada en interfaz y guía.

## Verificación v0.4.1 — 25/09/2026

Pruebas aprobadas: catálogo sin alias conflictivos; píxeles coloreados dentro de Escocia y Gales; búsqueda de Ormuz/Hormuz; cambio de posición de flechas con el paso del tiempo; pausa exacta por comando recibido en la función de voz; reanudación por casilla; limpieza de objetos; inicio pausado con movimiento reducido. Prueba de regresión de circulación aprobada. Navegador sin conexión, sin errores JavaScript. No se grabó el micrófono físico; los comandos nuevos se probaron como transcripciones en el mismo receptor usado por Vosk.


## Verificación v0.4.2
Seis grupos de pruebas del intérprete aprobados; catálogo con 1.694 identificadores y alias sin conflictos, coordenadas válidas. Prueba offline de agua aprobada: selección conjunta desde el receptor de voz de Tigris, Éufrates y Titicaca; geometrías presentes; píxel interior del Titicaca coloreado; categoría Lagos, casilla sincronizada, quitar individual, nota educativa y limpieza de etiquetas. Captura revisada. Sin errores JavaScript. La prueba usa transcripciones, no nuevo audio del micrófono físico.

## Verificación v0.5 — 26/09/2026

- 35 fichas económicas, 111 entradas de nodos por período (91 ubicaciones de referencia), 30 redes esquemáticas; catálogo total 1.835.
- Intérprete: seis grupos de pruebas aprobados, incluidos identificadores y alias únicos y comandos geográficos anteriores. Los nombres de redes históricas tienen un comando contextual propio.
- Datos históricos: fechas y tres apartados económicos presentes; coordenadas válidas, referencias definidas y todos los enlaces conectan nodos de su ficha.
- Interfaz histórica offline: recursos de Fenicia, asentamientos de Sumeria, selección parcial, red hanseática, ocultar red, limpieza histórica conservando Argentina, cambio de período, rechazo de tema desconocido, móvil y ausencia de conexiones externas/errores JavaScript.
- Regresión aprobada en navegador: mapa, navegación, zoom, catálogo actualizado, teclado, arrastre, móvil; agua y etiquetas; animación, pausa y movimiento reducido.
- Captura de escritorio revisada: se conserva la cabecera al abrir Historia y desplazar el panel.
- Voz: los nuevos comandos se probaron como transcripciones en el receptor común de Vosk. No se validó por audio cada nombre histórico ni se usó el micrófono físico. El motor local no se modificó.
- Alcance histórico: fichas introductorias con marcos temporales, ejemplos económicos cualitativos y vínculos esquemáticos; no fronteras ni itinerarios reconstruidos.


## 0.6 · Gestos (16/10/2026)
- Prueba unitaria: pinza sostenida, separar/acercar, puño, pérdida de mano, dos manos, pausas, invariancia ante escala y zona muerta.
- Edge automatizado con cámara sintética y modelo real local: carga de WASM/modelo y procesamiento de fotogramas; conexiones externas bloqueadas; sin solicitudes de cámara al abrir ni captura de audio; Escape, parada, reinicio, permiso denegado y cancelación mientras el permiso está pendiente.
- Presentación comprobada en 1440×1000 y 390×844. No se grabó ni abrió la cámara física del usuario. La precisión y comodidad con manos reales quedan pendientes de prueba manual.
