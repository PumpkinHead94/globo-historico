/* Selección editorial y textos propios. Geometrías y licencia en epocas-geometrias.js. */
(function(ns){
  const nodes={
    roma:['Roma',41.90,12.49],atenas:['Atenas',37.98,23.73],cartago:['Cartago',36.85,10.32],
    tiro:['Tiro',33.27,35.20],sardes:['Sardes',38.49,28.04],susa:['Susa',32.19,48.26],
    babilonia:['Babilonia',32.54,44.42],menfis:['Menfis',29.85,31.25],
    alejandria:['Alejandría',31.20,29.92],pella:['Pella',40.76,22.52],
    antioquia:['Antioquía',36.20,36.16],ctesifonte:['Ctesifonte',33.09,44.58],
    laurion:['Laurión · plata',37.71,24.05],nilo:['Valle del Nilo · cereales',27.5,30.8],
    betica:['Bética · aceite',37.6,-4.8],atica:['Ática · olivo y cerámica',38.0,23.5]
  };
  ns.epochData={nodes, names:{
    'Achaemenid Empire':['Imperio aqueménida','#c794ff',33,49],
    'Empire of Alexander':['Imperio de Alejandro · transición de 323 a. C.','#ffd166',34,48],
    'Carthaginian Empire':['Ámbito cartaginés','#51ddb2',36.85,10.32],
    'Greek city-states':['Poleis griegas · agrupación, no Estado único','#66c9f4',38,24],
    'Rome':['Roma y su territorio','#f17068',41.9,12.5],
    'Roman Empire':['Imperio romano','#f17068',40,18],
    'Parthian Empire':['Imperio parto','#c794ff',34,49],
    'Armenia':['Armenia','#ffae71',40,44]
  },snapshots:[
    {year:-500,century:-5,label:'Hacia 500 a. C. · Persia y el Mediterráneo',
      note:'Inicio del siglo V a. C. Egipto y las ciudades fenicias aparecen dentro del ámbito aqueménida. Las poleis griegas son una agrupación cartográfica, no un país unificado.',
      cities:['roma','atenas','cartago','tiro','sardes','susa','babilonia','menfis'],
      routes:[{name:'Sardes–Susa · circulación imperial',nodes:['sardes','susa'],note:'Camino Real aqueménida: eje administrativo y de circulación. La línea une extremos; no reproduce el recorrido ni sus estaciones.'}],
      resources:[{node:'nilo',text:'Producción cerealera del valle del Nilo. Marca regional, sin volumen ni distribución de tierras.'},{node:'atica',text:'Olivo y cerámica en el ámbito ático; ejemplos de producción e intercambio, no inventario exhaustivo.'}],
      economy:'Agricultura, tributos y circulación regional en el ámbito persa; producción artesanal y comercio marítimo entre ciudades mediterráneas. Egipto y Fenicia conservaban sociedades y economías propias bajo dominio imperial.',
      sources:[['The Met · Persia aqueménida','https://www.metmuseum.org/essays/the-achaemenid-persian-empire-550-330-b-c'],['Encyclopaedia Iranica · comercio y Camino Real','https://www.iranicaonline.org/articles/commerce-ii/']]},
    {year:-323,century:-4,label:'Hacia 323 a. C. · Alejandro y la transición',
      note:'Final del siglo IV a. C. Fotografía aproximada de un año de ruptura: Alejandro murió en 323 a. C. No representa todos los repartos posteriores ni una administración estable y uniforme.',
      cities:['roma','atenas','cartago','tiro','susa','babilonia','menfis','alejandria','pella'],
      routes:[{name:'Egeo–Levante · conexiones marítimas',nodes:['atenas','tiro'],note:'Vínculo didáctico entre ámbitos portuarios del siglo IV a. C.; no una ruta directa ni un itinerario fechado exactamente en 323.'}],
      resources:[{node:'nilo',text:'Agricultura cerealera egipcia; la conquista no creó esta actividad.'},{node:'laurion',text:'Distrito argentífero del Ática, explotado en época clásica con trabajo esclavizado. Ubicación regional; sin estimación anual.'}],
      economy:'Persistencia de agriculturas regionales, tributación y talleres tras la conquista. Los intercambios del Egeo y Levante precedían a Alejandro; no todos los nodos tenían igual importancia. Alejandría era todavía una fundación reciente.',
      sources:[['OpenStax · conquista y mundo helenístico','https://openstax.org/books/world-history-volume-1/pages/6-3-the-hellenistic-era']]},
    {year:200,century:2,label:'Hacia 200 d. C. · Roma y Partia',
      note:'Final del siglo II d. C., bajo Septimio Severo. Este mapa corresponde a 200, no a la máxima expansión de Trajano en 117. Fronteras orientales y relaciones de dependencia fueron cambiantes.',
      cities:['roma','atenas','cartago','tiro','alejandria','antioquia','ctesifonte'],
      routes:[{name:'Alejandría–Roma · abastecimiento',nodes:['alejandria','roma'],note:'Conexión de abastecimiento cerealero del período imperial; línea esquemática, sin escalas ni trayecto marítimo exacto.'},{name:'Cartago–Roma · intercambio',nodes:['cartago','roma'],note:'Conexión entre África romana e Italia. Esquema de relaciones económicas, no medición de flujos en el año 200.'}],
      resources:[{node:'nilo',text:'Cereales de Egipto: producción y abastecimiento del mundo romano.'},{node:'betica',text:'Aceite de la Bética destinado a mercados del Imperio; marca regional, no localización de una explotación.'}],
      economy:'Agricultura, talleres, impuestos y redes marítimas y terrestres. Egipto y África romana participaron del abastecimiento de Roma; la Bética exportó aceite. Partia articuló intercambios de Mesopotamia e Irán. Existían formas diversas de trabajo, incluida la esclavitud.',
      sources:[['The Met · Imperio romano','https://www.metmuseum.org/essays/the-roman-empire-27-b-c-393-a-d']]}
  ]};
  for(const snapshot of ns.epochData.snapshots){for(const key of (snapshot.year===200?['roma','egipto']:['grecia','egipto']))snapshot.sources.push(ns.historyData.sources[key]);}
})(window.GH=window.GH||{});
