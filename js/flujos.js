(function(ns){
  const pos=(ll,r=1.012)=>{const a=ll[1]*Math.PI/180,b=ll[0]*Math.PI/180;return new THREE.Vector3(r*Math.cos(a)*Math.cos(b),r*Math.sin(a),-r*Math.cos(a)*Math.sin(b));};
  ns.drawFlows=function(globe,items){
    if(globe.flowGroup){globe.scene.remove(globe.flowGroup);globe.flowGroup.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
    const group=new THREE.Group();globe.flowGroup=group;globe.flowArrows=[];globe.scene.add(group);
    for(const {place} of items.filter(i=>i.place.selectionType==='flow'))for(const path of place.paths){
      const points=[];for(let i=1;i<path.length;i++){const interpolate=d3.geoInterpolate(path[i-1],path[i]);for(let t=0;t<1;t+=.04)points.push(pos(interpolate(t)));}points.push(pos(path.at(-1)));
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),place.category==='wind'?new THREE.LineDashedMaterial({color:place.flowColor,dashSize:.015,gapSize:.009}):new THREE.LineBasicMaterial({color:place.flowColor}));line.computeLineDistances();group.add(line);
      const distances=[0];for(let i=1;i<points.length;i++)distances.push(distances[i-1]+points[i].distanceTo(points[i-1]));
      const length=distances.at(-1),count=Math.max(1,Math.ceil(length/.4));
      for(let i=0;i<count;i++){const arrow=new THREE.Mesh(new THREE.ConeGeometry(.012,.036,8),new THREE.MeshBasicMaterial({color:place.flowColor}));group.add(arrow);globe.flowArrows.push({arrow,points,distances,length,offset:(i+.5)/count});}
    }
    ns.animateFlows(globe,0);
  };
  const up=new THREE.Vector3(0,1,0);
  ns.animateFlows=function(globe,dt){
    if(globe.flowAnimation)globe.flowElapsed=(globe.flowElapsed||0)+dt*.00007;
    for(const item of globe.flowArrows||[]){
      const distance=(item.offset*item.length+(globe.flowElapsed||0))%item.length;
      let low=1,high=item.distances.length-1;
      while(low<high){const mid=(low+high)>>1;if(item.distances[mid]<distance)low=mid+1;else high=mid;}
      const i=low,span=item.distances[i]-item.distances[i-1],t=span?(distance-item.distances[i-1])/span:0;
      item.arrow.position.copy(item.points[i-1]).lerp(item.points[i],t).normalize().multiplyScalar(1.012);
      const tangent=item.points[i].clone().sub(item.points[i-1]).normalize();
      item.arrow.quaternion.setFromUnitVectors(up,tangent);
    }
  };
})(window.GH);
