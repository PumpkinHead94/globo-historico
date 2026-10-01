(function(ns){
  // Trazados didácticos propios: patrones generales, no observaciones ni pronósticos.
  const rows=[
    ['Golfo','warm',[[-80,25],[-77,33],[-65,40],[-45,45]]],['Brasil','warm',[[-34,-8],[-38,-20],[-48,-34]]],
    ['Kuroshio','warm',[[124,20],[129,29],[140,35],[155,36]]],['Australia Oriental','warm',[[154,-16],[155,-25],[153,-35]]],
    ['Agulhas','warm',[[35,-24],[30,-32],[22,-37],[28,-39]]],['Alaska','warm',[[-150,48],[-140,55],[-150,59],[-163,55]]],
    ['Humboldt','cold',[[-77,-43],[-76,-30],[-80,-15],[-85,-4]]],['California','cold',[[-128,47],[-127,38],[-120,28],[-115,23]]],
    ['Canarias','cold',[[-15,42],[-19,30],[-23,20],[-30,15]]],['Benguela','cold',[[13,-35],[9,-27],[9,-17]]],
    ['Labrador','cold',[[-56,60],[-56,53],[-52,45]]],['Malvinas','cold',[[-61,-55],[-59,-46],[-54,-38]]],
    ['Oyashio','cold',[[164,54],[156,47],[147,40]]],['Australia Occidental','cold',[[109,-35],[111,-27],[109,-20]]],
    ['Circumpolar Antártica','cold',[[-180,-57],[-120,-57],[-60,-57],[0,-57],[60,-57],[120,-57],[180,-57]]]
  ];
  ns.flows=rows.map(([name,category,path],i)=>({id:'corriente-'+i,name:'Corriente '+(name==='Circumpolar Antártica'?'':name==='Golfo'?'del ':'de ')+name,category,paths:[path],aliases:name==='Humboldt'?['corriente del peru','corriente de humboldt']:name==='Golfo'?['corriente del golfo']:[],lat:path[Math.floor(path.length/2)][1],lon:path[Math.floor(path.length/2)][0]}));
  const winds=[['Alisios del noreste',25,6,-32],['Alisios del sudeste',-25,-6,-32],['Vientos del oeste del norte',35,55,40],['Vientos del oeste del sur',-35,-55,40],['Vientos polares del norte',80,65,-40],['Vientos polares del sur',-80,-65,-40]];
  winds.forEach(([name,start,end,delta],i)=>ns.flows.push({id:'viento-'+i,name,category:'wind',aliases:[],lat:(start+end)/2,lon:-25,paths:[-150,-90,-30,30,90,150].map(lon=>[[lon,start],[lon+delta,end]])}));
  ns.flows.forEach(p=>Object.assign(p,{selectionType:'flow',flowColor:p.category==='warm'?'#ff826b':p.category==='cold'?'#58baff':'#f3d66b',scale:3.03,kind:p.category==='wind'?'Viento predominante':p.category==='warm'?'Corriente cálida':'Corriente fría',region:'Circulación general · esquema',description:'Las flechas indican el sentido general del recorrido. Esquema didáctico: la posición varía con la estación y las condiciones locales. Fría/cálida es una clasificación relativa, no una temperatura medida.'}));
  ns.places.push(...ns.flows);
})(window.GH);

