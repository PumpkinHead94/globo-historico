(function(ns){
  'use strict';
  const palette=['#f17068','#66c9f4','#c794ff','#ffd166','#51ddb2','#f095ca','#b7e36b','#ffae71','#969cff','#49d6d0','#eeb6f5','#a9d5fc'];
  class Selections{
    constructor(){this.items=new Map();}
    add(places){
      for(const place of places){
        if(this.items.has(place.id))continue;
        const used=new Set([...this.items.values()].map(item=>item.color));
        let color=palette.find(color=>!used.has(color));let n=0;
        while(!color){const candidate=`hsl(${(n++*137.508)%360} 78% 66%)`;if(!used.has(candidate))color=candidate;}
        this.items.set(place.id,{place,color:place.flowColor||color});
      }
      return this.values();
    }
    remove(places){places.forEach(p=>this.items.delete(p.id));return this.values();}
    clear(){this.items.clear();}
    values(){return [...this.items.values()];}
  }
  ns.Selections=Selections;
})(window.GH=window.GH||{});
