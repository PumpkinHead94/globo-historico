(function(ns){
  'use strict';
  const data=ns.historyData, norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[¿?¡!.,;:«»"']/g,'').replace(/\s+/g,' ').trim();
  const periods={antigua:'Antigüedad',medieval:'Mundo medieval',moderna:'Expansión ultramarina y Edad Moderna'};
  const names=new Set(ns.places.flatMap(p=>[p.name,...p.aliases]).map(norm));
  const topics=data.topics.map(t=>{
    const settlements=t.nodes.map(key=>{
      const [name,lat,lon,note]=data.nodes[key];
      const p={id:'hist-'+t.id+'-'+key,name:name+' · '+t.name,shortName:name,lat,lon,scale:2.1,kind:'Asentamiento / nodo histórico',category:'historical',selectionType:'point',historyTopic:t.id,region:t.dates,aliases:[],description:note+' Marco de esta ficha: '+t.dates+'. Ubicación aproximada; la marca no representa su extensión urbana.'};
      // Los destinos modernos conservan sus nombres y sus comandos anteriores.
      if(!names.has(norm(name))){p.aliases.push(name);names.add(norm(name));}
      return p;
    });
    const routes=t.edges.length?[{id:'red-'+t.id,name:'Red comercial de '+t.name,shortName:'Red · '+t.name,lat:settlements[0].lat,lon:settlements[0].lon,scale:3.03,kind:'Red comercial · esquema',category:'trade',selectionType:'line',historyTopic:t.id,region:t.routeDates,aliases:[],geometry:{type:'MultiLineString',coordinates:t.edges.map(([a,b])=>[data.nodes[a].slice(1,3).reverse(),data.nodes[b].slice(1,3).reverse()])},description:'Vínculos representativos entre nodos. '+t.routeDates+'. Líneas esquemáticas: no reproducen caminos, escalas marítimas ni itinerarios exactos. Los nodos y vínculos no necesariamente coexistieron durante todo el período.'}]:[];
    ns.places.push(...settlements,...routes);return {...t,settlements,routes};
  });
  let current=topics[0], api=null;
  function match(query){return topics.filter(t=>[t.name,...t.aliases].some(a=>norm(a)===norm(query)));}
  function parse(text){
    const q=norm(text);
    if(/^(historia|abrir historia|explorador historico)$/.test(q))return {type:'history',action:'open'};
    if(q==='limpiar historia')return {type:'history',action:'clear'};
    const era=q.match(/^(?:ver|mostrar) (antiguedad|edad media|mundo medieval|edad moderna)$/);
    if(era)return {type:'history',action:'era',era:era[1]==='antiguedad'?'antigua':era[1]==='edad moderna'?'moderna':'medieval'};
    const m=q.match(/^(historia de|recursos(?: economicos)? de|asentamientos de|mostrar asentamientos de|red(?: comercial)? de|mostrar red(?: comercial)? de|ocultar red(?: comercial)? de) (.+)$/);
    if(!m)return null;
    const found=match(m[2]);
    if(!found.length)return {type:'unknown',query:m[2]};
    return {type:'history',topic:found[0].id,action:m[1].startsWith('recursos')?'resources':m[1].startsWith('ocultar')?'hide-routes':m[1].includes('red')?'routes':m[1].includes('asentamientos')?'settlements':'open'};
  }
  const $=id=>document.getElementById(id);
  function showPanel(){api.setSidebar(true);$('history-panel').open=true;const side=$('sidebar'),panel=$('history-panel');side.scrollTop+=panel.getBoundingClientRect().top-side.getBoundingClientRect().top-12;}
  function populate(){
    const visible=topics.filter(t=>!$('history-era').value||t.era===$('history-era').value);
    $('history-topic').replaceChildren(...visible.map(t=>{const o=document.createElement('option');o.value=t.id;o.textContent=t.name;return o;}));
    if(!visible.includes(current))current=visible[0];$('history-topic').value=current.id;render();
  }
  function setTopic(id){current=topics.find(t=>t.id===id)||current;$('history-era').value=current.era;populate();}
  function row(place){
    const label=document.createElement('label');label.className='history-row';
    const c=document.createElement('input');c.type='checkbox';c.dataset.historyId=place.id;c.setAttribute('aria-label','Seleccionar '+place.name);c.addEventListener('change',()=>api.togglePlaces([place],c.checked));
    const b=document.createElement('button');b.type='button';b.textContent=place.shortName;b.addEventListener('click',e=>{e.preventDefault();api.visit(place);});
    // No envolver el botón en el label del checkbox: ambos tienen acciones distintas.
    const div=document.createElement('div');div.className='history-row';label.append(c);div.append(label,b);return div;
  }
  function render(){
    $('history-dates').textContent=periods[current.era]+' · '+current.dates;
    $('history-about').textContent=current.about;
    $('history-production').textContent=current.production;$('history-exchange').textContent=current.exchange;$('history-work').textContent=current.organization;
    $('history-nodes').replaceChildren(...current.settlements.map(row));
    $('history-routes').replaceChildren(...current.routes.map(row));
    $('history-no-route').hidden=!!current.routes.length;
    $('history-sources').replaceChildren(...current.sources.map(key=>{const [name,url]=data.sources[key];const a=document.createElement('a');a.href=url;a.textContent=name+' ↗';a.target='_blank';a.rel='noopener noreferrer';return a;}));
    sync();
  }
  function sync(){
    if(!api)return;
    document.querySelectorAll('[data-history-id]').forEach(c=>c.checked=api.selections.items.has(c.dataset.historyId));
    const count=current.settlements.filter(p=>api.selections.items.has(p.id)).length,c=$('history-all');c.checked=count===current.settlements.length;c.indeterminate=count>0&&count<current.settlements.length;
    $('history-total').textContent=ns.places.filter(p=>p.historyTopic&&api.selections.items.has(p.id)).length;
  }
  function handle(result){
    if(result.action==='clear'){api.togglePlaces(ns.places.filter(p=>p.historyTopic),false);return;}
    if(result.topic)setTopic(result.topic);
    if(result.action==='era'){$('history-era').value=result.era;populate();}
    showPanel();
    if(result.action==='resources')$('history-economy').open=true;
    if(result.action==='settlements')api.selectPlaces(current.settlements);
    if(result.action==='routes'){api.selectPlaces([...current.settlements,...current.routes]);}
    if(result.action==='hide-routes')api.togglePlaces(current.routes,false);
  }
  function init(app){
    api=app;$('history-era').addEventListener('change',populate);$('history-topic').addEventListener('change',()=>{current=topics.find(t=>t.id===$('history-topic').value);render();});
    $('history-all').addEventListener('change',e=>api.togglePlaces(current.settlements,e.target.checked));
    $('history-focus').addEventListener('click',()=>api.selectPlaces(current.settlements));
    $('history-clear').addEventListener('click',()=>handle({action:'clear'}));
    $('history-toggle').addEventListener('click',showPanel);populate();
  }
  ns.history={topics,periods,parse,init,sync,handle,setTopic};
})(window.GH);
