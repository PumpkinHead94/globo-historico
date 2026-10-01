(function(ns){
  const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const names={Nile:'Nilo',Amazonas:'Amazonas',Amazon:'Amazonas',Danube:'Danubio',Donau:'Danubio',Ganges:'Ganges',Ganga:'Ganges',Rhein:'Rin',Rhône:'Ródano',Niger:'Níger',Indus:'Indo',Huang:'Amarillo',Chang:'Yangtsé',Congo:'Congo',Dnieper:'Dniéper',Dnipro:'Dniéper',Vistula:'Vístula',Orange:'Orange',Tigris:'Tigris','Al Furat':'Éufrates',Firat:'Éufrates',Euphrates:'Éufrates'};
  function add(name,features,category,aliases=[]){
    const geometry={type:'FeatureCollection',features};const center=d3.geoCentroid(geometry);
    const old=ns.places.find(p=>norm(p.name)===norm(name)||((category==='river'||category==='sea')&&p.aliases.some(a=>norm(a)===norm(name))));
    const p=old||{id:category+'-'+norm(name).replace(/[^a-z0-9]+/g,'-'),name,aliases:[]};
    Object.assign(p,{geometry,category,selectionType:category==='river'?'line':'area',lat:center[1],lon:center[0],scale:category==='ocean'?3.03:2.5,kind:({river:'Río',sea:'Mar / golfo / bahía',ocean:'Océano',strait:'Estrecho / canal',lake:'Lago / embalse'})[category],region:'Hidrografía · Natural Earth',description:category==='river'?'Curso simplificado de Natural Earth, incluidos tramos de conexión a través de lagos. No representa toda la red de afluentes.':category==='lake'?'Superficie lacustre generalizada de Natural Earth. Su extensión varía; representa cartografía moderna, no las orillas de la Antigüedad.': 'Área marina generalizada de Natural Earth; sus bordes son cartográficos, no límites jurisdiccionales.'});
    p.aliases=[...new Set([...p.aliases,...aliases])];if(!old)ns.places.push(p);
  }
  const seas=new Map();for(const f of ns.hydroData.marine){let n=f.properties.name_es||f.properties.name;n=n.charAt(0).toUpperCase()+n.slice(1).replace(/\.$/,'');if(n==='Mediterráneo')n='Mar Mediterráneo';if(!seas.has(n))seas.set(n,[]);seas.get(n).push(f);}
  for(const [n,fs] of seas){let type=fs[0].properties.featurecla;add(n,fs,type==='ocean'?'ocean':['strait','channel'].includes(type)?'strait':'sea',fs.map(f=>f.properties.name));}
  const rivers=new Map();for(const f of ns.hydroData.rivers){const original=f.properties.name;if(!original||/Canal/.test(original))continue;let name=(names[original]||original).replace(/\s+/g,' ').trim();name=/^r[ií]o /i.test(name)?name:'Río '+name;if(!rivers.has(name))rivers.set(name,[]);rivers.get(name).push(f);}
  for(const [n,fs] of rivers)add(n,fs,'river');
  const lakes=new Map();for(const f of ns.hydroData.lakes||[]){let n=f.properties.name_es||f.properties.name;n=n.charAt(0).toUpperCase()+n.slice(1);if(!/^(Lago|Laguna|Mar |Embalse|Bahía|Canal)/.test(n))n='Lago '+n;if(!lakes.has(n))lakes.set(n,[]);lakes.get(n).push(f);}
  for(const [n,fs] of lakes)add(n,fs,'lake',fs.map(f=>f.properties.name));
  const notes={'Río Nilo':'El valle y el delta del Nilo permiten explorar la relación entre agricultura, transporte fluvial y ciudades del antiguo Egipto.', 'Río Tigris':'Junto con el Éufrates, forma el gran marco fluvial de Mesopotamia. Explorá el papel del riego y los canales en los asentamientos.', 'Río Éufrates':'Babilonia ofrece un punto de partida para estudiar las ciudades mesopotámicas y su relación con el Éufrates y los canales.', 'Río Indo':'El valle del Indo permite estudiar la relación entre agua, agricultura y urbanización en el sur de Asia.', 'Río Amarillo':'Un eje para explorar los asentamientos antiguos del norte de China. Los cursos fluviales cambian con el tiempo.'};
  for(const p of ns.places)if(notes[p.name])p.description=notes[p.name]+' '+p.description+' El trazado mostrado es moderno, no una reconstrucción del cauce antiguo.';
  ns.places.forEach(p=>{if(!p.category)p.category=p.kind==='País / territorio'?'country':p.kind==='Región'?'region':/Estrecho/.test(p.name)?'strait':'place';});
})(window.GH);
