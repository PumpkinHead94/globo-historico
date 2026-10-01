(function(ns){
  'use strict';
  const bytes=Uint8Array.from(atob(ns.terrainData.base64),c=>c.charCodeAt(0));
  const view=new DataView(bytes.buffer);
  const heights=new Int16Array(bytes.length/2);
  for(let i=0;i<heights.length;i++) heights[i]=view.getInt16(i*2,true);
  delete ns.terrainData.base64;
  // Intervalos [mínimo, máximo), salvo el extremo superior abierto.
  const bands=[
    {min:-Infinity,max:-6000,color:'#163651',label:'Más de 6.000 m de profundidad'},
    {min:-6000,max:-3000,color:'#205578',label:'3.000–6.000 m de profundidad'},
    {min:-3000,max:-1000,color:'#397fa2',label:'1.000–3.000 m de profundidad'},
    {min:-1000,max:-200,color:'#66a7bc',label:'200–1.000 m de profundidad'},
    {min:-200,max:0,color:'#a0d3d4',label:'0–200 m de profundidad'},
    {min:0,max:200,color:'#7fb775',label:'0–200 m'},
    {min:200,max:500,color:'#afcc83',label:'200–500 m'},
    {min:500,max:1000,color:'#dbd699',label:'500–1.000 m'},
    {min:1000,max:2000,color:'#d9b579',label:'1.000–2.000 m'},
    {min:2000,max:3000,color:'#bf8d62',label:'2.000–3.000 m'},
    {min:3000,max:4500,color:'#95674e',label:'3.000–4.500 m'},
    {min:4500,max:6000,color:'#c6b8a7',label:'4.500–6.000 m'},
    {min:6000,max:Infinity,color:'#f1efe8',label:'Más de 6.000 m'}
  ];
  bands.forEach(b=>b.rgb=b.color.match(/\w\w/g).map(v=>parseInt(v,16)));
  const {width,height}=ns.terrainData;
  function sample(lat,lon){
    const x=Math.min(width-1,Math.floor((((lon+180)%360+360)%360)/360*width));
    const y=Math.max(0,Math.min(height-1,Math.floor((90-lat)/180*height)));
    return heights[y*width+x];
  }
  function canvas(shaded,landMask){
    const el=document.createElement('canvas');el.width=width;el.height=height;
    const ctx=el.getContext('2d');const image=ctx.createImageData(width,height);
    for(let i=0;i<heights.length;i++){
      const z=heights[i];
      const isLand=landMask && landMask[i*4+3]>128;
      const rgb=isLand&&z<0?[99,163,143]:bands.find(b=>z<b.max).rgb;
      let shade=1;
      if(shaded&&z>0){
        const x=i%width,y=Math.floor(i/width);
        const dx=heights[y*width+(x+1)%width]-heights[y*width+(x+width-1)%width];
        const dy=heights[Math.min(height-1,y+1)*width+x]-heights[Math.max(0,y-1)*width+x];
        shade=Math.max(.67,Math.min(1.14,1+(dy-dx)/3400));
      }
      for(let k=0;k<3;k++)image.data[i*4+k]=Math.min(255,rgb[k]*shade);
      image.data[i*4+3]=255;
    }
    ctx.putImageData(image,0,0);return el;
  }
  ns.terrain={bands,heights,sample,canvas};
})(window.GH=window.GH||{});
