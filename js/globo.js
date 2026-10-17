(function (ns) {
  'use strict';
  const radians = Math.PI / 180;
  // Coincide con la orientación UV de SphereGeometry y el mapa equirectangular.
  function position(lat, lon, radius = 1) {
    return new THREE.Vector3(radius * Math.cos(lat * radians) * Math.cos(lon * radians), radius * Math.sin(lat * radians), -radius * Math.cos(lat * radians) * Math.sin(lon * radians));
  }
  function features(topology) {
    const {scale,translate} = topology.transform;
    const arcs = topology.arcs.map(arc => {
      let x = 0, y = 0;
      return arc.map(point => { x += point[0]; y += point[1]; return [x * scale[0] + translate[0], y * scale[1] + translate[1]]; });
    });
    function ring(indices) {
      const points = [];
      indices.forEach((index,i) => {
        const arc = index < 0 ? arcs[~index].slice().reverse() : arcs[index];
        points.push(...(i ? arc.slice(1) : arc));
      });
      return points;
    }
    return topology.objects.countries.geometries.map(geometry => ({type:'Feature',properties:geometry.properties,geometry:{type:geometry.type,coordinates:geometry.type === 'Polygon' ? geometry.arcs.map(ring) : geometry.arcs.map(polygon => polygon.map(ring))}}));
  }
  let landFeatures;
  function makeTexture(options) {
    const canvas = document.createElement('canvas'); canvas.width = 4096; canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#173747'; ctx.fillRect(0,0,canvas.width,canvas.height);
    const projection = d3.geoEquirectangular().scale(canvas.width / (2 * Math.PI)).translate([canvas.width / 2, canvas.height / 2]).precision(.15);
    const path = d3.geoPath(projection,ctx);
    landFeatures = landFeatures || features(ns.topology);
    if(options.relief){
      const mask=document.createElement('canvas');mask.width=ns.terrainData.width;mask.height=ns.terrainData.height;
      const maskCtx=mask.getContext('2d');
      const maskPath=d3.geoPath(d3.geoEquirectangular().scale(mask.width/(2*Math.PI)).translate([mask.width/2,mask.height/2]),maskCtx);
      landFeatures.forEach(feature=>{maskCtx.beginPath();maskPath(feature);maskCtx.fill();});
      ctx.drawImage(ns.terrain.canvas(options.shade,maskCtx.getImageData(0,0,mask.width,mask.height).data),0,0,canvas.width,canvas.height);
    }
    for (const feature of landFeatures) {
      ctx.beginPath(); path(feature); if(!options.relief){ctx.fillStyle = '#93ad95'; ctx.fill();}
      ctx.strokeStyle = options.relief?'rgba(52,65,46,.45)':'#577c77'; ctx.lineWidth = .9; ctx.stroke();
    }
    if(options.water){
      ctx.beginPath();path(ns.lakes);ctx.fillStyle='#68b6d4';ctx.fill();
      ctx.beginPath();path(ns.rivers);ctx.strokeStyle='#308ebd';ctx.lineWidth=2.1;ctx.stroke();
    }
    ctx.beginPath(); path(d3.geoGraticule().step([15,15])()); ctx.strokeStyle = 'rgba(190,217,218,.13)'; ctx.lineWidth = .85; ctx.stroke();
    ctx.beginPath(); path({type:'LineString',coordinates:d3.range(-180,181,2).map(lon=>[lon,0])}); ctx.strokeStyle = 'rgba(211,232,216,.28)'; ctx.lineWidth = 1.3; ctx.stroke();
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
  }
  class Globe {
    constructor(element) {
      this.element = element; this.lat = 18; this.lon = -25; this.distance = 3.03;
      this.layers={relief:true,shade:true,water:true,labels:true};
      this.target = {lat:this.lat,lon:this.lon,distance:this.distance};
      this.renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,2));
      this.renderer.setClearColor(0x000000,0);
      this.renderer.domElement.setAttribute('aria-hidden','true');
      element.appendChild(this.renderer.domElement);
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(40,1,.01,100);
      this.scene.add(new THREE.AmbientLight(0xe8f1fa,2));
      this.light = new THREE.DirectionalLight(0xffffff,2.2); this.scene.add(this.light);
      this.earth = new THREE.Mesh(new THREE.SphereGeometry(1,128,80),new THREE.MeshBasicMaterial({map:makeTexture(this.layers)}));
      this.scene.add(this.earth);
      this.selectionCanvas=document.createElement('canvas');this.selectionCanvas.width=4096;this.selectionCanvas.height=2048;
      this.selectionTexture=new THREE.CanvasTexture(this.selectionCanvas);this.selectionTexture.colorSpace=THREE.SRGBColorSpace;
      this.selectionMesh=new THREE.Mesh(new THREE.SphereGeometry(1.002,128,80),new THREE.MeshBasicMaterial({map:this.selectionTexture,transparent:true,depthWrite:false}));
      this.scene.add(this.selectionMesh);
      this.marker = new THREE.Group();
      const dot = new THREE.Mesh(new THREE.SphereGeometry(.012,16,12),new THREE.MeshBasicMaterial({color:0xf1f8bc})); dot.position.z = .004;
      const ring = new THREE.Mesh(new THREE.RingGeometry(.021,.027,48),new THREE.MeshBasicMaterial({color:0xe4f4ae,side:THREE.DoubleSide}));
      this.marker.add(dot,ring); this.marker.visible = false; this.scene.add(this.marker);
      this.labels=[...ns.flows,...ns.landforms].map(place=>{
        const button=document.createElement('button');button.className='landform-label';button.textContent=place.name;
        button.setAttribute('aria-label',`Explorar ${place.name}`);
        button.addEventListener('pointerdown',event=>event.stopPropagation());
        button.addEventListener('click',()=>element.dispatchEvent(new CustomEvent('place-request',{detail:place})));
        element.append(button);return {button,place,position:position(place.lat,place.lon,1.004)};
      });
      this.pointers = new Map(); this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.bindInput();
      this.resizeObserver = new ResizeObserver(()=>this.resize()); this.resizeObserver.observe(element); this.resize();
      this.render = this.render.bind(this); this.render();
      this.renderer.domElement.addEventListener('webglcontextlost', event => {
        event.preventDefault(); cancelAnimationFrame(this.frame);
        element.dispatchEvent(new CustomEvent('globe-error',{detail:'Se perdió la conexión gráfica. Recargá la página para recuperar el globo.'}));
      });
    }
    resize() {
      const {width,height} = this.element.getBoundingClientRect();
      this.renderer.setSize(Math.max(1,width),Math.max(1,height));
      this.camera.aspect = Math.max(1,width) / Math.max(1,height);
      this.camera.fov=2*Math.atan(Math.tan(20*radians)/Math.min(1,this.camera.aspect))/radians;
      this.camera.updateProjectionMatrix();
      this.width=width;this.height=height;
    }
    setLayer(name,value){
      this.layers[name]=value;
      if(name!=='labels'){
        const old=this.earth.material.map;this.earth.material.map=makeTexture(this.layers);old.dispose();
      }
    }
    setSelections(items){
      this.selectedItems=items;ns.drawFlows(this,items);
      for(const label of this.labels.filter(l=>l.selectedWater))label.button.remove();
      this.labels=this.labels.filter(l=>!l.selectedWater);
      for(const {place} of items.filter(i=>['river','lake','historical','trade'].includes(i.place.category))){
        if(this.labels.some(l=>l.place.id===place.id))continue;
        const button=document.createElement('button');button.className='landform-label';button.textContent=place.shortName||place.name;button.setAttribute('aria-label','Explorar '+place.name);
        button.addEventListener('pointerdown',e=>e.stopPropagation());button.addEventListener('click',()=>this.element.dispatchEvent(new CustomEvent('place-request',{detail:place})));
        this.element.append(button);this.labels.unshift({button,place,position:position(place.lat,place.lon,1.004),selectedWater:true});
      }
      const ctx=this.selectionCanvas.getContext('2d');ctx.clearRect(0,0,4096,2048);
      const path=d3.geoPath(d3.geoEquirectangular().scale(4096/(2*Math.PI)).translate([2048,1024]),ctx);
      for(const {place,color} of items){
        if(place.selectionType==='flow')continue;
        const shape=place.geometry||d3.geoCircle().center([place.lon,place.lat]).radius(.7).precision(3)();
        ctx.setLineDash(place.category==='trade'?[9,7]:[]);
        ctx.beginPath();path(shape);ctx.fillStyle=color;ctx.globalAlpha=place.geometry?.type==='FeatureCollection' ? .38 : .53;if(place.selectionType!=='line')ctx.fill();
        ctx.strokeStyle=color;ctx.lineWidth=place.selectionType==='line'?5:place.geometry?2.3:3.5;ctx.globalAlpha=1;ctx.stroke();
      }
      ctx.setLineDash([]);ctx.globalAlpha=1;this.selectionTexture.needsUpdate=true;
    }
    frameSelection(items){
      if(!items.length)return;
      if(items.length===1){this.flyTo(items[0].place);return;}
      const center=new THREE.Vector3();items.forEach(({place})=>center.add(position(place.lat,place.lon)));
      const focus=center.length()<.01?position(items[0].place.lat,items[0].place.lon):center.normalize();
      this.flyTo({lat:Math.asin(focus.y)/radians,lon:Math.atan2(-focus.z,focus.x)/radians,scale:3.03});
      this.marker.visible=false;
    }
    drawLabels(){
      const direction=this.camera.position.clone().normalize();const occupied=[];
      for(const label of this.labels){
        const projected=label.position.clone().project(this.camera);
        const x=(projected.x+1)*this.width/2,y=(1-projected.y)*this.height/2;
        const enabled=label.place.selectionType==='flow'?(this.selectedItems||[]).some(i=>i.place.id===label.place.id):this.layers.labels;
        const visible=enabled&&label.position.dot(direction)>1/this.distance+.04&&projected.z<1&&x>90&&x<this.width-90&&y>18&&y<this.height-18&&!occupied.some(p=>Math.abs(p.x-x)<125&&Math.abs(p.y-y)<26);
        label.button.hidden=!visible;
        if(visible){label.button.style.left=x+'px';label.button.style.top=y+'px';occupied.push({x,y});}
      }
    }
    flyTo(place) {
      this.target.lat = place.lat;
      this.target.lon = this.lon + ((place.lon - this.lon + 540) % 360 + 360) % 360 - 180;
      this.target.distance = place.scale || 2.25;
      this.marker.position.copy(position(place.lat,place.lon,1.008));
      this.marker.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),position(place.lat,place.lon));
      this.marker.visible = true;
    }
    world() { this.target = {lat:18,lon:this.lon + ((-25-this.lon+540)%360+360)%360-180,distance:3.03}; this.marker.visible = false; }
    zoomGesture(delta) { if(Number.isFinite(delta)) this.target.distance = THREE.MathUtils.clamp(this.target.distance * Math.exp(-delta),1.3,5); }
    zoom(direction) { this.target.distance = THREE.MathUtils.clamp(this.target.distance * (direction > 0 ? .85 : 1/.85),1.3,5); }
    rotate(dx,dy) { this.target.lon += dx; this.target.lat = THREE.MathUtils.clamp(this.target.lat + dy,-85,85); }
    bindInput() {
      const el = this.element;
      el.addEventListener('pointerdown',event=>{
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        el.focus({preventScroll:true}); el.setPointerCapture(event.pointerId);
        this.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
      });
      el.addEventListener('pointermove',event=>{
        const old = this.pointers.get(event.pointerId); if (!old) return;
        const others = [...this.pointers.entries()].filter(([id])=>id !== event.pointerId);
        if (others.length) {
          const other = others[0][1];
          const before = Math.hypot(old.x-other.x,old.y-other.y), after = Math.hypot(event.clientX-other.x,event.clientY-other.y);
          if (before > 0 && after > 0) this.target.distance = THREE.MathUtils.clamp(this.target.distance * before / after,1.3,5);
        } else { this.rotate(-(event.clientX-old.x)*.28,(event.clientY-old.y)*.28); }
        this.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
      });
      ['pointerup','pointercancel','lostpointercapture'].forEach(type=>el.addEventListener(type,event=>this.pointers.delete(event.pointerId)));
      el.addEventListener('wheel',event=>{event.preventDefault(); this.zoom(event.deltaY < 0 ? 1 : -1);},{passive:false});
      el.addEventListener('keydown',event=>{
        const keys = {'ArrowLeft':[-8,0],'ArrowRight':[8,0],'ArrowUp':[0,8],'ArrowDown':[0,-8]};
        if (keys[event.key]) {event.preventDefault(); this.rotate(...keys[event.key]);}
        else if (['+','=','-','−','Home'].includes(event.key)) {
          event.preventDefault();
          if (event.key === 'Home') el.dispatchEvent(new CustomEvent('world-request'));
          else this.zoom(['+','='].includes(event.key)?1:-1);
        }
      });
    }
    render(time = 0) {
      const dt = Math.min(100,time-(this.lastTime || time)); this.lastTime = time;
      const ease = this.reducedMotion ? 1 : 1-Math.exp(-dt/180);
      this.lat += (this.target.lat-this.lat)*ease; this.lon += (this.target.lon-this.lon)*ease; this.distance += (this.target.distance-this.distance)*ease;
      this.camera.position.copy(position(this.lat,this.lon,this.distance)); this.camera.lookAt(0,0,0);
      this.light.position.copy(this.camera.position).add(new THREE.Vector3(-2,3,1));
      ns.animateFlows(this,dt);
      this.renderer.render(this.scene,this.camera);
      this.drawLabels();
      this.frame = requestAnimationFrame(this.render);
    }
    dispose() { cancelAnimationFrame(this.frame); this.resizeObserver.disconnect(); this.renderer.dispose(); }
  }
  ns.Globe = Globe;
})(window.GH = window.GH || {});
