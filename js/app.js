(function(ns) {
  'use strict';
  const $ = id => document.getElementById(id);
  let globe = null, selected = null;
  const selections=new ns.Selections();
  function refreshSelections(){
    const items=selections.values();if(globe)globe.setSelections([...(ns.epochs?.items||[]),...items]);
    $('selection-count').textContent=items.length;$('selected-list').replaceChildren();
    items.forEach(({place,color})=>{
      const row=document.createElement('div');row.className='selected-row';
      const swatch=document.createElement('i');swatch.style.background=color;row.append(swatch);
      const button=document.createElement('button');button.textContent=place.name;button.addEventListener('click',()=>visit(place));row.append(button);
      const remove=document.createElement('button');remove.textContent='×';remove.setAttribute('aria-label','Quitar '+place.name);remove.addEventListener('click',()=>{selections.remove([place]);refreshSelections();status(place.name+' quitado de la selección.');});row.append(remove);$('selected-list').append(row);
    });
    document.querySelectorAll('.place-check').forEach(c=>c.checked=selections.items.has(c.dataset.id));
    for(const group of ['wind','warm','cold']){const all=ns.flows.filter(p=>p.category===group),count=all.filter(p=>selections.items.has(p.id)).length;const c=$('group-'+group);c.checked=count===all.length;c.indeterminate=count>0&&count<all.length;}
    ns.history?.sync();
    $('show-selections').disabled=!items.length;$('clear-selections').disabled=!items.length;
  }
  function selectPlaces(places){
    if(!globe){status('El globo no está disponible.',true);return;}
    selections.add(places);refreshSelections();globe.frameSelection(selections.values());
    $('terrain-card').hidden=true;
    status(`Seleccionados: ${places.map(p=>p.name).join(', ')}. Total: ${selections.items.size}. Colores en Explorar → Selecciones.`);
  }
  function setSidebar(open){
    $('sidebar').hidden=!open;document.body.classList.toggle('sidebar-closed',!open);
    $('sidebar-toggle').setAttribute('aria-expanded',String(open));$('sidebar-toggle').textContent=open?'✕ Cerrar panel':'☰ Explorar';
    if(!open)$('sidebar-toggle').focus({preventScroll:true});
  }
  function territory(place){
    $('terrain-card').hidden=false;$('terrain-name').textContent=place.name;
    $('terrain-kind').textContent=place.kind?`${place.kind} · Lectura territorial`:'Destino · Entorno geográfico';
    let description=place.description;
    if(!place.kind){
      const nearby=ns.landforms.map(item=>({item,distance:d3.geoDistance([place.lon,place.lat],[item.lon,item.lat])*6371})).filter(item=>item.distance<1200).sort((a,b)=>a.distance-b.distance).slice(0,2);
      if(nearby.length)description+=' Para explorar el entorno: '+nearby.map(p=>p.item.name).join(' y ')+'.';
    }
    $('terrain-description').textContent=description;
    const metres=ns.terrain.sample(place.lat,place.lon);
    $('terrain-elevation').textContent=`Celda regional: ≈ ${Math.round(metres/10)*10} m respecto del mar. No es la altura puntual del destino. ${place.kind?'Referencia orientativa; no evalúa rutas ni dificultad real.':''}`;
  }
  function status(text,error=false) { $('status').textContent = text; $('status').dataset.error = String(error); }
  function renderCatalog() {
    const query = ns.commands.normalize($('filter').value);
    const visible = ns.places.filter(place=>(!$('catalog-kind').value||place.category===$('catalog-kind').value)&&ns.commands.normalize([place.name,place.region,...place.aliases].join(' ')).includes(query));
    $('place-count').textContent = `${visible.length} / ${ns.places.length}`;
    $('places').replaceChildren();
    visible.forEach(place=>{
      const button = document.createElement('button'); button.type = 'button'; button.className = 'place-button';
      button.setAttribute('aria-pressed',String(selected === place.id)); button.append(document.createTextNode(place.name));
      const region = document.createElement('span'); region.textContent = place.region; button.append(region);
      button.addEventListener('click',()=>visit(place)); const row=document.createElement('div');row.className='catalog-row';const check=document.createElement('input');check.type='checkbox';check.className='place-check';check.dataset.id=place.id;check.checked=selections.items.has(place.id);check.setAttribute('aria-label','Seleccionar '+place.name);check.addEventListener('change',()=>{if(check.checked)selections.add([place]);else selections.remove([place]);refreshSelections();status('Selección actualizada: '+place.name);});row.append(check,button);$('places').append(row);
    });
    if (!visible.length) { const p = document.createElement('p'); p.className='empty'; p.textContent='No hay coincidencias en este catálogo.'; $('places').append(p); }
  }
  function visit(place) {
    if (!globe) { status('El globo 3D no está disponible. Revisá el aviso en pantalla.',true); return; }
    selected = place.id; globe.flyTo(place);if(place.historyTopic)ns.history.setTopic(place.historyTopic);
    if(!place.epoch)selections.add([place]);refreshSelections();
    territory(place);
    $('place-name').textContent = place.name;
    $('place-description').textContent = place.description;
    $('place-coordinates').textContent = `${Math.abs(place.lat).toFixed(2)}° ${place.lat >= 0?'N':'S'}  /  ${Math.abs(place.lon).toFixed(2)}° ${place.lon >= 0?'E':'O'} · ${place.region}`;
    status(`Destino: ${place.name}. ${place.selectionType==='flow'?'Recorrido con flechas':place.selectionType==='line'?'Curso resaltado':place.geometry?'Superficie coloreada':'Marca de color; no representa límites'}. ${selections.items.size} selecciones.`); renderCatalog();
  }
  function world() {
    if (!globe) return;
    selected = null; globe.world(); $('terrain-card').hidden=true; $('place-name').textContent='Planeta Tierra';
    $('place-description').textContent='Una mirada al mundo entero. Arrastrá el globo para recorrerlo o escribí un lugar.';
    $('place-coordinates').textContent='VISTA GLOBAL'; status('Vista del mundo restaurada.'); renderCatalog();
  }
  function execute(text) {
    ns.gestures?.release();
    const result = ns.commands.parse(text);
    switch(result.type) {
      case 'epoch': ns.epochs.handle(result);status(document.getElementById('epoch-date').textContent);break;
      case 'history': ns.history.handle(result);status('Explorador histórico actualizado.');break;
      case 'place': visit(result.place); break;
      case 'flow-animation': $('flow-animation').checked=result.value;if(globe)globe.flowAnimation=result.value;status(result.value?'Animación activada.':'Animación pausada.');break;
      case 'selection-group': {const places=ns.flows.filter(p=>result.group==='currents'?p.category!=='wind':p.category===result.group);if(result.value)selections.add(places);else selections.remove(places);refreshSelections();status('Capa de circulación actualizada.');break;}
      case 'select': selectPlaces(result.places);break;
      case 'remove-selection': selections.remove(result.places);refreshSelections();status('Selección actualizada.');break;
      case 'clear-selection': selections.clear();refreshSelections();status('Todos los colores de selección fueron borrados.');break;
      case 'show-selection': if(globe&&selections.items.size)globe.frameSelection(selections.values());else status('Todavía no hay selecciones.',true);break;
      case 'ambiguous': status('Nombre ambiguo. Elegí: '+result.choices.map(p=>p.name).join(' / '),true);break;
      case 'world': world(); break;
      case 'zoom': if (globe) {globe.zoom(result.direction); status(result.direction>0?'Acercando la vista.':'Alejando la vista.');} break;
      case 'empty': status('Escribí un lugar o un comando para empezar.',true); break;
      case 'help': setSidebar(true);document.querySelector('.help').open=true; status('Probá «ir a Roma», «mostrame Egipto», «acercar» o «volver al mundo».'); break;
      case 'voice-stop': ns.voice.stop();break;
      case 'layer': $('layer-'+result.layer).checked=result.value;changeLayer(result.layer,result.value);status('Capa actualizada.');break;
      default: status(`No encontré «${String(text).slice(0,70)}». Buscá un destino en el catálogo.`,true);
    }
    return result;
  }
  function failure(message) { $('fatal').hidden=false; $('fatal').textContent=message; status('No se pudo mostrar el globo 3D.',true); ['zoom-in','zoom-out','world'].forEach(id=>$(id).disabled=true); }
  $('globe').addEventListener('globe-error',event=>{globe=null; failure(event.detail);});
  try { globe = new ns.Globe($('globe')); }
  catch(error) { console.error(error); failure('No se pudo iniciar el globo. Abrí index.html en una versión reciente de Edge, Chrome o Firefox con aceleración gráfica activada. Verificá que extrajiste toda la carpeta, incluyendo vendor y datos.'); }
  $('command-form').addEventListener('submit',event=>{event.preventDefault(); execute($('command').value);});
  $('flow-animation').checked=!!globe&&!globe.reducedMotion;if(globe)globe.flowAnimation=!globe.reducedMotion;
  $('flow-animation').addEventListener('change',e=>{if(globe)globe.flowAnimation=e.target.checked;});
  $('filter').addEventListener('input',renderCatalog);$('catalog-kind').addEventListener('change',renderCatalog);
  for(const group of ['wind','warm','cold'])$('group-'+group).addEventListener('change',e=>{const places=ns.flows.filter(p=>p.category===group);if(e.target.checked)selections.add(places);else selections.remove(places);refreshSelections();status('Capa de circulación actualizada.');});
  $('show-selections').addEventListener('click',()=>execute('ver seleccion'));
  $('clear-selections').addEventListener('click',()=>execute('limpiar colores'));
  $('sidebar-toggle').addEventListener('click',()=>setSidebar($('sidebar').hidden));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){setSidebar(false);$('terrain-card').hidden=true;ns.voice.stop();}});
  $('globe').addEventListener('place-request',event=>visit(event.detail));
  function changeLayer(name,value){if(globe)globe.setLayer(name,value);if(name==='relief'){$('legend').hidden=!value;$('layer-shade').disabled=!value;}}
  ['relief','shade','water','labels'].forEach(name=>$('layer-'+name).addEventListener('change',event=>changeLayer(name,event.target.checked)));
  [...ns.terrain.bands].reverse().concat([{color:'#63a38f',label:'Depresión terrestre (< 0 m)'},{color:'#68b6d4',label:'Lagos (sin profundidad indicada)'}]).forEach(band=>{
    const row=document.createElement('div');row.className='legend-row';const swatch=document.createElement('i');swatch.style.background=band.color;row.append(swatch,document.createTextNode(band.label));$('legend-bands').append(row);
  });
  $('legend').open=false;
  ns.voice.onState((state,message)=>{
    const active=state!=='idle';$('voice-toggle').setAttribute('aria-pressed',String(active));$('voice-toggle').setAttribute('aria-label',active?'Detener comando de voz':'Activar comando de voz');
    $('voice-toggle').innerHTML=active?'■ <span>Detener voz</span>':'◉ <span>Activar voz</span>';
    $('voice-state').textContent=state==='loading'?'VOZ LOCAL · CARGANDO':state==='listening'?'VOZ LOCAL · ESCUCHANDO':'VOZ LOCAL · INACTIVA';
    if(state==='idle'){$('voice-transcript').textContent='';voiceGate.reset();}if(message)status(state==='listening'&&$('wake-word').checked?'En escucha local. Decí «Globo, ir a Roma».':message);
  });
  const voiceGate=new ns.VoiceGate();
  function receiveVoice(text){
    $('voice-transcript').textContent='Escuchado: '+text;
    const result=voiceGate.accept(text,$('wake-word').checked,$('voice-conversation').checked);
    if(result.waiting){status('Te escucho. Decí el comando en los próximos 20 segundos.');return;}
    if(result.ignored){status('En espera. Decí «Globo»; también acepto «lobo».');return;}
    $('command').value=result.command;execute(result.command);
  }
  function startVoice(){voiceGate.reset();return ns.voice.start(receiveVoice,error=>status(error.message,true),text=>{if(text)$('voice-transcript').textContent='Escuchando: '+text;});}
  ['wake-word','voice-conversation'].forEach(id=>$(id).addEventListener('change',()=>voiceGate.reset()));
  $('voice-toggle').addEventListener('click',()=>{if(ns.voice.state!=='idle')ns.voice.stop();else startVoice();});
  $('world').addEventListener('click',world); $('globe').addEventListener('world-request',world);
  $('zoom-in').addEventListener('click',()=>execute('acercar')); $('zoom-out').addEventListener('click',()=>execute('alejar'));
  renderCatalog();
  refreshSelections();
  function togglePlaces(places,value){if(value)selections.add(places);else selections.remove(places);refreshSelections();status('Selección actualizada.');}
  ns.app = {execute,world,setSidebar,receiveVoice,selections,get globe(){return globe;},startVoice,visit,selectPlaces,togglePlaces,refreshSelections};
  ns.history.init(ns.app);
  ns.epochs.init(ns.app);
  ns.gestures=ns.initGestures(ns.app);
})(window.GH = window.GH || {});
