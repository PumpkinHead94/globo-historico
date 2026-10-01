(function(ns){
  'use strict';
  const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const continents={'Africa':'África','Asia':'Asia','Europe':'Europa','North America':'América del Norte','South America':'América del Sur','Oceania':'Oceanía','Antarctica':'Antártida'};
  const subregions={'Australia and New Zealand':'Australia y Nueva Zelanda','Caribbean':'Caribe','Central America':'América Central','Central Asia':'Asia Central','Eastern Africa':'África Oriental','Eastern Asia':'Asia Oriental','Eastern Europe':'Europa Oriental','Melanesia':'Melanesia','Micronesia':'Micronesia','Polynesia':'Polinesia','Middle Africa':'África Central','Northern Africa':'África del Norte','Northern America':'Norteamérica septentrional','Northern Europe':'Europa del Norte','South America':'América del Sur','South-Eastern Asia':'Sudeste Asiático','Southern Africa':'África Austral','Southern Asia':'Asia del Sur','Southern Europe':'Europa del Sur','Western Africa':'África Occidental','Western Asia':'Asia Occidental','Western Europe':'Europa Occidental','Antarctica':'Antártida'};
  const aliases={USA:['estados unidos','estados unidos de america','eeuu'],GBR:['reino unido','gran bretana'],RUS:['rusia'],CZE:['chequia','republica checa'],CIV:['costa de marfil'],KOR:['corea del sur'],PRK:['corea del norte'],COD:['republica democratica del congo','congo kinshasa'],COG:['republica del congo','congo brazzaville'],ARE:['emiratos arabes unidos'],SWZ:['esuatini','suazilandia'],MKD:['macedonia del norte'],TUR:['turquia'],TLS:['timor oriental'],PSE:['palestina'],TWN:['taiwan']};
  // «Panamá» designa el país; el accidente conserva su nombre explícito.
  ns.places.find(p=>p.id==='panama').aliases=['istmo de panama'];
  ns.places.find(p=>p.id==='gibraltar').aliases=['estrecho de gibraltar'];
  ns.regions=new Map();
  for(const row of ns.regionData){
    const existing=ns.places.find(p=>norm(p.name)===norm(row.name)&&p.kind!=='País / territorio');
    if(!existing&&ns.places.some(p=>norm(p.name)===norm(row.name)))row.name+=' ('+row.english+')';
    const geometry={type:'Feature',properties:{},geometry:row.geometry};
    const p=existing||{id:'pais-'+row.id,name:row.name,lat:row.lat,lon:row.lon,aliases:[]};
    Object.assign(p,{kind:'País / territorio',region:continents[row.continent]||'Territorio',geometry,selectionType:'area',description:`${row.name}: límites cartográficos actuales de Natural Earth. La selección conserva el relieve visible bajo el color.`});
    p.aliases=[...new Set([...p.aliases,row.english,...(aliases[row.id]||[])])];
    const bounds=d3.geoBounds(geometry);let width=(bounds[1][0]-bounds[0][0]+360)%360;
    p.scale=Math.max(width,bounds[1][1]-bounds[0][1])>35?3.03:2.2;
    if(!existing)ns.places.push(p);ns.regions.set(row.id,p);
  }
  function group(name,rows,extra=[]){
    if(!rows.length||ns.places.some(p=>norm(p.name)===norm(name)))return;
    const geometry={type:'FeatureCollection',features:rows.map(r=>ns.regions.get(r.id).geometry)};
    const center=d3.geoCentroid(geometry);
    ns.places.push({id:'region-'+norm(name).replace(/\s+/g,'-'),name,kind:'Región',region:'Agrupación geográfica',lat:center[1],lon:center[0],scale:3.03,aliases:extra,geometry,selectionType:'area',description:`${name}: agrupación de países y territorios según Natural Earth. Los países transcontinentales se incluyen completos según la clasificación de la fuente.`});
  }
  for(const [key,name] of Object.entries(continents))group(name,ns.regionData.filter(r=>r.continent===key),key==='South America'?['sudamerica','suramerica']:key==='North America'?['norteamerica']:[]);
  for(const [key,name] of Object.entries(subregions))group(name,ns.regionData.filter(r=>r.subregion===key),key==='Central America'?['centroamerica']:[]);
  group('América',ns.regionData.filter(r=>['North America','South America'].includes(r.continent)),['las americas']);
  ns.places.forEach(p=>{if(!p.selectionType)p.selectionType='point';});
})(window.GH=window.GH||{});
