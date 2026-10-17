(function(ns){
  const $=id=>document.getElementById(id),data=ns.epochData;
  let api=null,current=null,items=[];
  const off=new Set();
  function ringArea(r){return r.reduce((s,p,i)=>{const q=r[(i+1)%r.length];return s+p[0]*q[1]-q[0]*p[1];},0);}
  function geometry(g){const copy=JSON.parse(JSON.stringify(g));const polys=copy.type==='Polygon'?[copy.coordinates]:copy.coordinates;polys.forEach(poly=>poly.forEach((r,i)=>{if((ringArea(r)>0)===(i===0))r.reverse();}));return copy;}
  function point(key,kind,description){const [name,lat,lon]=data.nodes[key];return {id:`ep-${current.year}-${kind}-${key}`,epoch:true,name,shortName:name,lat,lon,scale:2.2,category:'historical',region:current.label,aliases:[],description:description+' '+current.label,flowColor:kind==='resource'?'#ffd166':'#edf5ff',epochLayer:kind};}
  function features(){
    if(!current)return [];
    const groups=new Map();
    for(const f of ns.epochGeometry[current.year].features){const name=f.properties.NAME;if(!groups.has(name))groups.set(name,[]);groups.get(name).push({type:'Feature',properties:{},geometry:geometry(f.geometry)});}
    const territories=[...groups].map(([key,fs])=>{const [name,color,lat,lon]=data.names[key];return {id:`ep-${current.year}-${key}`,epoch:true,name,shortName:name,lat,lon,scale:2.5,aliases:[],region:current.label,category:'historical',epochLayer:'territory',flowColor:color,geometry:{type:'FeatureCollection',features:fs},description:current.note+' Extensión aproximada de Historical Basemaps; no implica ocupación uniforme ni fronteras precisas.'};});
    const cities=current.cities.map(k=>point(k,'city','Asentamiento seleccionado para este momento. Ubicación representativa, no extensión urbana.'));
    const resources=current.resources.map(r=>point(r.node,'resource',r.text));
    const routes=current.routes.map((r,i)=>({id:`ep-${current.year}-route-${i}`,epoch:true,name:r.name,shortName:r.name,lat:data.nodes[r.nodes[0]][1],lon:data.nodes[r.nodes[0]][2],aliases:[],region:current.label,category:'trade',epochLayer:'route',selectionType:'line',flowColor:'#f7cb79',geometry:{type:'LineString',coordinates:r.nodes.map(k=>data.nodes[k].slice(1).reverse())},description:r.note+' '+current.label}));
    return [...territories,...cities,...routes,...resources];
  }
  function render(){
    const all=features();
    items=all.filter(p=>$('epoch-'+p.epochLayer).checked&&!off.has(p.id)).map(place=>({place,color:place.flowColor}));
    $('epoch-legend').replaceChildren(...all.filter(p=>p.epochLayer==='territory').map(p=>{const label=document.createElement('label'),c=document.createElement('input'),swatch=document.createElement('i');c.type='checkbox';c.checked=!off.has(p.id);c.addEventListener('change',()=>{if(c.checked)off.delete(p.id);else off.add(p.id);render();});swatch.style.background=p.flowColor;label.append(c,swatch,document.createTextNode(p.name));return label;}));
    $('epoch-economy').textContent=current?current.economy:'Seleccioná un momento disponible.';
    $('epoch-date').textContent=current?current.label:$('epoch-century').value?'Sin reconstrucción disponible para este siglo.':'Época histórica desactivada';
    $('epoch-summary-date').textContent=current?` · ${Math.abs(current.year)} ${current.year<0?'a. C.':'d. C.'}`:$('epoch-century').value?' · sin datos':'';
    $('epoch-note').textContent=current?current.note:'No se reutiliza el mapa de otra fecha. Las zonas sin colorear no están vacías: quedan fuera de esta selección.';
    $('epoch-sources').replaceChildren();
    if(current)for(const [name,url] of [['Cartografía · A. Ourednik y colaboradores (GPL-3.0)','https://github.com/aourednik/historical-basemaps'],...current.sources]){const a=document.createElement('a');a.textContent=name;a.href=url;a.target='_blank';a.rel='noopener';$('epoch-sources').append(a);}
    api.refreshSelections();
  }
  function preset(view){
    if(view==='hydro'){preset('geography');ns.waterStudy.activate();$('map-view').value='hydro';return;}
    if(api.globe)api.globe.hydroFocus=false;
    if(!['geography','territories','trade','resources'].includes(view))return;
    if(view!=='geography'&&!current){
      $('map-view').value='geography';
      $('view-note').textContent='Seleccioná primero un siglo con reconstrucción disponible.';
      return;
    }
    const layers={geography:[],territories:['territory'],trade:['route','city'],resources:['resource']}[view];
    for(const name of ['territory','city','route','resource'])$('epoch-'+name).checked=layers.includes(name);
    $('map-view').value=view;
    $('soft-relief').checked=view!=='geography';api.globe?.setLayer('soft',view!=='geography');
    $('view-note').textContent='Podés combinar las casillas. Los nombres aumentan al acercarte; seleccioná uno para leer su ficha.';
    render();
  }
  function change(year){
    const wasActive=!!current;
    current=data.snapshots.find(s=>s.year===Number(year))||null;
    // Las selecciones históricas amplias no pueden presentarse como contemporáneas al corte elegido.
    api.selections.remove(api.selections.values().filter(i=>i.place.historyTopic||i.place.epoch).map(i=>i.place));
    off.clear();$('epoch-moment').value=current?String(current.year):'';
    if(current)$('epoch-century').value=String(current.century);
    if(current&&!wasActive)$('epoch-borders').checked=false;
    if(!current)$('epoch-borders').checked=true;
    api.globe?.setLayer('borders',current?$('epoch-borders').checked:true);
    if(current&&!wasActive)preset('territories');
    else if(!current)preset('geography');
    render();if(current&&api.globe){api.globe.flyTo({lat:34,lon:30,scale:3.03});api.globe.marker.visible=false;}
  }
  function century(value){$('epoch-century').value=String(value);const match=data.snapshots.find(s=>s.century===Number(value));change(match?.year||'');}
  const roman=['','I','II','III','IV','V','VI','VII','VIII'];
  const spoken={primero:1,primer:1,uno:1,segundo:2,dos:2,tercero:3,tres:3,cuarto:4,cuatro:4,quinto:5,cinco:5,sexto:6,seis:6,septimo:7,siete:7,octavo:8,ocho:8};
  function parse(text){const q=ns.commands.normalize(text);
    const view=q.match(/^(?:vista |ver )(geografia|territorios historicos|comercio|recursos economicos)$/);
    if(view)return {type:'epoch',action:'view',value:{geografia:'geography','territorios historicos':'territories',comercio:'trade','recursos economicos':'resources'}[view[1]]};
    if(/^(epoca historica|abrir epoca historica)$/.test(q))return {type:'epoch',action:'open'};
    if(/^(salir de la historia|desactivar epoca historica|mapa actual)$/.test(q))return {type:'epoch',action:'off'};
    if(/^(siguiente periodo|avanzar al siguiente periodo|periodo anterior)$/.test(q))return {type:'epoch',action:q==='periodo anterior'?'previous':'next'};
    const m=q.match(/^(?:mostrar |ver |ir al )?siglo (\w+) (antes de cristo|despues de cristo|a c|d c)$/);
    if(m){const number=spoken[m[1]]|| (roman.indexOf(m[1].toUpperCase())>0?roman.indexOf(m[1].toUpperCase()):Number(m[1]));if(number>=1&&number<=8)return {type:'epoch',action:'century',value:number*(m[2]==='antes de cristo'||m[2]==='a c'?-1:1)};}
    const layer=q.match(/^(mostrar|ocultar) (territorios historicos|ciudades historicas|rutas historicas|recursos historicos|fronteras actuales)$/);
    if(layer)return {type:'epoch',action:'layer',value:layer[1]==='mostrar',layer:{'territorios historicos':'territory','ciudades historicas':'city','rutas historicas':'route','recursos historicos':'resource','fronteras actuales':'borders'}[layer[2]]};
    return null;
  }
  function handle(r){$('epoch-panel').open=true;if(r.action==='view')preset(r.value);if(r.action==='century')century(r.value);if(r.action==='off'){$('epoch-century').value='';change('');}if(r.action==='next'||r.action==='previous'){let i=data.snapshots.indexOf(current);i=Math.max(0,Math.min(data.snapshots.length-1,i+(r.action==='next'?1:-1)));change(data.snapshots[i].year);}if(r.action==='layer'){$('map-view').value='custom';$('epoch-'+r.layer).checked=r.value;if(r.layer==='borders')api.globe?.setLayer('borders',r.value);render();}}
  function init(app){api=app;$('map-view').addEventListener('change',e=>preset(e.target.value));$('soft-relief').addEventListener('change',e=>api.globe?.setLayer('soft',e.target.checked));for(const value of [-8,-7,-6,-5,-4,-3,-2,-1,1,2,3,4,5,6,7,8]){const o=document.createElement('option');o.value=value;o.textContent=`Siglo ${roman[Math.abs(value)]} ${value<0?'a. C.':'d. C.'}`+(data.snapshots.some(s=>s.century===value)?' · disponible':' · pendiente');$('epoch-century').append(o);}for(const s of data.snapshots){const o=document.createElement('option');o.value=s.year;o.textContent=s.label;$('epoch-moment').append(o);}$('epoch-century').addEventListener('change',e=>century(e.target.value));$('epoch-moment').addEventListener('change',e=>{if(!e.target.value)$('epoch-century').value='';change(e.target.value);});for(const layer of ['territory','city','route','resource'])$('epoch-'+layer).addEventListener('change',()=>{$('map-view').value='custom';render();});$('epoch-borders').addEventListener('change',e=>api.globe?.setLayer('borders',e.target.checked));render();}
  ns.epochs={init,preset,parse,handle,change,get items(){return items;},get current(){return current;}};
})(window.GH=window.GH||{});
