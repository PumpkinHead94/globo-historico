/* Anclas orientativas de regiones extensas; no delimitan fronteras o rutas.
 * Las fichas son interpretaciones didácticas generales, no evaluaciones de tránsito.
 * Ríos y lagos dibujados: geometrías Natural Earth incluidas por separado.
 */
(function(ns){
  const rows = [
    ['andes','Cordillera de los Andes','Cordillera',-23,-68,['andes','los andes'],'Altitud, pendientes y pasos de montaña condicionan los cruces de este a oeste. Los valles pueden concentrar los recorridos.'],
    ['himalaya','Himalaya','Cordillera',29,85,['himalayas','el himalaya'],'Grandes desniveles, frío de altura y pasos elevados dificultan las conexiones entre vertientes.'],
    ['alpes','Alpes','Cordillera',46.5,10.5,['los alpes'],'Las pendientes y los pasos de montaña concentran los cruces; nieve y estaciones pueden modificar la accesibilidad.'],
    ['apeninos','Apeninos','Cordillera',42.5,13,['los apeninos'],'El relieve longitudinal de la península itálica separa vertientes. Los valles y puertos ofrecen conexiones entre ellas.'],
    ['pirineos','Pirineos','Cordillera',42.7,.6,['los pirineos'],'La cadena montañosa concentra las conexiones en pasos y corredores entre la península ibérica y el resto de Europa.'],
    ['rocosas','Montañas Rocosas','Cordillera',43,-110,['rocosas','las rocosas'],'Los desniveles y la continuidad de las sierras hacen relevantes los pasos, valles y cambios estacionales.'],
    ['atlas','Atlas','Cordillera',31.5,-7,['el atlas'],'El relieve del noroeste africano crea contrastes entre vertientes y concentra algunos recorridos en valles y pasos.'],
    ['sahara','Sahara','Desierto',24,13,['el sahara','desierto del sahara'],'La escasez de agua y las grandes distancias entre puntos de abastecimiento condicionan los desplazamientos. Un desierto no se identifica solo por su altura.'],
    ['atacama','Atacama','Desierto',-24,-69,['desierto de atacama'],'La aridez y la proximidad de grandes desniveles hacen relevantes el agua disponible y los pasos entre costa e interior.'],
    ['gobi','Gobi','Desierto',43,104,['desierto del gobi'],'La aridez, las distancias y los contrastes térmicos influyen en el abastecimiento y la movilidad.'],
    ['tibet','Meseta del Tíbet','Meseta',33,88,['tibet','meseta del tibet'],'La gran altitud, el frío y los bordes montañosos condicionan la permanencia y las conexiones con regiones vecinas.'],
    ['pampa','Llanura pampeana','Llanura',-35,-62,['pampa','la pampa','llanura pampeana'],'El relieve de baja pendiente favorece conexiones extensas, aunque ríos, suelos anegados y distancias siguen siendo obstáculos.'],
    ['amazonia','Amazonia','Cuenca',-4,-63,['amazonia','cuenca amazonica'],'La red fluvial ofrece corredores, mientras que los cursos de agua y áreas inundables pueden dificultar los cruces terrestres. Altitud baja no equivale a tránsito fácil.'],
    ['nilo','Río Nilo','Río',23,32.8,['nilo','el nilo'],'El valle es un corredor y una fuente de agua dentro de regiones áridas. Cruzar el río requiere considerar anchura, caudal y medios disponibles.'],
    ['amazonas','Río Amazonas','Río',-3,-60,['amazonas','el amazonas'],'El río conecta grandes distancias, pero también separa sus márgenes. Navegabilidad y cruces dependen del tramo y la época.'],
    ['danubio','Río Danubio','Río',45.2,22,['danubio','el danubio'],'El corredor fluvial conecta regiones europeas; sus cruces y estrechamientos pueden concentrar el movimiento.'],
    ['ganges','Río Ganges','Río',25.5,84,['ganges','el ganges'],'La llanura fluvial facilita conexiones, pero los grandes cursos y las crecidas pueden dificultar el tránsito terrestre.'],
    ['bosforo','Estrecho del Bósforo','Estrecho',41.12,29.07,['bosforo','el bosforo'],'Un paso marítimo estrecho conecta cuencas y separa orillas. Los cruces y el tránsito por agua se concentran en poco espacio.'],
    ['gibraltar','Estrecho de Gibraltar','Estrecho',35.96,-5.6,['gibraltar'],'El paso enlaza el Atlántico con el Mediterráneo. La cercanía entre costas no elimina la necesidad de transporte marítimo.'],
    ['panama','Istmo de Panamá','Istmo',9,-80,['panama','istmo de panama'],'La franja terrestre une continentes y separa mares; relieve, agua y vegetación importan para atravesarla. El canal es una obra humana posterior.'],
    ['victoria','Lago Victoria','Lago',-1,33,['victoria'],'Una gran superficie de agua modifica las rutas terrestres y permite conexiones por navegación, según los medios disponibles.'],
    ['mediterraneo','Mar Mediterráneo','Mar',35,18,['mediterraneo','el mediterraneo'],'Las costas e islas articulan rutas marítimas. Unir sus orillas depende de navegación, puertos, tiempo y tecnología.']
  ];
  ns.landforms=rows.map(([id,name,kind,lat,lon,aliases,description])=>({id,name,kind,lat,lon,aliases,description,region:kind,scale:kind==='Estrecho'?1.65:2.5}));
  ns.places.push(...ns.landforms);
})(window.GH=window.GH||{});
