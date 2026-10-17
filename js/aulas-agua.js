(function(ns){
  'use strict';
  const $=id=>document.getElementById(id);
  const groups={
    mesopotamia:{name:'Mesopotamia',rivers:['Tigris','Éufrates']},
    egipto:{name:'Egipto',rivers:['Nilo']},
    india:{name:'India y valle del Indo',rivers:['Indo','Ganges','Brahmaputra','Ravi']},
    china:{name:'China',rivers:['Amarillo','Yangtsé']},
    europa:{name:'Europa',rivers:['Danubio','Rin','Ródano','Sena','Tíber','Po','Támesis','Tajo','Ebro']},
    america:{name:'América',rivers:['Amazonas','Paraná','Uruguay','Orinoco','Mississippi','Magdalena'],lakes:['Lago Titicaca']}
  };
  const cities=[
    {node:'menfis',river:'Nilo',dates:'Egipto antiguo · Reino Antiguo',text:'Menfis permite estudiar el acceso al valle y al delta del Nilo, la producción agrícola y el transporte. El curso actual es una referencia geográfica, no una reconstrucción antigua.',source:'https://whc.unesco.org/en/list/86/'},
    {node:'mohenjo',river:'Indo',dates:'Civilización del Indo · III milenio a. C.',text:'Mohenjo-Daro permite explorar una ciudad del valle del Indo y su relación con el entorno agrícola y las redes de intercambio. El río y sus brazos cambiaron: no inferir una ribera antigua exacta de este mapa.',source:'https://whc.unesco.org/en/list/138/'},
    {node:'carquemis',river:'Éufrates',dates:'Bronce tardío y Edad del Hierro',text:'Carquemis es un nodo sobre el Éufrates incluido en la ficha de los hititas. Sirve para explorar pasos y conexiones del norte de Siria. El trazado es actual, no una ruta antigua comprobada.',source:null}
  ];
  let app=null;
  const norm=s=>ns.commands.normalize(s).replace(/^rio /,'');
  function river(name){return ns.places.find(p=>p.category==='river'&&norm(p.name)===norm(name));}
  function members(key){const g=groups[key];return [...g.rivers.map(river),...(g.lakes||[]).map(n=>ns.places.find(p=>p.name===n))].filter(Boolean);}
  function sync(){if(!app)return;for(const key of Object.keys(groups)){const c=$('water-'+key),ps=members(key),n=ps.filter(p=>app.selections.items.has(p.id)).length;c.checked=ps.length>0&&n===ps.length;c.indeterminate=n>0&&n<ps.length;}}
  function focus(){if(!app.globe)return;app.globe.hydroFocus=true;for(const layer of ['water','labels']){app.globe.setLayer(layer,true);$('layer-'+layer).checked=true;}$('water-panel').open=true;}
  function activate(){focus();if(!app.selections.values().some(i=>i.place.category==='river'))app.togglePlaces(['Nilo','Tigris','Éufrates','Indo','Ganges','Amarillo','Yangtsé','Danubio','Rin','Amazonas','Paraná'].map(river).filter(Boolean),true);}
  function group(key,value){focus();const ps=members(key);app.togglePlaces(ps,value);if(value)app.globe?.frameSelection(ps.map(place=>({place})));$('water-note').textContent=groups[key].name+': '+ps.map(p=>p.name).join(', ')+'. Cursos actuales.';}
  function city(index){const c=cities[index],n=ns.historyData.nodes[c.node];const place={id:'water-city-'+c.node,name:n[0],shortName:n[0],lat:n[1],lon:n[2],scale:2.1,category:'historical',waterCity:true,aliases:[],region:c.dates,description:c.dates+'. '+c.text,flowColor:'#ffd166'};focus();app.selectPlaces([place,river(c.river)].filter(Boolean));app.visit(place);$('water-note').textContent=c.dates+'. '+c.text;}
  function cityLink(place){const index=cities.findIndex(c=>norm(ns.historyData.nodes[c.node][0])===norm(place.name));const b=$('city-water-link');b.hidden=index<0;b.onclick=index<0?null:()=>city(index);}
  function parse(text){const q=ns.commands.normalize(text);if(/^(vista hidrografia|ver hidrografia|mostrar hidrografia)$/.test(q))return {type:'water',action:'view'};const m=q.match(/^(mostrar|seleccionar|ocultar|quitar) rios (?:de |del )?(mesopotamia|egipto|india|china|europa|america)$/);if(m)return {type:'water',action:'group',key:m[2],value:['mostrar','seleccionar'].includes(m[1])};const c=q.match(/^(?:mostrar )?entorno (?:fluvial )?de (.+)$/);if(c){const index=cities.findIndex(cit=>norm(ns.historyData.nodes[cit.node][0]).replace(/-/g,' ')===c[1].replace(/-/g,' '));if(index>=0)return {type:'water',action:'city',index};}return null;}
  function handle(r){if(r.action==='view')ns.epochs.preset('hydro');if(r.action==='group')group(r.key,r.value);if(r.action==='city')city(r.index);}
  function init(api){app=api;for(const [key,g] of Object.entries(groups)){const label=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.id='water-'+key;c.addEventListener('change',()=>group(key,c.checked));label.append(c,document.createTextNode(' '+g.name));$('water-groups').append(label);}for(const [i,c] of cities.entries()){const row=document.createElement('p'),b=document.createElement('button');b.textContent=ns.historyData.nodes[c.node][0]+' · '+c.river;b.addEventListener('click',()=>city(i));row.append(b);if(c.source){const a=document.createElement('a');a.href=c.source;a.target='_blank';a.rel='noopener';a.textContent='Fuente: UNESCO';row.append(a);}$('water-cities').append(row);}$('water-view').addEventListener('click',()=>ns.epochs.preset('hydro'));sync();}
  ns.waterStudy={cityLink,init,parse,handle,activate,sync,groups,members,river};
})(window.GH=window.GH||{});
