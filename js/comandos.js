(function (ns) {
  'use strict';
  const normalize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[¿?¡!.,;:«»"']/g,'').replace(/\s+/g,' ').trim();
  function resolveList(text,places){
    const aliases=new Map();
    for(const place of places)for(const label of [place.name,...place.aliases]){
      const key=normalize(label);if(!key)continue;
      if(!aliases.has(key))aliases.set(key,[]);
      if(!aliases.get(key).includes(place))aliases.get(key).push(place);
    }
    const names=[...aliases.keys()].sort((a,b)=>b.length-a.length);
    function walk(rest,depth=0){
      rest=rest.trim();if(!rest)return [];
      if(depth>60)return null;
      // Priorizar nombres completos: «Trinidad y Tobago» no se divide por «y».
      for(const name of names){
        if(rest!==name&&!rest.startsWith(name+' '))continue;
        const tail=rest.slice(name.length).replace(/^\s*(?:\||y|e|mas|junto a)\s+/,'').trim();
        if(rest!==name&&!tail)return null;
        const next=walk(tail,depth+1);
        if(next)return [aliases.get(name),...next];
      }
      const article=rest.replace(/^(?:el|la|los|las)\s+/,'');
      return article!==rest?walk(article,depth+1):null;
    }
    const groups=walk(text);
    if(!groups)return {type:'unknown',query:text};
    const ambiguous=groups.find(g=>g.length>1);
    if(ambiguous)return {type:'ambiguous',choices:ambiguous};
    return {places:[...new Map(groups.map(g=>[g[0].id,g[0]])).values()]};
  }
  function parse(text, places = ns.places) {
    let query = normalize(String(text).replace(/[,;]+/g,' | '));
    if (!query) return {type:'empty'};
    const historical=ns.history?.parse(text);if(historical)return historical;
    if (/^(mundo|inicio|volver|volver al mundo|ver (el )?mundo|mostrar (el )?mundo|mostrame (el )?mundo|planeta|reiniciar|ir al mundo)$/.test(query)) return {type:'world'};
    if (/^(acercar|acerca|acercate|acercame|aumentar zoom|mas zoom|zoom in|\+)$/.test(query)) return {type:'zoom',direction:1};
    if (/^(alejar|aleja|alejate|alejame|menos zoom|reducir zoom|zoom out|[-−])$/.test(query)) return {type:'zoom',direction:-1};
    if (/^(ayuda|comandos)$/.test(query)) return {type:'help'};
    if (/^(detener voz|parar voz|dejar de escuchar|silencio)$/.test(query)) return {type:'voice-stop'};
    if(/^(limpiar(?: (?:selecciones|seleccion|colores|todo))?|borrar (?:selecciones|seleccion|colores|todo)|quitar todas(?: las regiones)?|deseleccionar todo)$/.test(query))return {type:'clear-selection'};
    if(/^(ver|mostrar|centrar) (?:la |las )?seleccion(?:es)?$/.test(query))return {type:'show-selection'};
    if(/^(animar(?: recorridos| corrientes| vientos)?|activar animacion|reanudar animacion)$/.test(query))return {type:'flow-animation',value:true};
    if(/^(pausar animacion|detener animacion|desactivar animacion)$/.test(query))return {type:'flow-animation',value:false};
    const flowMatch=query.match(/^(mostrar|activar|seleccionar|ocultar|desactivar|quitar) (?:los |las )?(vientos(?: predominantes)?|corrientes(?: marinas)?(?: frias| calidas)?)$/);
    if(flowMatch)return {type:'selection-group',group:flowMatch[2].startsWith('vientos')?'wind':flowMatch[2].endsWith('frias')?'cold':flowMatch[2].endsWith('calidas')?'warm':'currents',value:['mostrar','activar','seleccionar'].includes(flowMatch[1])};
    const layerMatch=query.match(/^(mostrar|ocultar|activar|desactivar) (relieve|hipsometria|rios|rios y lagos|accidentes|sombreado)$/);
    if(layerMatch)return {type:'layer',layer:({relieve:'relief',hipsometria:'relief',rios:'water','rios y lagos':'water',accidentes:'labels',sombreado:'shade'})[layerMatch[2]],value:['mostrar','activar'].includes(layerMatch[1])};
    let action='place';
    if(/^(ocultar|desactivar|quitar|quita|sacar|saca|eliminar|elimina|deseleccionar|deselecciona)\s+/.test(query)){action='remove-selection';query=query.replace(/^\S+\s+/,'');}
    else if(/^(activar|seleccionar|selecciona|seleccioname|pintar|pinta|pintame|colorear|colorea|coloreame|marcar|marca|agregar|agrega|anadir|anade|sumar|suma|comparar|compara)\s+/.test(query)){action='select';query=query.replace(/^\S+\s+/,'');}
    else query = query.replace(/^(ir a|ir al|ve a|anda a|vamos a|volar a|llevarme a|llevame a|mostrar|muestra|muestrame|mostrame|ver|buscar|viajar a)\s+/,'');
    if(action==='select'||action==='remove-selection')query=query.replace(/^(?:(?:los )?paises|(?:las )?regiones)\s+/,'');
    const resolved=resolveList(query.replace(/^\|\s*|\s*\|$/g,''),places);
    if(resolved.type)return resolved;
    if(action==='place'&&resolved.places.length===1)return {type:'place',place:resolved.places[0]};
    return {type:action==='place'?'select':action,places:resolved.places};
  }
  ns.commands = {normalize,parse};
})(window.GH = window.GH || {});
